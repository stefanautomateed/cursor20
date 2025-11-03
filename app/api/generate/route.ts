import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { prompt, conversationHistory } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const systemPrompt = `You are an expert web developer who creates beautiful, modern, and functional websites.
When given a description, you generate complete, self-contained HTML files with inline CSS and JavaScript.

IMPORTANT RULES:
1. Generate ONLY a single, complete HTML file
2. Include ALL CSS in a <style> tag in the <head>
3. Include ALL JavaScript in a <script> tag before </body>
4. Make it visually appealing with modern design (gradients, shadows, animations)
5. Ensure it's responsive and works on mobile devices
6. Use semantic HTML5 elements
7. Include comments explaining key sections
8. Make it interactive where appropriate
9. Use a modern color scheme and typography
10. DO NOT include any markdown formatting, just pure HTML

The HTML should be production-ready and look professional.`;

    // Build conversation history for context
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history if exists
    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory);
    }

    // Add current prompt
    messages.push({ role: 'user', content: prompt });

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 4000,
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(customStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Error generating code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate code' },
      { status: 500 }
    );
  }
}
