'use client';

import { usePromptStore } from '@/stores/prompt-store';

export function RatingControls({ resultId, currentRating }: { resultId: string; currentRating: number | null }) {
  const { updateResultRating } = usePromptStore();

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => updateResultRating(resultId, star)}
          className="p-0.5 transition-colors"
          title={`${star}점`}
        >
          <svg
            className={`h-4 w-4 ${
              currentRating && star <= currentRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-none text-muted-foreground/40'
            }`}
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}
