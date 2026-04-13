import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encrypt } from '@/lib/crypto';

// API 키 저장 (서버사이드 암호화)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }

  const { provider, key } = await request.json();
  if (!provider || !key || typeof key !== 'string') {
    return NextResponse.json({ error: '유효하지 않은 요청입니다' }, { status: 400 });
  }

  const encryptedKey = encrypt(key);
  const keyPreview = key.slice(0, 15);

  const { error } = await supabase.from('api_keys').upsert(
    { user_id: user.id, provider, encrypted_key: encryptedKey, key_preview: keyPreview },
    { onConflict: 'user_id,provider' }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, key_preview: keyPreview });
}

// API 키 삭제
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }

  const { provider } = await request.json();
  await supabase.from('api_keys').delete().eq('user_id', user.id).eq('provider', provider);

  return NextResponse.json({ success: true });
}
