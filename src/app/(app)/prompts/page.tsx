'use client';

import { useAuth } from '@/hooks/use-auth';
import { LoginButton } from '@/components/auth/login-button';

export default function PromptsPage() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">저장된 프롬프트</h1>
          <p className="text-sm text-muted-foreground mt-1">
            프롬프트를 저장하려면 로그인이 필요합니다
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border p-12">
          <p className="text-muted-foreground">로그인 후 프롬프트를 저장하고 관리할 수 있습니다</p>
          <LoginButton />
        </div>
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

      <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border p-12">
        <p className="text-muted-foreground">아직 저장된 프롬프트가 없습니다</p>
        <p className="text-sm text-muted-foreground">
          텍스트 생성 또는 이미지 분석 페이지에서 프롬프트를 저장하세요
        </p>
      </div>
    </div>
  );
}
