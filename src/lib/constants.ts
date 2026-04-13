import type { ProviderConfig, AIProvider } from '@/types/ai';

export const PROVIDERS: Record<AIProvider, ProviderConfig> = {
  openai: {
    name: 'OpenAI',
    models: [
      { id: 'gpt-5.4', name: 'GPT-5.4', supportsImages: true, maxTokens: 1000000 },
      { id: 'gpt-5.4-mini', name: 'GPT-5.4 Mini', supportsImages: true, maxTokens: 400000 },
      { id: 'gpt-5.4-nano', name: 'GPT-5.4 Nano', supportsImages: true, maxTokens: 200000 },
      { id: 'gpt-4.1', name: 'GPT-4.1', supportsImages: true, maxTokens: 1000000 },
      { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', supportsImages: true, maxTokens: 1000000 },
      { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', supportsImages: true, maxTokens: 1000000 },
      { id: 'o3', name: 'o3', supportsImages: true, maxTokens: 200000 },
      { id: 'o4-mini', name: 'o4-mini', supportsImages: true, maxTokens: 200000 },
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
      { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', supportsImages: true, maxTokens: 1000000 },
      { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', supportsImages: true, maxTokens: 1000000 },
      { id: 'gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash-Lite Preview', supportsImages: true, maxTokens: 1000000 },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', supportsImages: true, maxTokens: 1000000 },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', supportsImages: true, maxTokens: 1000000 },
      { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', supportsImages: true, maxTokens: 1000000 },
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
      { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', supportsImages: true, maxTokens: 1000000 },
      { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', supportsImages: true, maxTokens: 1000000 },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', supportsImages: true, maxTokens: 200000 },
      { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', supportsImages: true, maxTokens: 200000 },
      { id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5', supportsImages: true, maxTokens: 200000 },
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
  // OpenAI
  'gpt-5.4': { input: 0.0025, output: 0.015 },
  'gpt-5.4-mini': { input: 0.00075, output: 0.0045 },
  'gpt-5.4-nano': { input: 0.0002, output: 0.00125 },
  'gpt-4.1': { input: 0.002, output: 0.008 },
  'gpt-4.1-mini': { input: 0.0004, output: 0.0016 },
  'gpt-4.1-nano': { input: 0.0001, output: 0.0004 },
  'o3': { input: 0.002, output: 0.008 },
  'o4-mini': { input: 0.0011, output: 0.0044 },
  // Google (Gemini)
  'gemini-3-flash-preview': { input: 0.0005, output: 0.003 },
  'gemini-3.1-pro-preview': { input: 0.002, output: 0.012 },
  'gemini-3.1-flash-lite-preview': { input: 0.00025, output: 0.0015 },
  'gemini-2.5-flash': { input: 0.0003, output: 0.0025 },
  'gemini-2.5-pro': { input: 0.00125, output: 0.01 },
  'gemini-2.5-flash-lite': { input: 0.0001, output: 0.0004 },
  // Anthropic (Claude)
  'claude-opus-4-6': { input: 0.005, output: 0.025 },
  'claude-sonnet-4-6': { input: 0.003, output: 0.015 },
  'claude-haiku-4-5-20251001': { input: 0.001, output: 0.005 },
  'claude-sonnet-4-5-20250929': { input: 0.003, output: 0.015 },
  'claude-opus-4-5-20251101': { input: 0.005, output: 0.025 },
};
