import OpenAI from 'openai';
import type { CompletionRequest, CompletionResponse } from './types';

export async function completeOpenAI(
  apiKey: string,
  request: CompletionRequest
): Promise<CompletionResponse> {
  const client = new OpenAI({ apiKey });

  const messages: OpenAI.ChatCompletionMessageParam[] = [];

  if (request.image_base64) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: request.prompt },
        {
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${request.image_base64}` },
        },
      ],
    });
  } else {
    messages.push({ role: 'user', content: request.prompt });
  }

  const response = await client.chat.completions.create({
    model: request.model,
    messages,
    temperature: request.parameters.temperature,
    max_tokens: request.parameters.max_tokens,
    top_p: request.parameters.top_p,
    frequency_penalty: request.parameters.frequency_penalty,
    presence_penalty: request.parameters.presence_penalty,
  });

  const choice = response.choices[0];
  const usage = response.usage;

  return {
    text: choice?.message?.content ?? '',
    tokens: {
      prompt: usage?.prompt_tokens ?? 0,
      completion: usage?.completion_tokens ?? 0,
      total: usage?.total_tokens ?? 0,
    },
    model: response.model,
  };
}
