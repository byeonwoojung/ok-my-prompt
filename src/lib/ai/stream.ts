import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import type { CompletionRequest } from './types';
import { isOpenAIReasoningModel } from './model-utils';

export function streamOpenAI(apiKey: string, req: CompletionRequest): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const client = new OpenAI({ apiKey });
        const messages: OpenAI.ChatCompletionMessageParam[] = req.image_base64
          ? [{ role: 'user', content: [{ type: 'text', text: req.prompt }, { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${req.image_base64}` } }] }]
          : [{ role: 'user', content: req.prompt }];

        const isReasoning = isOpenAIReasoningModel(req.model);
        const params: OpenAI.ChatCompletionCreateParamsStreaming = isReasoning
          ? {
              model: req.model,
              messages,
              max_completion_tokens: req.parameters.max_tokens,
              stream: true,
            }
          : {
              model: req.model,
              messages,
              temperature: req.parameters.temperature,
              max_tokens: req.parameters.max_tokens,
              top_p: req.parameters.top_p,
              stream: true,
            };

        const stream = await client.chat.completions.create(params);

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err instanceof Error ? err.message : String(err) })}\n\n`));
        controller.close();
      }
    },
  });
}

export function streamAnthropic(apiKey: string, req: CompletionRequest): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const client = new Anthropic({ apiKey });
        const content: Anthropic.MessageCreateParams['messages'][0]['content'] = [];
        if (req.image_base64) {
          content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: req.image_base64 } });
        }
        content.push({ type: 'text', text: req.prompt });

        const stream = client.messages.stream({
          model: req.model,
          max_tokens: req.parameters.max_tokens ?? 1024,
          temperature: req.parameters.temperature,
          top_p: req.parameters.top_p,
          top_k: req.parameters.top_k,
          messages: [{ role: 'user', content }],
        });

        for await (const event of stream) {
          if (event.type === 'content_block_delta' && 'delta' in event && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err instanceof Error ? err.message : String(err) })}\n\n`));
        controller.close();
      }
    },
  });
}

export function streamGoogle(apiKey: string, req: CompletionRequest): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const contents = req.image_base64
          ? [{ role: 'user' as const, parts: [{ text: req.prompt }, { inlineData: { mimeType: 'image/jpeg', data: req.image_base64 } }] }]
          : [{ role: 'user' as const, parts: [{ text: req.prompt }] }];

        const response = await ai.models.generateContentStream({
          model: req.model,
          contents,
          config: {
            temperature: req.parameters.temperature,
            maxOutputTokens: req.parameters.max_tokens,
            topP: req.parameters.top_p,
            topK: req.parameters.top_k,
          },
        });

        for await (const chunk of response) {
          const text = chunk.text;
          if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err instanceof Error ? err.message : String(err) })}\n\n`));
        controller.close();
      }
    },
  });
}
