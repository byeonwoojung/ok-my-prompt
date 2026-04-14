'use client';

import { useState, useRef, useEffect, Fragment } from 'react';
import { usePromptStore } from '@/stores/prompt-store';
import { ResultCard } from './result-card';
import { RatingControls } from './rating-controls';
import { PermutationSummary } from './permutation-summary';
import { exportAllAsSingleJson, exportAllAsZip, exportSingleResult } from '@/lib/results/export';
import type { ExecutionResult } from '@/types/prompt';

export function ResultsGrid() {
  const { results, viewMode, setViewMode, clearResults } = usePromptStore();
  const [saveMenuOpen, setSaveMenuOpen] = useState(false);
  const saveMenuRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 저장 메뉴 닫기
  useEffect(() => {
    if (!saveMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (saveMenuRef.current && !saveMenuRef.current.contains(e.target as Node)) {
        setSaveMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [saveMenuOpen]);

  if (results.length === 0) return null;

  const handleSaveSingle = () => {
    exportAllAsSingleJson(results);
    setSaveMenuOpen(false);
  };

  const handleSaveZip = async () => {
    await exportAllAsZip(results);
    setSaveMenuOpen(false);
  };

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

          {/* JSON 저장 (드롭다운) */}
          <div className="relative" ref={saveMenuRef}>
            <button
              onClick={() => setSaveMenuOpen(v => !v)}
              className="rounded-md border border-input px-3 py-1 text-xs font-medium transition-colors hover:bg-accent"
            >
              JSON 저장 ▾
            </button>
            {saveMenuOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 w-48 overflow-hidden rounded-md border border-border bg-popover shadow-md">
                <button
                  onClick={handleSaveSingle}
                  className="block w-full px-3 py-2 text-left text-xs hover:bg-accent"
                >
                  <div className="font-medium">하나의 JSON</div>
                  <div className="text-[10px] text-muted-foreground">전체 결과를 배열로 묶기</div>
                </button>
                <button
                  onClick={handleSaveZip}
                  className="block w-full border-t border-border px-3 py-2 text-left text-xs hover:bg-accent"
                >
                  <div className="font-medium">각각 JSON (ZIP)</div>
                  <div className="text-[10px] text-muted-foreground">파일별로 묶어 다운로드</div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => { if (confirm('모든 결과를 지우시겠습니까?')) clearResults(); }}
            className="rounded-md border border-input px-3 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            지우기
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="flex flex-col gap-4">
          {results.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>
      ) : (
        <ResultsTable />
      )}
    </div>
  );
}

function ResultsTable() {
  const { results } = usePromptStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="w-8 px-2 py-2"></th>
            <th className="px-4 py-2 text-left font-medium">#</th>
            <th className="px-4 py-2 text-left font-medium">프롬프트 / 변수</th>
            <th className="px-4 py-2 text-left font-medium">응답</th>
            <th className="px-4 py-2 text-left font-medium">지연</th>
            <th className="px-4 py-2 text-left font-medium">평점</th>
            <th className="px-4 py-2 text-right font-medium">저장</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => {
            const isExpanded = expandedId === r.id;
            const isError = r.status === 'failed';
            const summaryEntries = Object.entries(r.permutation.assignment);
            const promptPreview = summaryEntries.length > 0
              ? summaryEntries.map(([k, v]) => `${k}=${v}`).join(', ')
              : r.permutation.resolvedPrompt;

            return (
              <Fragment key={r.id}>
                <tr
                  className={`border-t border-border transition-colors ${isExpanded ? 'bg-accent/30' : 'hover:bg-accent/20'}`}
                >
                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : r.id)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                      title={isExpanded ? '접기' : '펼치기'}
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{r.permutation.index + 1}</td>
                  <td className="px-4 py-2 max-w-xs truncate" title={promptPreview}>
                    {promptPreview}
                  </td>
                  <td className="px-4 py-2 max-w-sm">
                    {isError ? (
                      <span className="text-destructive line-clamp-2">{r.error}</span>
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
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => exportSingleResult(r)}
                      className="rounded-md border border-input px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                      title="이 결과만 JSON 저장"
                    >
                      저장
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="border-t border-border bg-accent/10" key={`${r.id}-expanded`}>
                    <td colSpan={7} className="px-4 py-4">
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="space-y-2">
                          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            프롬프트
                          </div>
                          <PermutationSummary permutation={r.permutation} />
                          {summaryEntries.length > 0 && (
                            <pre className="mt-2 max-h-96 overflow-auto rounded-md bg-muted/50 p-3 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                              {r.permutation.resolvedPrompt}
                            </pre>
                          )}
                        </div>
                        <ExpandedResponse result={r} />
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ExpandedResponse({ result }: { result: ExecutionResult }) {
  const [pretty, setPretty] = useState(false);
  const isError = result.status === 'failed';
  const hasEscapedNewlines = result.response?.includes('\\n') ?? false;
  const displayText = pretty && result.response
    ? result.response.replace(/\\n/g, '\n').replace(/\\t/g, '\t')
    : result.response;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        <span>
          응답 {result.usage && (
            <span className="ml-1 normal-case text-muted-foreground/70">
              ({result.usage.promptTokens + result.usage.completionTokens} 토큰)
            </span>
          )}
        </span>
        {hasEscapedNewlines && (
          <button
            onClick={() => setPretty(!pretty)}
            className={`rounded px-1.5 py-0.5 normal-case transition-colors ${
              pretty ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            예쁘게 보기
          </button>
        )}
      </div>
      {isError ? (
        <pre className="rounded-md bg-destructive/10 p-3 text-xs text-destructive whitespace-pre-wrap">
          {result.error}
        </pre>
      ) : (
        <pre className="max-h-96 overflow-auto rounded-md bg-muted/50 p-3 text-xs leading-relaxed whitespace-pre-wrap">
          {displayText}
        </pre>
      )}
    </div>
  );
}
