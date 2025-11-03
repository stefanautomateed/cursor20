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

    const systemPrompt = `You are an elite Next.js 14 developer and designer who creates STUNNING, ultra-modern web applications with impeccable attention to detail.

Your designs are characterized by:
- Cutting-edge modern aesthetics (glassmorphism, gradients, subtle animations)
- Perfect typography hierarchy with modern fonts
- Beautiful color palettes (think Stripe, Linear, Vercel quality)
- Smooth micro-interactions and hover effects with Framer Motion
- Flawless responsive design (mobile-first)
- Clean, semantic TypeScript/React code
- Accessibility best practices

TECH STACK (ALWAYS USE):
- Next.js 14 with App Router
- TypeScript for ALL files
- Tailwind CSS for ALL styling
- Framer Motion for animations
- Lucide React for icons (never use emojis)

OPERATION MODES:

1. **CREATE MODE** (Initial generation):
   - Generate a complete Next.js 14 project structure
   - Return files in this EXACT JSON format:
   {
     "files": [
       {"name": "app/globals.css", "content": "...Tailwind imports and custom styles..."},
       {"name": "app/layout.tsx", "content": "...Root layout..."},
       {"name": "app/page.tsx", "content": "...Homepage component..."},
       {"name": "components/Header.tsx", "content": "...Component..."},
       {"name": "tailwind.config.ts", "content": "...Tailwind config..."}
     ]
   }
   - MUST include: globals.css, layout.tsx, page.tsx, tailwind.config.ts
   - Use TypeScript (.tsx) for all components
   - Use 'use client' directive for interactive components
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
   - Do NOT rewrite entire components/files
   - Do NOT regenerate the whole application
   - PRESERVE all existing code that doesn't need to change
   - Keep the same component structure and props unless specifically asked to change

   STEP 3 - RETURN:
   - Return ONLY the files that actually need modifications
   - If only styling changes, return ONLY globals.css or the component with updated Tailwind classes
   - If only one component needs changes, return ONLY that component
   - Do NOT return files that don't need any changes

   EXAMPLES:
   - User: "Make the header sticky" → Return ONLY components/Header.tsx with sticky positioning
   - User: "Change button color to blue" → Return ONLY the component with button, update Tailwind classes
   - User: "Add smooth scroll animation" → Return ONLY affected component with Framer Motion added
   - User: "Make hero text bigger" → Return ONLY the component containing hero, update text size classes

   Return in same JSON format with ONLY modified files.

3. **ADD MODE** (Adding features):
   - User wants to add new functionality
   - Create new components or modify existing ones as needed
   - Return all affected files in JSON format
   - Still make surgical edits - don't rewrite entire files unless necessary
   - Use TypeScript, Tailwind, Framer Motion, Lucide icons

DESIGN REQUIREMENTS:
- Use Tailwind CSS utilities for all styling
- Implement Framer Motion for smooth transitions and animations
- Add hover effects and micro-interactions using Tailwind and Framer Motion
- Use beautiful gradients (bg-gradient-to-r, etc.) and shadows
- Ensure perfect mobile responsiveness (mobile-first approach)
- Add loading states and empty states where relevant
- Use modern color schemes with Tailwind colors
- Implement proper spacing with Tailwind spacing scale
- Use Lucide React icons (never emojis)

CODE QUALITY:
- TypeScript with proper type annotations
- Use 'use client' for interactive components
- Use 'use server' for server actions if needed
- Semantic HTML5 elements (header, main, section, article, etc.)
- Clear component structure with proper imports
- Props interfaces defined with TypeScript
- Modular components in separate files
- Follow Next.js 14 App Router conventions

ESSENTIAL FILES (always include these if creating from scratch):
- app/globals.css - Must include Tailwind directives:
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

- app/layout.tsx - Root layout with metadata

- app/page.tsx - Homepage component

- tailwind.config.ts - Tailwind configuration with custom theme

- components/ - Reusable components

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
