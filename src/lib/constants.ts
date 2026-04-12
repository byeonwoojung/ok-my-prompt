import type { ProviderConfig, AIProvider } from '@/types/ai';

export const PROVIDERS: Record<AIProvider, ProviderConfig> = {
  openai: {
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', supportsImages: true, maxTokens: 128000 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', supportsImages: true, maxTokens: 128000 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', supportsImages: true, maxTokens: 128000 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', supportsImages: false, maxTokens: 16385 },
      { id: 'o1', name: 'o1', supportsImages: false, maxTokens: 200000 },
      { id: 'o1-mini', name: 'o1 Mini', supportsImages: false, maxTokens: 128000 },
      { id: 'o3-mini', name: 'o3 Mini', supportsImages: false, maxTokens: 200000 },
    ],
    parameters: [
      { key: 'temperature', label: 'Temperature', description: '무작위성 조절. 낮을수록 일관적, 높을수록 창의적인 응답을 생성합니다.', min: 0, max: 2, step: 0.01, defaultValue: 0.7 },
      { key: 'max_tokens', label: 'Max Tokens', description: '생성할 최대 토큰 수. 긴 응답이 필요하면 값을 높이세요.', min: 1, max: 16384, step: 1, defaultValue: 1024 },
      { key: 'top_p', label: 'Top P', description: '누적 확률 샘플링. 낮을수록 더 집중적인 응답을 생성합니다.', min: 0, max: 1, step: 0.01, defaultValue: 1.0 },
      { key: 'frequency_penalty', label: 'Frequency Penalty', description: '빈도 패널티. 양수 값은 같은 단어의 반복을 줄입니다.', min: -2, max: 2, step: 0.01, defaultValue: 0 },
      { key: 'presence_penalty', label: 'Presence Penalty', description: '존재 패널티. 양수 값은 새로운 주제로 전환하도록 유도합니다.', min: -2, max: 2, step: 0.01, defaultValue: 0 },
    ],
  },
  google: {
    name: 'Google (Gemini)',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', supportsImages: true, maxTokens: 1000000 },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', supportsImages: true, maxTokens: 1000000 },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', supportsImages: true, maxTokens: 1000000 },
    ],
    parameters: [
      { key: 'temperature', label: 'Temperature', description: '무작위성 조절. 낮을수록 일관적, 높을수록 창의적인 응답을 생성합니다.', min: 0, max: 2, step: 0.01, defaultValue: 0.7 },
      { key: 'max_tokens', label: 'Max Tokens', description: '생성할 최대 토큰 수. 긴 응답이 필요하면 값을 높이세요.', min: 1, max: 8192, step: 1, defaultValue: 1024 },
      { key: 'top_p', label: 'Top P', description: '누적 확률 샘플링. 낮을수록 더 집중적인 응답을 생성합니다.', min: 0, max: 1, step: 0.01, defaultValue: 1.0 },
      { key: 'top_k', label: 'Top K', description: '상위 K개 토큰만 샘플링. 낮을수록 더 결정적인 응답을 생성합니다.', min: 1, max: 100, step: 1, defaultValue: 40 },
    ],
  },
  anthropic: {
    name: 'Anthropic (Claude)',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', supportsImages: true, maxTokens: 200000 },
      { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', supportsImages: true, maxTokens: 200000 },
      { id: 'claude-haiku-3-5-20241022', name: 'Claude Haiku 3.5', supportsImages: true, maxTokens: 200000 },
    ],
    parameters: [
      { key: 'temperature', label: 'Temperature', description: '무작위성 조절. 낮을수록 일관적, 높을수록 창의적인 응답을 생성합니다.', min: 0, max: 1, step: 0.01, defaultValue: 0.7 },
      { key: 'max_tokens', label: 'Max Tokens', description: '생성할 최대 토큰 수. 긴 응답이 필요하면 값을 높이세요.', min: 1, max: 8192, step: 1, defaultValue: 1024 },
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
  'gpt-4o': { input: 0.0025, output: 0.01 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'o1': { input: 0.015, output: 0.06 },
  'o1-mini': { input: 0.003, output: 0.012 },
  'o3-mini': { input: 0.0011, output: 0.0044 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  'gemini-2.5-flash': { input: 0.00015, output: 0.0006 },
  'gemini-2.5-pro': { input: 0.00125, output: 0.01 },
  'gemini-2.0-flash': { input: 0.0001, output: 0.0004 },
  'claude-sonnet-4-20250514': { input: 0.003, output: 0.015 },
  'claude-opus-4-20250514': { input: 0.015, output: 0.075 },
  'claude-haiku-3-5-20241022': { input: 0.0008, output: 0.004 },
};
