import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/crypto';
import type { AIProvider } from '@/types/ai';

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

  try {
    return decrypt(data.encrypted_key);
  } catch {
    // 복호화 실패 시 (데이터 손상 등) null 반환
    console.error(`API 키 복호화 실패: provider=${provider}, user=${user.id}`);
    return null;
  }
}
