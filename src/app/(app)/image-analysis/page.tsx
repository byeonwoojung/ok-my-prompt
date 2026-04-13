'use client';

import { useState } from 'react';
import { ImageUpload } from '@/components/image/image-upload';
import { ModelSelector } from '@/components/model/model-selector';
import { ParameterPanel } from '@/components/model/parameter-panel';
import { ResultCard } from '@/components/results/result-card';
import { BatchProgress } from '@/components/results/batch-progress';
import { usePromptStore } from '@/stores/prompt-store';
import { useAuth } from '@/hooks/use-auth';
import { getSessionApiKeys } from '@/lib/prompts/session-store';
import { PROVIDERS } from '@/lib/constants';
import type { ExecutionResult } from '@/types/prompt';

export default function ImageAnalysisPage() {
  const { provider, model, parameters } = usePromptStore();
  const { isLoggedIn } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ExecutionResult[]>([]);

  const currentModel = PROVIDERS[provider].models.find(m => m.id === model);
  const supportsImages = currentModel?.supportsImages ?? false;

  const canRun = image && prompt.trim() && supportsImages;

  const handleRun = async () => {
    if (!canRun) return;
    setIsRunning(true);

    const sessionKeys = getSessionApiKeys();
    const apiKey = sessionKeys[provider];
    const start = Date.now();

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (!isLoggedIn && apiKey) headers['X-API-Key'] = apiKey;

      const res = await fetch(`/api/ai/${provider}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt,
          model,
          parameters,
          image_base64: image,
        }),
      });

      const latencyMs = Date.now() - start;

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: { message: res.statusText } }));
        throw new Error(errorData.error?.message ?? `HTTP ${res.status}`);
      }

      const data = await res.json();

      setResults(prev => [...prev, {
        id: crypto.randomUUID(),
        permutationId: 'single',
        permutation: { id: 'single', index: prev.length, ordering: [], assignment: {}, resolvedPrompt: prompt },
        status: 'completed',
        response: data.text,
        model: data.model ?? model,
        provider,
        latencyMs,
        usage: data.tokens ? { promptTokens: data.tokens.prompt, completionTokens: data.tokens.completion } : null,
        rating: null,
        error: null,
        createdAt: new Date(),
      }]);
    } catch (err) {
      setResults(prev => [...prev, {
        id: crypto.randomUUID(),
        permutationId: 'single',
        permutation: { id: 'single', index: prev.length, ordering: [], assignment: {}, resolvedPrompt: prompt },
        status: 'failed',
        response: null,
        model,
        provider,
        latencyMs: Date.now() - start,
        usage: null,
        rating: null,
        error: err instanceof Error ? err.message : '알 수 없는 오류',
        createdAt: new Date(),
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">이미지 분석</h1>
        <p className="text-sm text-muted-foreground mt-1">
          이미지와 프롬프트를 함께 보내서 AI 비전 모델을 테스트하세요
        </p>
      </div>

      {/* 모델 설정 */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <ModelSelector />
        {!supportsImages && (
          <div className="rounded-md bg-yellow-500/10 px-3 py-2 text-xs text-yellow-600 dark:text-yellow-400">
            선택한 모델({currentModel?.name})은 이미지를 지원하지 않습니다. 이미지 지원 모델을 선택하세요.
          </div>
        )}
        <ParameterPanel />
      </div>

      {/* 이미지 업로드 */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <label className="text-sm font-medium">이미지</label>
        <ImageUpload image={image} onImageChange={setImage} />
      </div>

      {/* 프롬프트 입력 */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
        <label className="text-sm font-medium">프롬프트</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="이 이미지에 대해 설명해주세요."
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono"
        />
      </div>

      {/* 실행 */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleRun}
          disabled={!canRun || isRunning}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? '분석 중...' : '실행'}
        </button>
        {results.length > 0 && (
          <button
            onClick={() => setResults([])}
            className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
          >
            결과 지우기
          </button>
        )}
      </div>

      {/* 결과 */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">결과 ({results.length}개)</h2>
          {results.map((r) => (
            <ResultCard key={r.id} result={r} />
          ))}
        </div>
      )}
    </div>
  );
}
