'use client';

import { useCallback } from 'react';
import { usePromptStore } from '@/stores/prompt-store';
import { useAuth } from './use-auth';
import { getSessionApiKeys } from '@/lib/prompts/session-store';
import { generatePermutations } from '@/lib/prompts/permutations';
import type { ExecutionResult, Permutation } from '@/types/prompt';

const CONCURRENCY = 3;

export function useAiRequest() {
  const { isLoggedIn } = useAuth();

  const executePermutations = useCallback(
    async (promptType: 'text' | 'image') => {
      const store = usePromptStore.getState();
      const { template, slots, runMode, provider, model, parameters, batchCount } = store;

      // 유효한 옵션만 필터링 (빈 문자열 제거)
      const validSlots = slots
        .filter(s => s.options.some(o => o.trim()))
        .map(s => ({ ...s, options: s.options.filter(o => o.trim()) }));

      // 순열 생성
      let perms: Permutation[];
      if (validSlots.length > 0) {
        perms = generatePermutations(template, validSlots, runMode === 'shuffle');
      } else {
        perms = [{
          id: 'perm-0',
          index: 0,
          ordering: [],
          assignment: {},
          resolvedPrompt: template,
        }];
      }

      // 배치 모드일 때만 복제, 순서 섞기 모드에서는 1회씩
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

        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };

          if (!isLoggedIn && apiKey) {
            headers['X-API-Key'] = apiKey;
          }

          const res = await fetch(`/api/ai/${provider}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              prompt: task.permutation.resolvedPrompt,
              model,
              parameters,
            }),
          });

          const latencyMs = Date.now() - start;

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: { message: res.statusText } }));
            throw new Error(errorData.error?.message ?? `HTTP ${res.status}`);
          }

          const data = await res.json();

          const result: ExecutionResult = {
            id: resultId,
            permutationId: task.permutation.id,
            permutation: task.permutation,
            status: 'completed',
            response: data.text,
            model: data.model ?? model,
            provider,
            latencyMs,
            usage: data.tokens ? {
              promptTokens: data.tokens.prompt,
              completionTokens: data.tokens.completion,
            } : null,
            rating: null,
            error: null,
            createdAt: new Date(),
          };

          usePromptStore.getState().addResult(result);
          usePromptStore.getState().setProgress({
            ...usePromptStore.getState().progress,
            completed: usePromptStore.getState().progress.completed + 1,
          });
        } catch (err) {
          const result: ExecutionResult = {
            id: resultId,
            permutationId: task.permutation.id,
            permutation: task.permutation,
            status: 'failed',
            response: null,
            model,
            provider,
            latencyMs: Date.now() - start,
            usage: null,
            rating: null,
            error: err instanceof Error ? err.message : '알 수 없는 오류',
            createdAt: new Date(),
          };

          usePromptStore.getState().addResult(result);
          usePromptStore.getState().setProgress({
            ...usePromptStore.getState().progress,
            failed: usePromptStore.getState().progress.failed + 1,
          });
        }
      };

      while (queue.length > 0 || running.size > 0) {
        while (running.size < CONCURRENCY && queue.length > 0) {
          const task = queue.shift()!;
          const p = runOne(task).finally(() => running.delete(p));
          running.add(p);
        }
        if (running.size > 0) {
          await Promise.race(running);
        }
      }

      usePromptStore.getState().setIsRunning(false);
    },
    [isLoggedIn]
  );

  return { executePermutations };
}
