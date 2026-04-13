import { GoogleGenAI } from '@google/genai';
import type { CompletionRequest, CompletionResponse } from './types';
import { supportsGeminiThinking } from './model-utils';

export async function completeGoogle(
  apiKey: string,
  request: CompletionRequest
): Promise<CompletionResponse> {
  const ai = new GoogleGenAI({ apiKey });

  const contents: Array<{ role: string; parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> }> = [];

  if (request.image_base64) {
    contents.push({
      role: 'user',
      parts: [
        { text: request.prompt },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: request.image_base64,
          },
        },
      ],
    });
  } else {
    contents.push({
      role: 'user',
      parts: [{ text: request.prompt }],
    });
  }

  const config: Parameters<typeof ai.models.generateContent>[0]['config'] = {
    temperature: request.parameters.temperature,
    maxOutputTokens: request.parameters.max_tokens,
    topP: request.parameters.top_p,
    topK: request.parameters.top_k,
  };

  // Gemini 2.5+ / 3.x 만 thinkingConfig 수용
  if (supportsGeminiThinking(request.model)) {
    const thinkingConfig: { thinkingBudget?: number; includeThoughts?: boolean } = {};
    if (request.parameters.thinking_budget !== undefined) {
      thinkingConfig.thinkingBudget = request.parameters.thinking_budget;
    }
    if (request.parameters.include_thoughts !== undefined) {
      thinkingConfig.includeThoughts = request.parameters.include_thoughts === 1;
    }
    if (Object.keys(thinkingConfig).length > 0) {
      config.thinkingConfig = thinkingConfig;
    }
  }

  const response = await ai.models.generateContent({
    model: request.model,
    contents,
    config,
  });

  const text = response.text ?? '';
  const usage = response.usageMetadata;

  return {
    text,
    tokens: {
      prompt: usage?.promptTokenCount ?? 0,
      completion: usage?.candidatesTokenCount ?? 0,
      total: usage?.totalTokenCount ?? 0,
    },
    model: request.model,
  };
}
