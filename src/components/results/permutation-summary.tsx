'use client';

import { useState } from 'react';
import type { Permutation } from '@/types/prompt';

/**
 * 순열(플레이스홀더 조합) 요약 표시.
 * - 플레이스홀더가 있으면: 각 {변수명: 값} 쌍을 칩으로 나열
 * - 없으면: resolvedPrompt 전체를 접힘/펼침 블록으로 표시
 */
export function PermutationSummary({ permutation }: { permutation: Permutation }) {
  const entries = Object.entries(permutation.assignment);
  const hasPlaceholders = entries.length > 0;

  if (hasPlaceholders) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {entries.map(([key, val]) => (
          <span
            key={key}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/50 px-2 py-0.5 text-[11px]"
          >
            <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
              {`{{$${key}}}`}
            </span>
            <span className="text-muted-foreground">=</span>
            <span className="font-medium">{val}</span>
          </span>
        ))}
      </div>
    );
  }

  return <RawPromptBlock text={permutation.resolvedPrompt} />;
}

function RawPromptBlock({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 200;

  return (
    <div className="rounded-md bg-muted/50 px-3 py-2">
      <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        프롬프트
      </div>
      <pre className={`text-xs leading-relaxed whitespace-pre-wrap font-mono ${expanded ? '' : 'line-clamp-3'}`}>
        {text}
      </pre>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-[10px] text-primary hover:underline"
        >
          {expanded ? '접기' : '더 보기'}
        </button>
      )}
    </div>
  );
}
