import Anthropic from '@anthropic-ai/sdk';
import type { CompletionRequest, CompletionResponse } from './types';

export async function completeAnthropic(
  apiKey: string,
  request: CompletionRequest
): Promise<CompletionResponse> {
  const client = new Anthropic({ apiKey });

  const content: Anthropic.MessageCreateParams['messages'][0]['content'] = [];

  if (request.image_base64) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: request.image_base64,
      },
    });
  }

  content.push({
    type: 'text',
    text: request.prompt,
  });

  const response = await client.messages.create({
    model: request.model,
    max_tokens: request.parameters.max_tokens ?? 1024,
    temperature: request.parameters.temperature,
    top_p: request.parameters.top_p,
    top_k: request.parameters.top_k,
    messages: [
      {
        role: 'user',
        content,
      },
    ],
  });

  const textBlock = response.content.find(b => b.type === 'text');
  const text = textBlock && 'text' in textBlock ? textBlock.text : '';

  return {
    text,
    tokens: {
      prompt: response.usage.input_tokens,
      completion: response.usage.output_tokens,
      total: response.usage.input_tokens + response.usage.output_tokens,
    },
    model: response.model,
  };
}
