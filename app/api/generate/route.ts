import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { FileItem } from '@/types';
import { getModelById } from '@/lib/modelConfig';

// Using Node runtime for better environment variable support
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { prompt, conversationHistory, currentFiles, operation, modelId = 'gpt-4o-mini' } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const modelConfig = getModelById(modelId);
    if (!modelConfig) {
      return NextResponse.json({ error: 'Invalid model ID' }, { status: 400 });
    }

    const systemPrompt = `You are an elite web developer and designer who creates STUNNING, ultra-modern websites with impeccable attention to detail.

Your designs are characterized by:
- Cutting-edge modern aesthetics (glassmorphism, gradients, subtle animations)
- Perfect typography hierarchy with modern fonts
- Beautiful color palettes (think Stripe, Linear, Vercel quality)
- Smooth micro-interactions and hover effects
- Flawless responsive design
- Clean, semantic code structure
- Accessibility best practices

OPERATION MODES:

1. **CREATE MODE** (Initial generation):
   - Generate a complete, multi-file project structure
   - Return files in this EXACT JSON format:
   {
     "files": [
       {"name": "index.html", "content": "...full HTML..."},
       {"name": "styles.css", "content": "...full CSS..."},
       {"name": "script.js", "content": "...full JavaScript..."}
     ]
   }
   - Use separate files for HTML, CSS, and JavaScript
   - Make the design absolutely beautiful and modern

2. **REFINE MODE** (Iterative improvements):
   ⚠️ CRITICAL - DO NOT REWRITE FROM SCRATCH ⚠️

   When user asks for refinements/changes:

   STEP 1 - ANALYZE:
   - Read and understand ALL existing files in the project
   - Identify EXACTLY which files need changes
   - Identify EXACTLY which parts of those files need modification

   STEP 2 - MINIMAL CHANGES:
   - Make ONLY the specific changes requested
   - Do NOT rewrite entire files
   - Do NOT regenerate the whole website
   - PRESERVE all existing code that doesn't need to change
   - Keep the same structure, classes, IDs unless specifically asked to change them

   STEP 3 - RETURN:
   - Return ONLY the files that actually need modifications
   - If only CSS needs changes, return ONLY the CSS file
   - If only one HTML section needs changes, return the FULL HTML file with ONLY that section modified
   - Do NOT return files that don't need any changes

   EXAMPLES:
   - User: "Make the header sticky" → Return ONLY styles.css with sticky header CSS added
   - User: "Change button color to blue" → Return ONLY styles.css with button color changed
   - User: "Add smooth scroll" → Return ONLY script.js with smooth scroll added
   - User: "Make text bigger in hero" → Return ONLY the files containing hero text styling

   Return in same JSON format with ONLY modified files.

3. **ADD MODE** (Adding features):
   - User wants to add new functionality
   - Modify existing files or create new ones as needed
   - Return all affected files in JSON format
   - Still make surgical edits - don't rewrite entire files unless necessary

DESIGN REQUIREMENTS:
- Use modern CSS features (CSS Grid, Flexbox, CSS Variables, backdrop-filter)
- Implement smooth transitions and subtle animations
- Add hover effects and micro-interactions
- Use beautiful gradients and shadows
- Ensure perfect mobile responsiveness
- Add loading states and empty states where relevant
- Use modern color schemes (avoid basic colors)
- Implement proper spacing and visual hierarchy

CODE QUALITY:
- Clean, readable, well-commented code
- Semantic HTML5 elements
- BEM or logical CSS class naming
- Modular JavaScript with clear functions
- No inline styles (except CSS variables)

ALWAYS return valid JSON with the "files" array. Each file object must have "name" and "content" properties.`;

    const encoder = new TextEncoder();

    if (modelConfig.provider === 'anthropic') {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY || '',
      });

      const messages: Anthropic.MessageParam[] = [];

      // Add context about current files if they exist
      if (currentFiles && currentFiles.length > 0 && operation !== 'create') {
        const filesContext = (currentFiles as FileItem[])
          .map((f: FileItem) => `\n=== ${f.name} ===\n${f.content || ''}`)
          .join('\n\n');

        messages.push({
          role: 'user',
          content: `Current project files:\n${filesContext}\n\nOperation: ${operation.toUpperCase()}`,
        });
        messages.push({
          role: 'assistant',
          content: 'I understand the current project files and the operation mode. I\'m ready to help.',
        });
      }

      // Add conversation history if exists
      if (conversationHistory && conversationHistory.length > 0) {
        conversationHistory.forEach((msg: any) => {
          if (msg.role === 'user' || msg.role === 'assistant') {
            messages.push({
              role: msg.role,
              content: msg.content,
            });
          }
        });
      }

      // Add current prompt
      messages.push({
        role: 'user',
        content: prompt,
      });

      const stream = await anthropic.messages.stream({
        model: modelConfig.model,
        max_tokens: 8000,
        temperature: 0.7,
        system: systemPrompt,
        messages,
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

      const messages: OpenAI.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt }
      ];

      // Add context about current files if they exist
      if (currentFiles && currentFiles.length > 0 && operation !== 'create') {
        const filesContext = (currentFiles as FileItem[])
          .map((f: FileItem) => `\n=== ${f.name} ===\n${f.content || ''}`)
          .join('\n\n');

        messages.push({
          role: 'user',
          content: `Current project files:\n${filesContext}\n\nOperation: ${operation.toUpperCase()}`,
        });
        messages.push({
          role: 'assistant',
          content: 'I understand the current project files and the operation mode. I\'m ready to help.',
        });
      }

      // Add conversation history if exists
      if (conversationHistory && conversationHistory.length > 0) {
        conversationHistory.forEach((msg: any) => {
          if (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system') {
            messages.push({
              role: msg.role,
              content: msg.content,
            });
          }
        });
      }

      // Add current prompt
      messages.push({
        role: 'user',
        content: prompt,
      });

      const stream = await openai.chat.completions.create({
        model: modelConfig.model,
        max_tokens: 8000,
        temperature: 0.7,
        messages,
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
    console.error('Error generating code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate code' },
      { status: 500 }
    );
  }
}
