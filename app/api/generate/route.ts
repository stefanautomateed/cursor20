import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { prompt, conversationHistory, currentFiles, operation } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
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
   - User wants to improve/change existing code
   - Analyze the existing files provided
   - Return ONLY the files that need changes
   - Make surgical edits while preserving what works
   - Return in same JSON format with only modified files

3. **ADD MODE** (Adding features):
   - User wants to add new functionality
   - Modify existing files or create new ones as needed
   - Return all affected files in JSON format

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

    // Build conversation history for context
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Add context about current files if they exist
    if (currentFiles && currentFiles.length > 0 && operation !== 'create') {
      const filesContext = currentFiles
        .map(f => `\n=== ${f.name} ===\n${f.content || ''}`)
        .join('\n\n');

      messages.push({
        role: 'system',
        content: `Current project files:\n${filesContext}\n\nOperation: ${operation.toUpperCase()}`,
      });
    }

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
      max_tokens: 6000,
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
