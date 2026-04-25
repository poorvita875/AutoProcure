// Streaming API route for real-time Claude AI responses
// /app/api/claude/stream/route.ts

import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400 }
      );
    }

    // Create a streaming response
    const stream = await anthropic.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt || 'You are a helpful assistant for procurement and supply chain management.',
      messages: messages.map((msg: any) => ({
        role: msg.role === 'ai' ? 'assistant' : msg.role,
        content: msg.text || msg.content,
      })),
    });

    // Convert to ReadableStream for response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta?.type === 'text_delta'
            ) {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: 'text_delta',
                    text: chunk.delta.text,
                  }) + '\n'
                )
              );
            } else if (chunk.type === 'message_stop') {
              controller.enqueue(encoder.encode(JSON.stringify({ type: 'done' })));
            }
          }
        } catch (error: any) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Claude streaming error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process request' }),
      { status: 500 }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({ error: 'POST method required' }),
    { status: 405 }
  );
}
