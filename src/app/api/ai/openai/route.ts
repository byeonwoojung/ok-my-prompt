import { NextRequest, NextResponse } from 'next/server';
import { getApiKey } from '@/lib/ai/get-api-key';
import { completeOpenAI } from '@/lib/ai/openai';
import { streamOpenAI } from '@/lib/ai/stream';

function mapError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes('Incorrect API key') || message.includes('invalid_api_key'))
    return { code: 'INVALID_KEY', message: 'OpenAI API 키가 유효하지 않습니다.', retryable: false };
  if (message.includes('Rate limit') || message.includes('429'))
    return { code: 'RATE_LIMITED', message: '요청 한도를 초과했습니다.', retryable: true };
  if (message.includes('insufficient_quota') || message.includes('billing'))
    return { code: 'NO_CREDITS', message: 'OpenAI 크레딧이 부족합니다.', retryable: false };
  return { code: 'MODEL_ERROR', message: `OpenAI 오류: ${message}`, retryable: false };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model, parameters, image_base64, stream } = body;
    const apiKey = await getApiKey(request, 'openai');

    if (!apiKey) {
      return NextResponse.json(
        { error: { code: 'INVALID_KEY', message: 'OpenAI API 키가 설정되지 않았습니다.', retryable: false } },
        { status: 401 }
      );
    }

    if (stream) {
      const readable = streamOpenAI(apiKey, { prompt, model, parameters: parameters ?? {}, image_base64 });
      return new Response(readable, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' } });
    }

    const result = await completeOpenAI(apiKey, { prompt, model, parameters: parameters ?? {}, image_base64 });
    return NextResponse.json(result);
  } catch (err) {
    const error = mapError(err);
    return NextResponse.json({ error }, { status: error.code === 'RATE_LIMITED' ? 429 : 500 });
  }
}
