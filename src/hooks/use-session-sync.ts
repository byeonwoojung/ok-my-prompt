'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './use-auth';
import { getSessionPrompts, getSessionApiKeys } from '@/lib/prompts/session-store';

// 전역 플래그: 앱 전체에서 1회만 실행
let globalSynced = false;

export function useSessionSync() {
  const { user, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn || !user || globalSynced) return;
    globalSynced = true;

    const sync = async () => {
      try {
        const sessionPrompts = getSessionPrompts();
        const sessionKeys = getSessionApiKeys();
        const hasPrompts = sessionPrompts.length > 0;
        const hasKeys = Object.values(sessionKeys).some(v => v);

        if (!hasPrompts && !hasKeys) return;

        // API 키 동기화 (서버사이드 암호화 API 사용)
        const keyEntries = Object.entries(sessionKeys).filter(([, v]) => v);
        for (const [provider, key] of keyEntries) {
          if (!key) continue;
          await fetch('/api/keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider, key }),
          });
        }

        // 프롬프트 동기화
        if (hasPrompts) {
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();
          const inserts = sessionPrompts.map(p => ({
            user_id: user.id,
            title: `세션 저장 ${new Date(p.created_at).toLocaleDateString('ko-KR')}`,
            description: null,
            prompt_type: 'text' as const,
            template: p.template,
            placeholders: p.placeholders,
            model_config: p.model_config,
          }));
          await supabase.from('prompts').insert(inserts);
        }

        // 세션 정리
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('ok-my-prompt:session-prompts');
          sessionStorage.removeItem('ok-my-prompt:session-api-keys');
        }

        const count = sessionPrompts.length + keyEntries.length;
        toast.success(`세션 데이터 ${count}건이 계정에 저장되었습니다`);
      } catch (err) {
        console.error('세션 동기화 실패:', err);
        toast.error('세션 데이터 동기화에 실패했습니다');
      }
    };

    sync();
  }, [isLoggedIn, user]);
}
