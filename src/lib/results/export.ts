import JSZip from 'jszip';
import type { ExecutionResult } from '@/types/prompt';

/** JSON 내보내기용으로 결과 객체를 정규화 (민감하지 않은 필드만). */
function serializeResult(r: ExecutionResult) {
  return {
    index: r.permutation.index,
    provider: r.provider,
    model: r.model,
    assignment: r.permutation.assignment,
    resolvedPrompt: r.permutation.resolvedPrompt,
    response: r.response,
    status: r.status,
    latencyMs: r.latencyMs,
    usage: r.usage,
    rating: r.rating,
    error: r.error,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
  };
}

/** 파일명에 사용할 수 없는 문자를 '_'로 치환. */
function safeFilename(s: string): string {
  return s.replace(/[\/\\:*?"<>|]/g, '_').slice(0, 80);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** 개별 결과 하나를 JSON 파일로 다운로드. */
export function exportSingleResult(r: ExecutionResult) {
  const data = serializeResult(r);
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const filename = `result-${r.permutation.index}-${safeFilename(r.permutation.id)}-${timestamp}.json`;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  triggerDownload(blob, filename);
}

/** 전체 결과를 단일 JSON 배열로 다운로드. */
export function exportAllAsSingleJson(results: ExecutionResult[]) {
  const data = results.map(serializeResult);
  const timestamp = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  triggerDownload(blob, `prompt-results-${timestamp}.json`);
}

/** 전체 결과를 각 파일로 분리해 하나의 ZIP으로 묶어 다운로드. */
export async function exportAllAsZip(results: ExecutionResult[]) {
  const zip = new JSZip();
  const timestamp = new Date().toISOString().slice(0, 10);
  const folder = zip.folder(`prompt-results-${timestamp}`) ?? zip;

  results.forEach((r) => {
    const data = serializeResult(r);
    const filename = `result-${String(r.permutation.index).padStart(3, '0')}-${safeFilename(r.permutation.id)}.json`;
    folder.file(filename, JSON.stringify(data, null, 2));
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  triggerDownload(blob, `prompt-results-${timestamp}.zip`);
}
