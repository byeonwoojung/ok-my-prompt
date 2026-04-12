import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { completeOpenAI } from '@/lib/ai/openai';

function mapError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);

  if (message.includes('Incorrect API key') || message.includes('invalid_api_key')) {
    return { code: 'INVALID_KEY', message: 'OpenAI API 키가 유효하지 않습니다.', retryable: false };
  }
  if (message.includes('Rate limit') || message.includes('429')) {
    return { code: 'RATE_LIMITED', message: '요청 한도를 초과했습니다. 잠시 후 다시 시도하세요.', retryable: true };
  }
  if (message.includes('insufficient_quota') || message.includes('billing')) {
    return { code: 'NO_CREDITS', message: 'OpenAI 크레딧이 부족합니다. 결제 정보를 확인하세요.', retryable: false };
  }
  if (message.includes('content_policy') || message.includes('content_filter')) {
    return { code: 'CONTENT_FILTERED', message: '콘텐츠 정책에 의해 차단되었습니다.', retryable: false };
  }

  return { code: 'MODEL_ERROR', message: `OpenAI 오류: ${message}`, retryable: false };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model, parameters, image_base64 } = body;

    // API 키 가져오기
    let apiKey: string | null = null;

    // 1. 헤더에서 직접 전달된 키 (비로그인)
    const headerKey = request.headers.get('X-API-Key');
    if (headerKey) {
      apiKey = headerKey;
    } else {
      // 2. 로그인 사용자: Supabase에서 가져오기
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from('api_keys')
          .select('encrypted_key')
          .eq('user_id', user.id)
          .eq('provider', 'openai')
          .single();

        apiKey = data?.encrypted_key ?? null;
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: { code: 'INVALID_KEY', message: 'OpenAI API 키가 설정되지 않았습니다. 설정에서 키를 등록하세요.', retryable: false } },
        { status: 401 }
      );
    }

    const result = await completeOpenAI(apiKey, {
      prompt,
      model,
      parameters: parameters ?? {},
      image_base64,
    });

    return NextResponse.json(result);
  } catch (err) {
    const error = mapError(err);
    const status = error.code === 'RATE_LIMITED' ? 429 : error.code === 'INVALID_KEY' || error.code === 'NO_CREDITS' ? 401 : 500;
    return NextResponse.json({ error }, { status });
  }
}
