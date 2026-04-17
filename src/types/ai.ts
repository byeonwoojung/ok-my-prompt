export type AIProvider = 'openai' | 'google' | 'anthropic';

export interface ModelInfo {
  id: string;
  name: string;
  supportsImages: boolean;
  /** 컨텍스트 창 크기 (입력 + 출력 합산 한도) */
  maxTokens: number;
  /**
   * 모델이 단일 응답으로 생성 가능한 최대 출력 토큰 수.
   * UI의 max_tokens 슬라이더 상한으로 사용됨. 미지정 시 provider 기본 상한 사용.
   */
  maxOutputTokens?: number;
  /**
   * 해당 모델 선택 시 적용할 파라미터 기본값.
   * 사용자가 모델 변경 시 이 값으로 리셋되며, 이후 자유롭게 조정 가능.
   * 모델이 지원하지 않는 파라미터는 서버사이드에서 자동으로 무시됨.
   */
  defaults?: Record<string, number>;
}

export interface ParameterDef {
  key: string;
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

export interface ProviderConfig {
  name: string;
  models: ModelInfo[];
  parameters: ParameterDef[];
}

export interface ModelParameters {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  top_k?: number;
  // Gemini thinkingConfig (2.5+, 3.x 시리즈)
  thinking_budget?: number;   // 0 = off, -1 = automatic, 양수 = 직접 지정
  include_thoughts?: number;  // 0 = false, 1 = true (응답에 사고 요약 포함)
  // OpenAI reasoning (o-series, GPT-5 시리즈)
  reasoning_effort?: number;  // 0=minimal, 1=low, 2=medium, 3=high
  // OpenAI verbosity (GPT-5 시리즈 전용)
  verbosity?: number;         // 0=low, 1=medium, 2=high
}

export interface AIRequest {
  prompt: string;
  model: string;
  provider: AIProvider;
  parameters: ModelParameters;
  image_base64?: string;
  batch_count?: number;
}

export interface AIResponse {
  text: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  latency_ms: number;
  model: string;
  provider: AIProvider;
}

export type AIErrorCode =
  | 'INVALID_KEY'
  | 'RATE_LIMITED'
  | 'NO_CREDITS'
  | 'MODEL_ERROR'
  | 'NETWORK_ERROR'
  | 'CONTENT_FILTERED';

export interface AIError {
  code: AIErrorCode;
  message: string;
  provider: AIProvider;
  retryable: boolean;
}
