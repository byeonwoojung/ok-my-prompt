import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { completeGoogle } from '@/lib/ai/google';
import { streamGoogle } from '@/lib/ai/stream';

function mapError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes('API_KEY_INVALID') || message.includes('API key not valid'))
    return { code: 'INVALID_KEY', message: 'Google API 키가 유효하지 않습니다.', retryable: false };
  if (message.includes('RESOURCE_EXHAUSTED') || message.includes('429'))
    return { code: 'RATE_LIMITED', message: '요청 한도를 초과했습니다.', retryable: true };
  return { code: 'MODEL_ERROR', message: `Google AI 오류: ${message}`, retryable: false };
}

async function getApiKey(request: NextRequest): Promise<string | null> {
  const headerKey = request.headers.get('X-API-Key');
  if (headerKey) return headerKey;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('api_keys').select('encrypted_key').eq('user_id', user.id).eq('provider', 'google').single();
  return data?.encrypted_key ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model, parameters, image_base64, stream } = body;
    const apiKey = await getApiKey(request);

    if (!apiKey) {
      return NextResponse.json(
        { error: { code: 'INVALID_KEY', message: 'Google API 키가 설정되지 않았습니다.', retryable: false } },
        { status: 401 }
      );
    }

    if (stream) {
      const readable = streamGoogle(apiKey, { prompt, model, parameters: parameters ?? {}, image_base64 });
      return new Response(readable, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' } });
    }

    const result = await completeGoogle(apiKey, { prompt, model, parameters: parameters ?? {}, image_base64 });
    return NextResponse.json(result);
  } catch (err) {
    const error = mapError(err);
    return NextResponse.json({ error }, { status: error.code === 'RATE_LIMITED' ? 429 : 500 });
  }
}
