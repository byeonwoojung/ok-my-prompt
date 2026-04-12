'use client';

import { usePromptStore } from '@/stores/prompt-store';

export function BatchProgress() {
  const { progress } = usePromptStore();
  const total = progress.total || 1;
  const completed = progress.completed + progress.failed;
  const percent = Math.round((completed / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">진행률</span>
        <span className="font-medium">
          {completed}/{total}
          {progress.failed > 0 && (
            <span className="ml-1 text-destructive">({progress.failed} 실패)</span>
          )}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
