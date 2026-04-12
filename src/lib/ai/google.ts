import { GoogleGenAI } from '@google/genai';
import type { CompletionRequest, CompletionResponse } from './types';

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

  const response = await ai.models.generateContent({
    model: request.model,
    contents,
    config: {
      temperature: request.parameters.temperature,
      maxOutputTokens: request.parameters.max_tokens,
      topP: request.parameters.top_p,
      topK: request.parameters.top_k,
    },
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
