'use client';

import { useMemo } from 'react';
import { usePromptStore } from '@/stores/prompt-store';
import { computeStats } from '@/lib/prompts/permutations';

export function PermutationPreview() {
  const { slots, runMode, permutations } = usePromptStore();

  const validSlots = slots.filter(s => s.options.some(o => o.trim()));

  const stats = useMemo(
    () => computeStats(
      validSlots.map(s => ({ ...s, options: s.options.filter(o => o.trim()) })),
      runMode === 'shuffle'
    ),
    [validSlots, runMode]
  );

  if (validSlots.length === 0) return null;

  const displayPerms = permutations.filter(p => p.resolvedPrompt.trim());

  return (
    <div className="space-y-3">
      {/* 통계 */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        {runMode === 'shuffle' && validSlots.length > 1 && (
          <span className="text-muted-foreground">
            위치 순서 <strong className="text-foreground">{stats.totalPositionOrders}</strong>가지
          </span>
        )}
        <span className="text-muted-foreground">
          옵션 조합 <strong className="text-foreground">{stats.totalValueCombinations}</strong>가지
        </span>
        <span className={`font-semibold ${stats.exceedsCap ? 'text-destructive' : stats.exceedsWarningThreshold ? 'text-yellow-600 dark:text-yellow-400' : 'text-foreground'}`}>
          총 {stats.totalPermutations.toLocaleString()}개 실행
        </span>
      </div>

      {stats.exceedsWarningThreshold && !stats.exceedsCap && (
        <div className="rounded-md bg-yellow-500/10 px-3 py-2 text-xs text-yellow-600 dark:text-yellow-400">
          경우의 수가 많습니다. 옵션 수를 줄이는 것을 고려하세요.
        </div>
      )}

      {stats.exceedsCap && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
          경우의 수가 500개를 초과합니다. 옵션 수를 줄여주세요.
        </div>
      )}

      {/* 미리보기 카드 리스트 */}
      {displayPerms.length > 0 && (
        <div className="space-y-1.5 max-h-80 overflow-y-auto">
          {displayPerms.slice(0, 30).map((p) => (
            <div
              key={p.id}
              className="rounded-lg border border-border bg-muted/30 px-3 py-2"
            >
              <div className="flex items-start gap-2">
                <span className="shrink-0 text-[10px] text-muted-foreground/50 font-mono mt-0.5 w-5 text-right">
                  {p.index + 1}
                </span>
                <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">
                  {p.resolvedPrompt}
                </p>
              </div>
            </div>
          ))}
          {displayPerms.length > 30 && (
            <div className="text-center text-xs text-muted-foreground py-2">
              외 {displayPerms.length - 30}개 더...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
