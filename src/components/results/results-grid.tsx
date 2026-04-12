'use client';

import { usePromptStore } from '@/stores/prompt-store';
import { ResultCard } from './result-card';
import { RatingControls } from './rating-controls';

export function ResultsGrid() {
  const { results, viewMode, setViewMode, clearResults } = usePromptStore();

  if (results.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">결과 ({results.length}개)</h2>
        <div className="flex items-center gap-2">
          {/* 뷰 모드 토글 */}
          <div className="flex rounded-lg border border-input overflow-hidden">
            {(['grid', 'table'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:bg-accent'
                }`}
              >
                {mode === 'grid' ? '그리드' : '테이블'}
              </button>
            ))}
          </div>

          {/* 내보내기 */}
          <button
            onClick={() => {
              const data = results.map(r => ({
                index: r.permutation.index,
                prompt: r.permutation.resolvedPrompt,
                assignment: r.permutation.assignment,
                response: r.response,
                status: r.status,
                latencyMs: r.latencyMs,
                tokens: r.usage ? r.usage.promptTokens + r.usage.completionTokens : null,
                rating: r.rating,
                error: r.error,
              }));
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `prompt-results-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="rounded-md border border-input px-3 py-1 text-xs font-medium transition-colors hover:bg-accent"
          >
            내보내기
          </button>

          <button
            onClick={clearResults}
            className="rounded-md border border-input px-3 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            지우기
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left font-medium">#</th>
                <th className="px-4 py-2 text-left font-medium">프롬프트</th>
                <th className="px-4 py-2 text-left font-medium">응답</th>
                <th className="px-4 py-2 text-left font-medium">지연</th>
                <th className="px-4 py-2 text-left font-medium">평점</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-2 text-muted-foreground">{r.permutation.index + 1}</td>
                  <td className="px-4 py-2 max-w-xs truncate">{r.permutation.resolvedPrompt}</td>
                  <td className="px-4 py-2 max-w-sm">
                    {r.status === 'failed' ? (
                      <span className="text-destructive">{r.error}</span>
                    ) : (
                      <span className="line-clamp-2">{r.response}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {r.latencyMs ? `${(r.latencyMs / 1000).toFixed(1)}초` : '-'}
                  </td>
                  <td className="px-4 py-2">
                    <RatingControls resultId={r.id} currentRating={r.rating} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
