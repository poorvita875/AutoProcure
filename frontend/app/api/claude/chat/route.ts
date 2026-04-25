// API route for Claude AI integration
// /app/api/claude/chat/route.ts

import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt || 'You are a helpful assistant for procurement and supply chain management.',
      messages: messages.map((msg: any) => ({
        role: msg.role === 'ai' ? 'assistant' : msg.role,
        content: msg.text || msg.content,
      })),
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return NextResponse.json({
        text: content.text,
        role: 'assistant',
      });
    }

    return NextResponse.json({
      error: 'Unexpected response type from Claude',
    }, { status: 500 });
  } catch (error: any) {
    console.error('Claude API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'POST method required' },
    { status: 405 }
  );
}
