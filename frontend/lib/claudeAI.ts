// Claude AI utility functions
// /lib/claudeAI.ts

export interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  source?: string;
}

export interface ChatOptions {
  systemPrompt?: string;
  useStreaming?: boolean;
}

/**
 * Send a message to Claude AI and get a response
 */
export async function sendMessage(
  messages: Message[],
  options: ChatOptions = {}
): Promise<string> {
  try {
    const response = await fetch('/api/claude/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        systemPrompt: options.systemPrompt,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get response from Claude');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error sending message to Claude:', error);
    throw error;
  }
}

/**
 * Stream a message from Claude AI
 */
export async function* streamMessage(
  messages: Message[],
  options: ChatOptions = {}
): AsyncGenerator<string, void, unknown> {
  try {
    const response = await fetch('/api/claude/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        systemPrompt: options.systemPrompt,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to stream response from Claude');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.type === 'text_delta' && data.text) {
              yield data.text;
            }
            if (data.type === 'done') {
              return;
            }
          } catch (e) {
            // Skip parse errors
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error('Error streaming message from Claude:', error);
    throw error;
  }
}

/**
 * Process a document with Claude AI
 */
export async function processDocument(file: File): Promise<Record<string, any>> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/claude/process-document', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process document');
    }

    const data = await response.json();
    return data.extracted || data;
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
}

/**
 * Get procurement-specific system prompt
 */
export function getProcurementSystemPrompt(context: string = ''): string {
  return `You are an intelligent procurement assistant for SupplyMind, an AI-powered autonomous procurement platform.

Your role is to help users with:
- Invoice and document processing
- RFQ (Request for Quote) management
- Vendor evaluation
- Purchase order management
- Procurement analytics
- Supply chain optimization

You have access to procurement data and can provide insights, recommendations, and process documents.

${context ? `Additional context: ${context}` : ''}

Always be clear, concise, and provide actionable information. When dealing with numbers, be precise.`;
}

/**
 * Parse Claude's streaming response into messages
 */
export function parseStreamingResponse(text: string): Message {
  return {
    id: `ai_${Date.now()}`,
    role: 'ai',
    text,
  };
}

/**
 * Create a user message
 */
export function createUserMessage(text: string): Message {
  return {
    id: `user_${Date.now()}`,
    role: 'user',
    text,
  };
}
