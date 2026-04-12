'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import {
  getSessionApiKeys,
  setSessionApiKey,
  removeSessionApiKey,
  maskApiKey,
} from '@/lib/prompts/session-store';
import type { AIProvider } from '@/types/ai';

export function ApiKeyForm({ provider }: { provider: AIProvider }) {
  const { isLoggedIn, user } = useAuth();
  const [key, setKey] = useState('');
  const [savedKeyPreview, setSavedKeyPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 저장된 키 로드
  useEffect(() => {
    if (isLoggedIn && user) {
      const supabase = createClient();
      supabase
        .from('api_keys')
        .select('key_preview')
        .eq('user_id', user.id)
        .eq('provider', provider)
        .single()
        .then(({ data }) => {
          if (data) {
            setSavedKeyPreview(data.key_preview);
          }
        });
    } else {
      // 비로그인: sessionStorage에서 확인
      const sessionKeys = getSessionApiKeys();
      if (sessionKeys[provider]) {
        setSavedKeyPreview(maskApiKey(sessionKeys[provider]!));
      }
    }
  }, [isLoggedIn, user, provider]);

  const handleSave = async () => {
    if (!key.trim()) return;
    setSaving(true);
    setError(null);

    try {
      if (isLoggedIn && user) {
        const supabase = createClient();
        const preview = key.slice(0, 15);

        const { error: upsertError } = await supabase
          .from('api_keys')
          .upsert(
            {
              user_id: user.id,
              provider,
              encrypted_key: key, // 실제로는 서버사이드에서 암호화
              key_preview: preview,
            },
            { onConflict: 'user_id,provider' }
          );

        if (upsertError) throw upsertError;
        setSavedKeyPreview(maskApiKey(key));
      } else {
        // 비로그인: sessionStorage
        setSessionApiKey(provider, key);
        setSavedKeyPreview(maskApiKey(key));
      }

      setKey('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isLoggedIn && user) {
      const supabase = createClient();
      await supabase
        .from('api_keys')
        .delete()
        .eq('user_id', user.id)
        .eq('provider', provider);
    } else {
      removeSessionApiKey(provider);
    }
    setSavedKeyPreview(null);
    setKey('');
  };

  if (savedKeyPreview) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono text-muted-foreground">
          {savedKeyPreview}
        </div>
        <button
          onClick={handleDelete}
          className="rounded-md border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          삭제
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="API 키를 입력하세요"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={handleSave}
          disabled={!key.trim() || saving}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
