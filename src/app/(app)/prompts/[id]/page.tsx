'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { usePromptStore } from '@/stores/prompt-store';
import type { SavedPrompt } from '@/types/prompt';
import type { AIProvider } from '@/types/ai';

export default function PromptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [prompt, setPrompt] = useState<SavedPrompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (authLoading || !user) return;
    const supabase = createClient();
    supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          router.push('/prompts');
          return;
        }
        setPrompt(data as SavedPrompt);
        setTitle(data.title);
        setDescription(data.description ?? '');
        setLoading(false);
      });
  }, [id, user, authLoading, router]);

  const handleSave = async () => {
    if (!prompt) return;
    const supabase = createClient();
    await supabase
      .from('prompts')
      .update({ title: title.trim(), description: description.trim() || null, updated_at: new Date().toISOString() })
      .eq('id', prompt.id);
    setPrompt({ ...prompt, title: title.trim(), description: description.trim() || null });
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!prompt || !confirm('이 프롬프트를 삭제하시겠습니까?')) return;
    const supabase = createClient();
    await supabase.from('prompts').delete().eq('id', prompt.id);
    router.push('/prompts');
  };

  const handleUse = () => {
    if (!prompt) return;
    const store = usePromptStore.getState();
    store.setTemplate(prompt.template);
    if (prompt.model_config) {
      store.setProvider(prompt.model_config.provider as AIProvider);
      store.setModel(prompt.model_config.model);
      if (prompt.model_config.parameters) {
        Object.entries(prompt.model_config.parameters).forEach(([key, value]) => {
          store.setParameter(key, value as number);
        });
      }
    }
    // 플레이스홀더 옵션 복원
    if (prompt.placeholders) {
      (prompt.placeholders as Array<{ name: string; options: string[] }>).forEach(slot => {
        store.updateSlotOptions(slot.name, slot.options);
      });
    }
    router.push(prompt.prompt_type === 'image' ? '/image-analysis' : '/text-generation');
  };

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!prompt) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="space-y-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="설명 (선택)"
                rows={2}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{prompt.title}</h1>
              {prompt.description && (
                <p className="text-sm text-muted-foreground mt-1">{prompt.description}</p>
              )}
            </>
          )}
        </div>
        <span className="shrink-0 rounded bg-secondary px-2 py-0.5 text-xs font-medium">
          {prompt.prompt_type === 'text' ? '텍스트' : '이미지'}
        </span>
      </div>

      {/* 프롬프트 내용 */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
        <label className="text-sm font-medium">프롬프트 템플릿</label>
        <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm font-mono whitespace-pre-wrap">
          {prompt.template}
        </div>
      </div>

      {/* 플레이스홀더 */}
      {prompt.placeholders && (prompt.placeholders as Array<{ name: string; options: string[] }>).length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <label className="text-sm font-medium">플레이스홀더 옵션</label>
          {(prompt.placeholders as Array<{ name: string; options: string[] }>).map(slot => (
            <div key={slot.name} className="space-y-1">
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-mono font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                {'{{$' + slot.name + '}}'}
              </span>
              <div className="flex flex-wrap gap-1 ml-2">
                {slot.options.map((opt, i) => (
                  <span key={i} className="rounded bg-secondary px-2 py-0.5 text-xs">{opt}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 모델 설정 */}
      {prompt.model_config && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <label className="text-sm font-medium">모델 설정</label>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded bg-secondary px-2 py-1">{prompt.model_config.provider}</span>
            <span className="rounded bg-secondary px-2 py-1">{prompt.model_config.model}</span>
            {prompt.model_config.parameters && Object.entries(prompt.model_config.parameters).map(([k, v]) => (
              <span key={k} className="rounded bg-secondary px-2 py-1">{k}: {String(v)}</span>
            ))}
          </div>
        </div>
      )}

      {/* 메타 정보 */}
      <div className="text-xs text-muted-foreground">
        생성: {new Date(prompt.created_at).toLocaleString('ko-KR')}
        {prompt.updated_at !== prompt.created_at && (
          <> · 수정: {new Date(prompt.updated_at).toLocaleString('ko-KR')}</>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleUse}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          이 프롬프트 사용하기
        </button>
        {editing ? (
          <>
            <button
              onClick={handleSave}
              className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              저장
            </button>
            <button
              onClick={() => { setEditing(false); setTitle(prompt.title); setDescription(prompt.description ?? ''); }}
              className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
            >
              취소
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
          >
            수정
          </button>
        )}
        <button
          onClick={handleDelete}
          className="rounded-lg border border-destructive/30 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
