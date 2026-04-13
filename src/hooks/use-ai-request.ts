'use client';

import { useCallback } from 'react';
import { usePromptStore } from '@/stores/prompt-store';
import { useAuth } from './use-auth';
import { getSessionApiKeys } from '@/lib/prompts/session-store';
import { generatePermutations } from '@/lib/prompts/permutations';
import type { ExecutionResult, Permutation } from '@/types/prompt';

const CONCURRENCY = 3;

async function fetchStream(
  url: string,
  headers: Record<string, string>,
  body: object,
  onChunk: (text: string) => void,
): Promise<{ fullText: string; error?: string }> {
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...body, stream: true }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new Error(errorData.error?.message ?? `HTTP ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('스트리밍을 사용할 수 없습니다');

  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6);
      if (data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        if (parsed.error) return { fullText, error: parsed.error };
        if (parsed.text) {
          fullText += parsed.text;
          onChunk(fullText);
        }
      } catch { /* skip malformed */ }
    }
  }

  return { fullText };
}

export function useAiRequest() {
  const { isLoggedIn } = useAuth();

  const executePermutations = useCallback(
    async (promptType: 'text' | 'image') => {
      const store = usePromptStore.getState();
      const { template, slots, runMode, provider, model, parameters, batchCount } = store;

      const validSlots = slots
        .filter(s => s.options.some(o => o.trim()))
        .map(s => ({ ...s, options: s.options.filter(o => o.trim()) }));

      let perms: Permutation[];
      if (validSlots.length > 0) {
        perms = generatePermutations(template, validSlots, runMode === 'shuffle');
      } else {
        perms = [{ id: 'perm-0', index: 0, ordering: [], assignment: {}, resolvedPrompt: template }];
      }

      const effectiveBatchCount = runMode === 'batch' ? batchCount : 1;
      const allTasks: { permutation: Permutation; batchIndex: number }[] = [];
      for (const perm of perms) {
        for (let b = 0; b < effectiveBatchCount; b++) {
          allTasks.push({ permutation: perm, batchIndex: b });
        }
      }

      store.clearResults();
      store.setIsRunning(true);
      store.setProgress({ completed: 0, failed: 0, total: allTasks.length });

      const sessionKeys = getSessionApiKeys();
      const apiKey = sessionKeys[provider];

      const queue = [...allTasks];
      const running = new Set<Promise<void>>();

      const runOne = async (task: typeof allTasks[0]) => {
        const start = Date.now();
        const resultId = crypto.randomUUID();

        // 즉시 pending 결과 추가 (스트리밍 텍스트가 여기에 업데이트됨)
        const pendingResult: ExecutionResult = {
          id: resultId,
          permutationId: task.permutation.id,
          permutation: task.permutation,
          status: 'running',
          response: '',
          model,
          provider,
          latencyMs: null,
          usage: null,
          rating: null,
          error: null,
          createdAt: new Date(),
        };
        usePromptStore.getState().addResult(pendingResult);

        try {
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (!isLoggedIn && apiKey) headers['X-API-Key'] = apiKey;

          const { fullText, error } = await fetchStream(
            `/api/ai/${provider}`,
            headers,
            { prompt: task.permutation.resolvedPrompt, model, parameters },
            (streamedText) => {
              // 스트리밍 중 결과 업데이트
              const s = usePromptStore.getState();
              const updated = s.results.map(r =>
                r.id === resultId ? { ...r, response: streamedText } : r
              );
              usePromptStore.setState({ results: updated });
            }
          );

          if (error) throw new Error(error);

          const latencyMs = Date.now() - start;
          const s = usePromptStore.getState();
          usePromptStore.setState({
            results: s.results.map(r =>
              r.id === resultId ? { ...r, status: 'completed' as const, response: fullText, latencyMs } : r
            ),
            progress: { ...s.progress, completed: s.progress.completed + 1 },
          });
        } catch (err) {
          const s = usePromptStore.getState();
          usePromptStore.setState({
            results: s.results.map(r =>
              r.id === resultId ? { ...r, status: 'failed' as const, error: err instanceof Error ? err.message : '알 수 없는 오류', latencyMs: Date.now() - start } : r
            ),
            progress: { ...s.progress, failed: s.progress.failed + 1 },
          });
        }
      };

      while (queue.length > 0 || running.size > 0) {
        while (running.size < CONCURRENCY && queue.length > 0) {
          const task = queue.shift()!;
          const p = runOne(task).finally(() => running.delete(p));
          running.add(p);
        }
        if (running.size > 0) await Promise.race(running);
      }

      usePromptStore.getState().setIsRunning(false);
    },
    [isLoggedIn]
  );

  return { executePermutations };
}
