'use client';

import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

export function UserMenu() {
  const { user, loading, signOut, isLoggedIn } = useAuth();

  if (loading) {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
    );
  }

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
      >
        로그인
      </Link>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-2">
        {user?.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="프로필"
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
            {user?.user_metadata?.full_name?.[0] ?? user?.email?.[0] ?? '?'}
          </div>
        )}
      </button>

      <div className="absolute right-0 top-full mt-2 hidden w-48 rounded-lg border border-border bg-card p-1 shadow-lg group-hover:block">
        <div className="px-3 py-2 text-sm">
          <p className="font-medium truncate">
            {user?.user_metadata?.full_name ?? '사용자'}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {user?.email}
          </p>
        </div>
        <div className="h-px bg-border" />
        <button
          onClick={signOut}
          className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
