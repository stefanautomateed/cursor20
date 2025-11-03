import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { getModelById } from '@/lib/modelConfig';

// Using Node runtime for better environment variable support
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { task, projectPlan, existingFiles, modelId = 'gpt-4o-mini' } = await req.json();

    if (!task) {
      return NextResponse.json({ error: 'Task is required' }, { status: 400 });
    }

    const modelConfig = getModelById(modelId);
    if (!modelConfig) {
      return NextResponse.json({ error: 'Invalid model ID' }, { status: 400 });
    }

    // Build context of existing files with their content
    const existingFilesContext = existingFiles && existingFiles.length > 0
      ? existingFiles.map((f: any) => `\n=== ${f.name} ===\n${f.content || ''}`).join('\n\n')
      : 'No existing files yet - this is the first task';

    const systemPrompt = `You are an elite web developer executing a specific task within a larger project.

PROJECT CONTEXT:
${JSON.stringify(projectPlan, null, 2)}

EXISTING FILES (IMPORTANT - Review these to understand what's already built):
${existingFilesContext}

YOUR TASK:
${JSON.stringify(task, null, 2)}

⚠️ CRITICAL INSTRUCTIONS ⚠️

1. **REVIEW EXISTING FILES FIRST**:
   - Carefully read all existing files above
   - Understand what's already been implemented
   - Identify what classes, IDs, and structures already exist
   - Build on top of existing code, don't duplicate or conflict

2. **INCREMENTAL DEVELOPMENT**:
   - This task is part of a larger project being built in parallel
   - Other tasks may be running simultaneously
   - Focus ONLY on this specific task's section/feature
   - Don't recreate files that already exist - modify them
   - If a file exists (like index.html), ADD to it, don't replace it entirely

3. **COORDINATION**:
   - Use consistent naming with existing files
   - Reuse existing CSS variables and classes where possible
   - Don't duplicate CSS rules that might already exist
   - Ensure your code integrates smoothly with existing code

4. **OUTPUT**:
   - If modifying an existing file, return the COMPLETE file with your additions
   - If creating a new file, return just that new file
   - Use ultra-modern design (glassmorphism, gradients, animations)
   - Ensure consistency with project theme
   - Make it visually stunning and professional

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

    const encoder = new TextEncoder();

    if (modelConfig.provider === 'anthropic') {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY || '',
      });

      const stream = await anthropic.messages.stream({
        model: modelConfig.model,
        max_tokens: 8000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          { role: 'user', content: `Execute this task: ${task.description}` }
        ],
      });

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
    } else {
      // OpenAI
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || '',
      });

      const stream = await openai.chat.completions.create({
        model: modelConfig.model,
        max_tokens: 8000,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Execute this task: ${task.description}` }
        ],
        stream: true,
      });

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
    }
  } catch (error: any) {
    console.error('Error executing task:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute task' },
      { status: 500 }
    );
  }
}
