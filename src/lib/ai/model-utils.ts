/**
 * OpenAI 추론 모델(o-series, GPT-5.x) 판별.
 *
 * 추론 모델은 Chat Completions API에서 다음과 같이 다르게 동작한다:
 * - `max_tokens` 대신 `max_completion_tokens` 사용
 * - `temperature`, `top_p`, `frequency_penalty`, `presence_penalty` 미지원
 *   (대부분의 모델은 무시하지만 일부는 400 에러 발생)
 */
export function isOpenAIReasoningModel(modelId: string): boolean {
  // o1, o1-mini, o3, o3-mini, o3-pro, o4-mini, ... (o로 시작 + 숫자)
  if (/^o\d/.test(modelId)) return true;
  // gpt-5, gpt-5.4 등 GPT-5 이상 (reasoning/thinking 모델)
  if (/^gpt-5/.test(modelId)) return true;
  return false;
}

/**
 * Gemini thinking 지원 모델 판별.
 * 2.5 시리즈(Flash/Pro/Flash-Lite)와 3.x 시리즈만 thinkingConfig 수용.
 * 2.0 이하 모델에 thinkingConfig 전달 시 400 에러 발생하므로 서버사이드에서 제거.
 */
export function supportsGeminiThinking(modelId: string): boolean {
  if (modelId.startsWith('gemini-2.5')) return true;
  if (modelId.startsWith('gemini-3')) return true;
  return false;
}

/** GPT-5 시리즈만 verbosity 파라미터 수용. */
export function supportsOpenAIVerbosity(modelId: string): boolean {
  return /^gpt-5/.test(modelId);
}

// 숫자 슬라이더 → SDK enum 매핑
export const REASONING_EFFORT_MAP = ['minimal', 'low', 'medium', 'high'] as const;
export const VERBOSITY_MAP = ['low', 'medium', 'high'] as const;

export function reasoningEffortFromNumber(n: number | undefined): typeof REASONING_EFFORT_MAP[number] | undefined {
  if (n === undefined) return undefined;
  const idx = Math.max(0, Math.min(REASONING_EFFORT_MAP.length - 1, Math.floor(n)));
  return REASONING_EFFORT_MAP[idx];
}

export function verbosityFromNumber(n: number | undefined): typeof VERBOSITY_MAP[number] | undefined {
  if (n === undefined) return undefined;
  const idx = Math.max(0, Math.min(VERBOSITY_MAP.length - 1, Math.floor(n)));
  return VERBOSITY_MAP[idx];
}
