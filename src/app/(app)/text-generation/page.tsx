'use client';

import { useState, useEffect } from 'react';
import { PromptEditor } from '@/components/prompt/prompt-editor';
import { PlaceholderEditor } from '@/components/prompt/placeholder-editor';
import { RunModeSelector } from '@/components/prompt/run-mode-selector';
import { PromptSaveDialog } from '@/components/prompt/prompt-save-dialog';
import { ModelSelector } from '@/components/model/model-selector';
import { ParameterPanel } from '@/components/model/parameter-panel';
import { CostEstimate } from '@/components/results/cost-estimate';
import { ResultsGrid } from '@/components/results/results-grid';
import { BatchProgress } from '@/components/results/batch-progress';
import { usePromptStore } from '@/stores/prompt-store';
import { useAiRequest } from '@/hooks/use-ai-request';

export default function TextGenerationPage() {
  const {
    template,
    slots,
    detectedSlots,
    isRunning,
    results,
    batchCount,
    setBatchCount,
    clearResults,
  } = usePromptStore();

  const { executePermutations } = useAiRequest();

  const [batchInput, setBatchInput] = useState('1');

  useEffect(() => {
    clearResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <RunModeSelector batchInput={batchInput} setBatchInput={setBatchInput} />

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
