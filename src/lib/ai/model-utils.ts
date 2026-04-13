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
