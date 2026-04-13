'use client';

import { useState, useEffect, useCallback } from 'react';
import { PromptEditor } from '@/components/prompt/prompt-editor';
import { PlaceholderEditor } from '@/components/prompt/placeholder-editor';
import { PermutationPreview } from '@/components/prompt/permutation-preview';
import { PromptSaveDialog } from '@/components/prompt/prompt-save-dialog';
import { ModelSelector } from '@/components/model/model-selector';
import { ParameterPanel } from '@/components/model/parameter-panel';
import { CostEstimate } from '@/components/results/cost-estimate';
import { ResultsGrid } from '@/components/results/results-grid';
import { BatchProgress } from '@/components/results/batch-progress';
import { usePromptStore } from '@/stores/prompt-store';
import { useAiRequest } from '@/hooks/use-ai-request';
import type { RunMode } from '@/stores/prompt-store';

export default function TextGenerationPage() {
  const {
    template,
    slots,
    detectedSlots,
    runMode,
    setRunMode,
    isRunning,
    results,
    batchCount,
    setBatchCount,
  } = usePromptStore();

  const { executePermutations } = useAiRequest();

  const [batchInput, setBatchInput] = useState('1');

  const hasValidSlots = slots.some(s => s.options.some(o => o.trim()));
  const canRun = template.trim().length > 0 && (detectedSlots.length === 0 || hasValidSlots);

  const handleBatchInputChange = (val: string) => {
    setBatchInput(val);
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 1) {
      setBatchCount(n);
    }
  };

  // 키보드 단축키: Cmd+Enter=실행, Cmd+S=저장
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'Enter' && canRun && !isRunning) {
          e.preventDefault();
          executePermutations('text');
        }
        if (e.key === 's') {
          e.preventDefault();
          // 저장 다이얼로그 트리거: 커스텀 이벤트
          window.dispatchEvent(new CustomEvent('open-save-dialog'));
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [canRun, isRunning, executePermutations]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">텍스트 생성</h1>
        <p className="text-sm text-muted-foreground mt-1">
          프롬프트를 입력하고 다양한 AI 모델로 테스트하세요
        </p>
      </div>

      {/* 모델 + 파라미터 설정 */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <ModelSelector />
        <ParameterPanel />
      </div>

      {/* 프롬프트 에디터 */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <PromptEditor />
        {detectedSlots.length > 0 && <PlaceholderEditor />}
      </div>

      {/* 실행 모드 선택 (플레이스홀더가 있을 때만) */}
      {detectedSlots.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <div className="flex items-center gap-1">
            <h3 className="text-sm font-medium">실행 모드</h3>
            <span className="text-xs text-muted-foreground">— 둘 중 하나를 선택하세요</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* 배치 모드 */}
            <button
              onClick={() => setRunMode('batch')}
              className={`rounded-lg border-2 p-4 text-left transition-colors ${
                runMode === 'batch'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                  runMode === 'batch' ? 'border-primary' : 'border-muted-foreground/40'
                }`}>
                  {runMode === 'batch' && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <span className="text-sm font-semibold">배치 실행</span>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                각 옵션 조합을 N번씩 반복 실행하여 응답의 다양성을 확인합니다.
              </p>
              {runMode === 'batch' && (
                <div className="mt-3 ml-6 flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">반복 횟수:</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={batchInput}
                    onChange={(e) => handleBatchInputChange(e.target.value)}
                    onBlur={() => {
                      const n = parseInt(batchInput, 10);
                      if (isNaN(n) || n < 1) {
                        setBatchInput('1');
                        setBatchCount(1);
                      } else {
                        setBatchInput(String(Math.min(50, n)));
                        setBatchCount(Math.min(50, n));
                      }
                    }}
                    className="w-16 rounded-md border border-input bg-background px-2 py-1 text-sm text-center font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-xs text-muted-foreground">회</span>
                </div>
              )}
            </button>

            {/* 순서 섞기 모드 */}
            <button
              onClick={() => setRunMode('shuffle')}
              className={`rounded-lg border-2 p-4 text-left transition-colors ${
                runMode === 'shuffle'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                  runMode === 'shuffle' ? 'border-primary' : 'border-muted-foreground/40'
                }`}>
                  {runMode === 'shuffle' && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <span className="text-sm font-semibold">순서 섞기</span>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                플레이스홀더들의 위치를 서로 바꿔서 모든 순서 조합까지 테스트합니다.
                {detectedSlots.length < 2 && (
                  <span className="block mt-1 text-yellow-600 dark:text-yellow-400">
                    (플레이스홀더가 2개 이상이어야 효과가 있습니다)
                  </span>
                )}
              </p>
            </button>
          </div>

          {/* 순열 미리보기 */}
          <PermutationPreview />
        </div>
      )}

      {/* 실행 컨트롤 */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => executePermutations('text')}
          disabled={!canRun || isRunning}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? '실행 중...' : detectedSlots.length > 0 ? '전체 실행' : '실행'}
        </button>

        {/* 배치 (플레이스홀더 없을 때) */}
        {detectedSlots.length === 0 && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">배치</label>
            <input
              type="number"
              min={1}
              max={50}
              value={batchInput}
              onChange={(e) => handleBatchInputChange(e.target.value)}
              onBlur={() => {
                const n = parseInt(batchInput, 10);
                if (isNaN(n) || n < 1) {
                  setBatchInput('1');
                  setBatchCount(1);
                }
              }}
              className="w-16 rounded-md border border-input bg-background px-2 py-1.5 text-sm text-center font-mono focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <span className="text-sm text-muted-foreground">회</span>
          </div>
        )}

        <PromptSaveDialog />

        <div className="ml-auto">
          <CostEstimate />
        </div>
      </div>

      {/* 진행률 */}
      {isRunning && <BatchProgress />}

      {/* 결과 */}
      {results.length > 0 && <ResultsGrid />}
    </div>
  );
}
