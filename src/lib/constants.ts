import type { ProviderConfig, AIProvider } from '@/types/ai';

// 추론 모델 공통 기본값: medium effort + 충분한 출력 토큰
const REASONING_DEFAULTS = { reasoning_effort: 2, max_tokens: 4096 };
// GPT-5 추가 기본값: medium verbosity
const GPT5_DEFAULTS = { ...REASONING_DEFAULTS, verbosity: 1 };
// Gemini 2.5+ / 3.x 공통 기본값: thinking auto, 사고 요약 비표시
const GEMINI_THINKING_DEFAULTS = { thinking_budget: -1, include_thoughts: 0 };

export const PROVIDERS: Record<AIProvider, ProviderConfig> = {
  openai: {
    name: 'OpenAI',
    models: [
      // GPT-5.4 series (reasoning + verbosity, 최신 플래그십)
      { id: 'gpt-5.4', name: 'GPT-5.4', supportsImages: true, maxTokens: 1000000, maxOutputTokens: 128000, defaults: GPT5_DEFAULTS },
      { id: 'gpt-5.4-mini', name: 'GPT-5.4 Mini', supportsImages: true, maxTokens: 400000, maxOutputTokens: 128000, defaults: GPT5_DEFAULTS },
      { id: 'gpt-5.4-nano', name: 'GPT-5.4 Nano', supportsImages: true, maxTokens: 200000, maxOutputTokens: 65536, defaults: { ...GPT5_DEFAULTS, reasoning_effort: 0 } },
      // GPT-4.1 series (standard, 1M context)
      { id: 'gpt-4.1', name: 'GPT-4.1', supportsImages: true, maxTokens: 1000000, maxOutputTokens: 32768 },
      { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', supportsImages: true, maxTokens: 1000000, maxOutputTokens: 32768 },
      { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', supportsImages: true, maxTokens: 1000000, maxOutputTokens: 32768 },
      // GPT-4o series (standard, legacy)
      { id: 'gpt-4o', name: 'GPT-4o', supportsImages: true, maxTokens: 128000, maxOutputTokens: 16384 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', supportsImages: true, maxTokens: 128000, maxOutputTokens: 16384 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', supportsImages: true, maxTokens: 128000, maxOutputTokens: 4096 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', supportsImages: false, maxTokens: 16385, maxOutputTokens: 4096 },
      // o-series (reasoning)
      { id: 'o4-mini', name: 'o4-mini', supportsImages: true, maxTokens: 200000, maxOutputTokens: 100000, defaults: REASONING_DEFAULTS },
      { id: 'o3', name: 'o3', supportsImages: true, maxTokens: 200000, maxOutputTokens: 100000, defaults: REASONING_DEFAULTS },
      { id: 'o3-mini', name: 'o3 Mini', supportsImages: false, maxTokens: 200000, maxOutputTokens: 100000, defaults: REASONING_DEFAULTS },
      { id: 'o1', name: 'o1', supportsImages: true, maxTokens: 200000, maxOutputTokens: 100000, defaults: REASONING_DEFAULTS },
      { id: 'o1-mini', name: 'o1 Mini', supportsImages: false, maxTokens: 128000, maxOutputTokens: 65536, defaults: REASONING_DEFAULTS },
    ],
    parameters: [
      { key: 'temperature', label: 'Temperature', description: '무작위성 조절. 낮을수록 일관적, 높을수록 창의적인 응답을 생성합니다. (o-series, GPT-5.x 모델에서는 무시됨)', min: 0, max: 2, step: 0.01, defaultValue: 0.7 },
      { key: 'max_tokens', label: 'Max Tokens', description: '생성할 최대 토큰 수. 추론 모델은 내부적으로 max_completion_tokens로 전달됩니다. 상한은 선택한 모델에 따라 달라집니다.', min: 1, max: 128000, step: 1, defaultValue: 1024 },
      { key: 'top_p', label: 'Top P', description: '누적 확률 샘플링. 낮을수록 더 집중적인 응답을 생성합니다. (추론 모델 미지원)', min: 0, max: 1, step: 0.01, defaultValue: 1.0 },
      { key: 'frequency_penalty', label: 'Frequency Penalty', description: '빈도 패널티. 양수 값은 같은 단어의 반복을 줄입니다. (추론 모델 미지원)', min: -2, max: 2, step: 0.01, defaultValue: 0 },
      { key: 'presence_penalty', label: 'Presence Penalty', description: '존재 패널티. 양수 값은 새로운 주제로 전환하도록 유도합니다. (추론 모델 미지원)', min: -2, max: 2, step: 0.01, defaultValue: 0 },
      { key: 'reasoning_effort', label: 'Reasoning Effort', description: '추론 강도. 0=minimal, 1=low, 2=medium, 3=high. o-series / GPT-5.x 전용, 일반 모델은 무시.', min: 0, max: 3, step: 1, defaultValue: 2 },
      { key: 'verbosity', label: 'Verbosity', description: '응답 상세도. 0=low(간결), 1=medium, 2=high(상세). GPT-5.x 시리즈 전용, 그 외는 무시.', min: 0, max: 2, step: 1, defaultValue: 1 },
    ],
  },
  google: {
    name: 'Google (Gemini)',
    models: [
      // Gemini 3.x series (preview, 최신, thinking 지원)
      { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', supportsImages: true, maxTokens: 1000000, maxOutputTokens: 65536, defaults: GEMINI_THINKING_DEFAULTS },
      { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', supportsImages: true, maxTokens: 1000000, maxOutputTokens: 65536, defaults: GEMINI_THINKING_DEFAULTS },
      { id: 'gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash-Lite Preview', supportsImages: true, maxTokens: 1000000, maxOutputTokens: 65536, defaults: GEMINI_THINKING_DEFAULTS },
      // Gemini 2.5 series (stable, thinking 지원)
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', supportsImages: true, maxTokens: 1000000, maxOutputTokens: 65536, defaults: GEMINI_THINKING_DEFAULTS },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', supportsImages: true, maxTokens: 1000000, maxOutputTokens: 65536, defaults: GEMINI_THINKING_DEFAULTS },
      { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', supportsImages: true, maxTokens: 1000000, maxOutputTokens: 65536, defaults: { ...GEMINI_THINKING_DEFAULTS, thinking_budget: 0 } },
      // Gemini 2.0 series (deprecated, thinking 미지원)
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Legacy)', supportsImages: true, maxTokens: 1000000, maxOutputTokens: 8192 },
      { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash-Lite (Legacy)', supportsImages: true, maxTokens: 1000000, maxOutputTokens: 8192 },
      // Gemini 1.5 series (legacy, thinking 미지원)
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Legacy)', supportsImages: true, maxTokens: 2000000, maxOutputTokens: 8192 },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Legacy)', supportsImages: true, maxTokens: 1000000, maxOutputTokens: 8192 },
      { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash-8B (Legacy)', supportsImages: true, maxTokens: 1000000, maxOutputTokens: 8192 },
    ],
    parameters: [
      { key: 'temperature', label: 'Temperature', description: '무작위성 조절. 낮을수록 일관적, 높을수록 창의적인 응답을 생성합니다.', min: 0, max: 2, step: 0.01, defaultValue: 0.7 },
      { key: 'max_tokens', label: 'Max Tokens', description: '생성할 최대 출력 토큰 수 (maxOutputTokens로 전달). 상한은 선택한 모델에 따라 달라집니다. 2.5+/3.x 시리즈에서는 thinking 토큰도 이 예산을 함께 사용합니다.', min: 1, max: 65536, step: 1, defaultValue: 1024 },
      { key: 'top_p', label: 'Top P', description: '누적 확률 샘플링. 낮을수록 더 집중적인 응답을 생성합니다.', min: 0, max: 1, step: 0.01, defaultValue: 1.0 },
      { key: 'top_k', label: 'Top K', description: '상위 K개 토큰만 샘플링. 낮을수록 더 결정적인 응답을 생성합니다.', min: 1, max: 100, step: 1, defaultValue: 40 },
      { key: 'thinking_budget', label: 'Thinking Budget', description: '사고(reasoning) 토큰 예산. -1=자동, 0=끄기 (2.5 Flash/Flash-Lite만), 양수=직접 지정. 2.5+ / 3.x 시리즈 전용, 이전 모델은 무시.', min: -1, max: 32768, step: 1, defaultValue: -1 },
      { key: 'include_thoughts', label: 'Include Thoughts', description: '응답에 모델의 사고 과정 요약 포함 (0=off, 1=on). 2.5+ / 3.x 시리즈 전용.', min: 0, max: 1, step: 1, defaultValue: 0 },
    ],
  },
  anthropic: {
    name: 'Anthropic (Claude)',
    models: [
      // 최신 Claude 4.6 / 4.5 시리즈
      { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', supportsImages: true, maxTokens: 1000000, maxOutputTokens: 64000 },
      { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', supportsImages: true, maxTokens: 1000000, maxOutputTokens: 64000 },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', supportsImages: true, maxTokens: 200000, maxOutputTokens: 64000 },
      // Legacy (Claude 4.x)
      { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', supportsImages: true, maxTokens: 200000, maxOutputTokens: 64000 },
      { id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5', supportsImages: true, maxTokens: 200000, maxOutputTokens: 64000 },
      { id: 'claude-opus-4-1-20250805', name: 'Claude Opus 4.1', supportsImages: true, maxTokens: 200000, maxOutputTokens: 32000 },
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', supportsImages: true, maxTokens: 200000, maxOutputTokens: 64000 },
      { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', supportsImages: true, maxTokens: 200000, maxOutputTokens: 32000 },
      // Claude 3.x (very legacy, soon retiring)
      { id: 'claude-3-haiku-20240307', name: 'Claude Haiku 3 (Deprecated)', supportsImages: true, maxTokens: 200000, maxOutputTokens: 4096 },
    ],
    parameters: [
      { key: 'temperature', label: 'Temperature', description: '무작위성 조절. 낮을수록 일관적, 높을수록 창의적인 응답을 생성합니다.', min: 0, max: 1, step: 0.01, defaultValue: 0.7 },
      { key: 'max_tokens', label: 'Max Tokens', description: '생성할 최대 토큰 수. 상한은 선택한 모델에 따라 달라집니다.', min: 1, max: 64000, step: 1, defaultValue: 1024 },
      { key: 'top_p', label: 'Top P', description: '누적 확률 샘플링. 낮을수록 더 집중적인 응답을 생성합니다.', min: 0, max: 1, step: 0.01, defaultValue: 1.0 },
      { key: 'top_k', label: 'Top K', description: '상위 K개 토큰만 샘플링. 낮을수록 더 결정적인 응답을 생성합니다.', min: 1, max: 100, step: 1, defaultValue: 40 },
    ],
  },
};

export const PERMUTATION_WARNING_THRESHOLD = 50;
export const PERMUTATION_CAP = 500;
export const MAX_BATCH_COUNT = 10;
export const MAX_SESSION_PROMPTS = 5;

// 모델별 대략적인 비용 (USD per 1K tokens)
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  // OpenAI - GPT-5.4 series
  'gpt-5.4': { input: 0.0025, output: 0.015 },
  'gpt-5.4-mini': { input: 0.00075, output: 0.0045 },
  'gpt-5.4-nano': { input: 0.0002, output: 0.00125 },
  // OpenAI - GPT-4.1 series
  'gpt-4.1': { input: 0.002, output: 0.008 },
  'gpt-4.1-mini': { input: 0.0004, output: 0.0016 },
  'gpt-4.1-nano': { input: 0.0001, output: 0.0004 },
  // OpenAI - GPT-4o / Legacy
  'gpt-4o': { input: 0.0025, output: 0.01 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  // OpenAI - o-series
  'o4-mini': { input: 0.0011, output: 0.0044 },
  'o3': { input: 0.002, output: 0.008 },
  'o3-mini': { input: 0.0011, output: 0.0044 },
  'o1': { input: 0.015, output: 0.06 },
  'o1-mini': { input: 0.003, output: 0.012 },
  // Google (Gemini) - 3.x series
  'gemini-3.1-pro-preview': { input: 0.002, output: 0.012 },
  'gemini-3-flash-preview': { input: 0.0005, output: 0.003 },
  'gemini-3.1-flash-lite-preview': { input: 0.00025, output: 0.0015 },
  // Google (Gemini) - 2.5 series
  'gemini-2.5-pro': { input: 0.00125, output: 0.01 },
  'gemini-2.5-flash': { input: 0.0003, output: 0.0025 },
  'gemini-2.5-flash-lite': { input: 0.0001, output: 0.0004 },
  // Google (Gemini) - legacy
  'gemini-2.0-flash': { input: 0.0001, output: 0.0004 },
  'gemini-2.0-flash-lite': { input: 0.000075, output: 0.0003 },
  'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
  'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
  'gemini-1.5-flash-8b': { input: 0.0000375, output: 0.00015 },
  // Anthropic (Claude) - 4.6 / 4.5
  'claude-opus-4-6': { input: 0.005, output: 0.025 },
  'claude-sonnet-4-6': { input: 0.003, output: 0.015 },
  'claude-haiku-4-5-20251001': { input: 0.001, output: 0.005 },
  'claude-sonnet-4-5-20250929': { input: 0.003, output: 0.015 },
  'claude-opus-4-5-20251101': { input: 0.005, output: 0.025 },
  // Anthropic (Claude) - legacy
  'claude-opus-4-1-20250805': { input: 0.015, output: 0.075 },
  'claude-sonnet-4-20250514': { input: 0.003, output: 0.015 },
  'claude-opus-4-20250514': { input: 0.015, output: 0.075 },
  'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
};
