'use client';

import { useState } from 'react';
import type { Permutation } from '@/types/prompt';

export function PermutationSummary({ permutation }: { permutation: Permutation }) {
  const entries = Object.entries(permutation.assignment);
  const hasPlaceholders = entries.length > 0;

  if (hasPlaceholders) {
    return (
      <div className="flex flex-wrap gap-3">
        {entries.map(([key, val]) => (
          <div key={key} className="space-y-0.5">
            <div className="font-mono text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              {`{{$${key}}}`}
            </div>
            <div className="text-sm font-medium">{val}</div>
          </div>
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
