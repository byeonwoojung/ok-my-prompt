'use client';

import { usePromptStore } from '@/stores/prompt-store';
import { PermutationPreview } from './permutation-preview';

interface RunModeSelectorProps {
  batchInput: string;
  setBatchInput: (v: string) => void;
}

export function RunModeSelector({ batchInput, setBatchInput }: RunModeSelectorProps) {
  const { runMode, setRunMode, detectedSlots, batchCount, setBatchCount } = usePromptStore();

  if (detectedSlots.length === 0) return null;

  const handleBatchInputChange = (val: string) => {
    setBatchInput(val);
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 1) {
      setBatchCount(n);
    }
  };

  return (
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
  );
}
