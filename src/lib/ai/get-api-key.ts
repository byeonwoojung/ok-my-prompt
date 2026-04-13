import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/crypto';
import type { AIProvider } from '@/types/ai';

/**
 * API 키를 가져온다.
 * 1) 비로그인: X-API-Key 헤더에서 직접 (sessionStorage → 클라이언트 → 헤더)
 * 2) 로그인: Supabase DB에서 암호화된 키를 복호화
 */
export async function getApiKey(
  request: NextRequest,
  provider: AIProvider
): Promise<string | null> {
  // 비로그인 사용자의 임시 키
  const headerKey = request.headers.get('X-API-Key');
  if (headerKey) return headerKey;

  // 로그인 사용자의 암호화된 키
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('api_keys')
    .select('encrypted_key')
    .eq('user_id', user.id)
    .eq('provider', provider)
    .single();

  if (!data?.encrypted_key) return null;

  return decrypt(data.encrypted_key);
}
