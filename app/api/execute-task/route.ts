import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { task, projectPlan, existingFiles } = await req.json();

    if (!task) {
      return NextResponse.json({ error: 'Task is required' }, { status: 400 });
    }

    const systemPrompt = `You are an elite web developer executing a specific task within a larger project.

PROJECT CONTEXT:
${JSON.stringify(projectPlan, null, 2)}

EXISTING FILES:
${existingFiles?.map((f: any) => f.name).join(', ') || 'None yet'}

YOUR TASK:
${JSON.stringify(task, null, 2)}

INSTRUCTIONS:
1. Focus ONLY on this specific task
2. Generate high-quality, production-ready code
3. Use ultra-modern design (glassmorphism, gradients, animations)
4. Ensure consistency with project theme
5. Make it visually stunning and professional
6. Add smooth interactions and micro-animations

OUTPUT FORMAT (must be valid JSON):
{
  "files": [
    {
      "name": "filename.ext",
      "content": "full file content"
    }
  ]
}

DESIGN QUALITY:
- Stripe/Linear/Vercel level aesthetics
- Perfect typography and spacing
- Beautiful color gradients
- Smooth transitions
- Mobile responsive
- Accessibility compliant

Return ONLY valid JSON with the files array.`;

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        { role: 'user', content: `Execute this task: ${task.description}` }
      ],
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const content = chunk.delta.text;
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
    console.error('Error executing task:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute task' },
      { status: 500 }
    );
  }
}
