export type AIProvider = 'openai' | 'google' | 'anthropic';

export interface ModelInfo {
  id: string;
  name: string;
  supportsImages: boolean;
  maxTokens: number;
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
