import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase 환경변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.');
  }

  return createBrowserClient(url, anonKey);
}
