'use client';

import { useState } from 'react';
import type { ExecutionResult } from '@/types/prompt';
import { RatingControls } from './rating-controls';

export function ResultCard({ result }: { result: ExecutionResult }) {
  const [expanded, setExpanded] = useState(false);

  const isError = result.status === 'failed';
  const isPending = result.status === 'pending' || result.status === 'running';

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 ${
        isError
          ? 'border-destructive/30 bg-destructive/5'
          : 'border-border bg-card'
      }`}
    >
      {/* 헤더: 순열 정보 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {Object.entries(result.permutation.assignment).map(([key, val]) => (
            <span
              key={key}
              className="inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium"
            >
              {key}={val}
            </span>
          ))}
        </div>
        <RatingControls resultId={result.id} currentRating={result.rating} />
      </div>

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
          <p className={`text-sm leading-relaxed whitespace-pre-wrap ${expanded ? '' : 'line-clamp-4'}`}>
            {result.response}
          </p>
          {result.response && result.response.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 text-xs text-primary hover:underline"
            >
              {expanded ? '접기' : '더 보기'}
            </button>
          )}
        </div>
      )}

      {/* 메타 정보 */}
      {!isPending && !isError && (
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          {result.latencyMs && (
            <span>{(result.latencyMs / 1000).toFixed(1)}초</span>
          )}
          {result.usage && (
            <span>
              {result.usage.promptTokens + result.usage.completionTokens} 토큰
            </span>
          )}
        </div>
      )}
    </div>
  );
}
