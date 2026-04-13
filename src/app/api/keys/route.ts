import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encrypt } from '@/lib/crypto';

const VALID_PROVIDERS = ['openai', 'google', 'anthropic'];

function isValidProvider(p: unknown): boolean {
  return typeof p === 'string' && VALID_PROVIDERS.includes(p);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: '유효하지 않은 요청입니다' }, { status: 400 });
  }

  const { provider, key } = body;
  if (!isValidProvider(provider) || !key || typeof key !== 'string' || key.length > 500) {
    return NextResponse.json({ error: '유효하지 않은 요청입니다' }, { status: 400 });
  }

  const encryptedKey = encrypt(key);
  const keyPreview = key.slice(0, 15);

  const { error } = await supabase.from('api_keys').upsert(
    { user_id: user.id, provider, encrypted_key: encryptedKey, key_preview: keyPreview },
    { onConflict: 'user_id,provider' }
  );

  if (error) {
    return NextResponse.json({ error: '키 저장에 실패했습니다' }, { status: 500 });
  }

  return NextResponse.json({ success: true, key_preview: keyPreview });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: '유효하지 않은 요청입니다' }, { status: 400 });
  }

  const { provider } = body;
  if (!isValidProvider(provider)) {
    return NextResponse.json({ error: '유효하지 않은 프로바이더입니다' }, { status: 400 });
  }

  await supabase.from('api_keys').delete().eq('user_id', user.id).eq('provider', provider);
  return NextResponse.json({ success: true });
}
