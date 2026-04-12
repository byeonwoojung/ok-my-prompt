import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { completeAnthropic } from '@/lib/ai/anthropic';

function mapError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);

  if (message.includes('invalid x-api-key') || message.includes('authentication_error')) {
    return { code: 'INVALID_KEY', message: 'Anthropic API 키가 유효하지 않습니다.', retryable: false };
  }
  if (message.includes('rate_limit') || message.includes('429')) {
    return { code: 'RATE_LIMITED', message: '요청 한도를 초과했습니다. 잠시 후 다시 시도하세요.', retryable: true };
  }
  if (message.includes('billing') || message.includes('credit')) {
    return { code: 'NO_CREDITS', message: 'Anthropic 크레딧이 부족합니다.', retryable: false };
  }

  return { code: 'MODEL_ERROR', message: `Anthropic 오류: ${message}`, retryable: false };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model, parameters, image_base64 } = body;

    let apiKey: string | null = null;

    const headerKey = request.headers.get('X-API-Key');
    if (headerKey) {
      apiKey = headerKey;
    } else {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from('api_keys')
          .select('encrypted_key')
          .eq('user_id', user.id)
          .eq('provider', 'anthropic')
          .single();

        apiKey = data?.encrypted_key ?? null;
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: { code: 'INVALID_KEY', message: 'Anthropic API 키가 설정되지 않았습니다. 설정에서 키를 등록하세요.', retryable: false } },
        { status: 401 }
      );
    }

    const result = await completeAnthropic(apiKey, {
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
