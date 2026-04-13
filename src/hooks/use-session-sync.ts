'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from './use-auth';
import { createClient } from '@/lib/supabase/client';
import { getSessionPrompts, getSessionApiKeys } from '@/lib/prompts/session-store';

/**
 * 로그인 감지 시 sessionStorage의 임시 프롬프트와 API 키를
 * Supabase에 저장하고 sessionStorage에서 제거합니다.
 */
export function useSessionSync() {
  const { user, isLoggedIn } = useAuth();
  const synced = useRef(false);

  useEffect(() => {
    if (!isLoggedIn || !user || synced.current) return;
    synced.current = true;

    const syncPrompts = async () => {
      const sessionPrompts = getSessionPrompts();
      if (sessionPrompts.length === 0) return;

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
      // 동기화 후 세션 정리
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('ok-my-prompt:session-prompts');
      }
    };

    const syncApiKeys = async () => {
      const sessionKeys = getSessionApiKeys();
      const entries = Object.entries(sessionKeys).filter(([, v]) => v);
      if (entries.length === 0) return;

      const supabase = createClient();
      for (const [provider, key] of entries) {
        if (!key) continue;
        await supabase.from('api_keys').upsert(
          {
            user_id: user.id,
            provider,
            encrypted_key: key,
            key_preview: key.slice(0, 15),
          },
          { onConflict: 'user_id,provider' }
        );
      }
      // 동기화 후 세션 정리
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('ok-my-prompt:session-api-keys');
      }
    };

    syncPrompts();
    syncApiKeys();
  }, [isLoggedIn, user]);
}
