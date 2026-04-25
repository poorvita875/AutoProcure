// Document processing with Claude AI
// /app/api/claude/process-document/route.ts

import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Read file as base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    
    // Determine media type
    const ext = file.name.split('.').pop()?.toLowerCase();
    let mediaType = 'application/pdf';
    if (ext === 'xlsx' || ext === 'xls') {
      mediaType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }
    if (['jpg', 'jpeg'].includes(ext || '')) {
      mediaType = 'image/jpeg';
    }
    if (ext === 'png') {
      mediaType = 'image/png';
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: 'text',
              text: `Please analyze this document and extract key information. 
              
              If it's an invoice, extract:
              - Vendor name
              - Invoice number
              - Invoice date
              - Due date
              - Total amount
              - Line items
              - GST/Tax info
              - PO reference
              
              If it's a PO, RFQ, or other document, extract relevant details.
              
              Return the data in JSON format.`,
            },
          ],
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        const extracted = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content.text };
        return NextResponse.json({
          success: true,
          extracted,
          confidence: 85,
        });
      } catch (parseError) {
        return NextResponse.json({
          success: true,
          extracted: { raw: content.text },
        });
      }
    }

    return NextResponse.json(
      { error: 'Unexpected response type from Claude' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Document processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process document' },
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
