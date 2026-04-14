'use client';

import { useState } from 'react';
import type { ExecutionResult } from '@/types/prompt';
import { RatingControls } from './rating-controls';
import { PermutationSummary } from './permutation-summary';
import { exportSingleResult } from '@/lib/results/export';

/** 리터럴 \n, \t 등을 실제 제어문자로 변환. */
function prettify(text: string): string {
  return text.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
}

export function ResultCard({ result }: { result: ExecutionResult }) {
  const [expanded, setExpanded] = useState(false);
  const [pretty, setPretty] = useState(false);

  const isError = result.status === 'failed';
  const isPending = result.status === 'pending' || result.status === 'running';
  const displayResponse = pretty && result.response ? prettify(result.response) : result.response;

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 ${
        isError ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-card'
      }`}
    >
      {/* 헤더: 인덱스 + 순열 요약 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="rounded bg-secondary px-1.5 py-0.5 font-mono font-semibold">
            #{result.permutation.index + 1}
          </span>
          <span>{result.provider}</span>
          <span>·</span>
          <span>{result.model}</span>
        </div>
        <PermutationSummary permutation={result.permutation} />
      </div>

      {/* 별점 (응답 위) */}
      {!isPending && (
        <div className="flex items-center justify-between border-y border-border/50 py-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            평가
          </span>
          <RatingControls resultId={result.id} currentRating={result.rating} />
        </div>
      )}

      {/* 응답 내용 */}
      {isPending ? (
        <div className="space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">{result.error}</p>
      ) : (
        <div>
          <p className={`text-sm leading-relaxed whitespace-pre-wrap ${expanded ? '' : 'line-clamp-6'}`}>
            {displayResponse}
          </p>
          <div className="mt-1.5 flex items-center gap-3">
            {result.response && result.response.length > 300 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-primary hover:underline"
              >
                {expanded ? '접기' : '더 보기'}
              </button>
            )}
            {result.response && result.response.includes('\\n') && (
              <button
                onClick={() => setPretty(!pretty)}
                className={`text-xs hover:underline ${pretty ? 'text-primary font-medium' : 'text-muted-foreground'}`}
              >
                {pretty ? '원본 보기' : '예쁘게 보기'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 메타 정보 + 개별 저장 버튼 */}
      {!isPending && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            {result.latencyMs && <span>{(result.latencyMs / 1000).toFixed(1)}초</span>}
            {result.usage && (
              <span>{result.usage.promptTokens + result.usage.completionTokens} 토큰</span>
            )}
          </div>
          <button
            onClick={() => exportSingleResult(result)}
            className="rounded-md border border-input px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="이 결과를 JSON으로 저장"
          >
            저장
          </button>
        </div>
      )}
    </div>
  );
}
