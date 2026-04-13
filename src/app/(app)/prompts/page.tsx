'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { LoginButton } from '@/components/auth/login-button';
import { getSessionPrompts, removeSessionPrompt } from '@/lib/prompts/session-store';
import type { SavedPrompt, SessionPrompt } from '@/types/prompt';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PromptsPage() {
  const { isLoggedIn, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [sessionPrompts, setSessionPrompts] = useState<SessionPrompt[]>([]);
  const [loading, setLoading] = useState(true);

  // 로그인 사용자: Supabase에서 불러오기
  useEffect(() => {
    if (authLoading) return;
    if (isLoggedIn && user) {
      const supabase = createClient();
      supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          setPrompts(data ?? []);
          setLoading(false);
        });
    } else {
      setSessionPrompts(getSessionPrompts());
      setLoading(false);
    }
  }, [isLoggedIn, user, authLoading]);

  const handleDelete = async (id: string) => {
    if (!confirm('이 프롬프트를 삭제하시겠습니까?')) return;
    const supabase = createClient();
    await supabase.from('prompts').delete().eq('id', id);
    setPrompts(prev => prev.filter(p => p.id !== id));
  };

  const handleDeleteSession = (id: string) => {
    removeSessionPrompt(id);
    setSessionPrompts(prev => prev.filter(p => p.id !== id));
  };

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">저장된 프롬프트</h1>
        <p className="text-sm text-muted-foreground mt-1">
          저장한 프롬프트를 관리하고 다시 사용하세요
        </p>
      </div>

      {/* 비로그인 세션 프롬프트 */}
      {!isLoggedIn && sessionPrompts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">세션 임시 저장 ({sessionPrompts.length}개)</h2>
            <span className="text-[10px] text-muted-foreground">탭을 닫으면 삭제됩니다</span>
          </div>
          {sessionPrompts.map(p => (
            <div key={p.id} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-mono line-clamp-3 mb-3">{p.template}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  {new Date(p.created_at).toLocaleString('ko-KR')}
                </span>
                <button
                  onClick={() => handleDeleteSession(p.id)}
                  className="text-xs text-destructive hover:underline"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 로그인 안내 */}
      {!isLoggedIn && (
        <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border p-8">
          <p className="text-muted-foreground text-sm">로그인하면 프롬프트를 영구 저장하고 관리할 수 있습니다</p>
          <LoginButton />
        </div>
      )}

      {/* 로그인 사용자: 저장된 프롬프트 목록 */}
      {isLoggedIn && prompts.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border p-12">
          <p className="text-muted-foreground">아직 저장된 프롬프트가 없습니다</p>
          <p className="text-sm text-muted-foreground">
            텍스트 생성 또는 이미지 분석 페이지에서 프롬프트를 저장하세요
          </p>
        </div>
      )}

      {isLoggedIn && prompts.length > 0 && (
        <div className="space-y-3">
          {prompts.map(p => (
            <div key={p.id} className="rounded-xl border border-border bg-card p-4 space-y-3 hover:border-muted-foreground/30 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">{p.title}</h3>
                  {p.description && (
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{p.description}</p>
                  )}
                </div>
                <span className="shrink-0 rounded bg-secondary px-2 py-0.5 text-[10px] font-medium">
                  {p.prompt_type === 'text' ? '텍스트' : '이미지'}
                </span>
              </div>

              <p className="text-xs font-mono text-muted-foreground line-clamp-2 bg-muted/50 rounded-md px-3 py-2">
                {p.template}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  {new Date(p.created_at).toLocaleString('ko-KR')}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/prompts/${p.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    상세보기
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-xs text-destructive hover:underline"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
