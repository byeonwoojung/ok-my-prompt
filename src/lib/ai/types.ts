export interface CompletionRequest {
  prompt: string;
  model: string;
  parameters: Record<string, number>;
  image_base64?: string;
}

export interface CompletionResponse {
  text: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  model: string;
}
