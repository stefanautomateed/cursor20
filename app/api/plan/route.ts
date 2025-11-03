import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { getModelById } from '@/lib/modelConfig';

// Using Node runtime for better environment variable support
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { prompt, modelId = 'gpt-4o-mini' } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const modelConfig = getModelById(modelId);
    if (!modelConfig) {
      return NextResponse.json({ error: 'Invalid model ID' }, { status: 400 });
    }

    const systemPrompt = `You are an expert Next.js 14 architect and project planner specializing in modern web applications.

Your job is to:
1. Understand the user's vision and expand on it
2. Design a complete Next.js 14 app using App Router
3. Plan the file structure with all necessary files
4. Select modern libraries and tools
5. Break down each page into detailed sections
6. Create a task-based implementation plan

TECH STACK (ALWAYS USE THESE):
- Next.js 14 with App Router
- TypeScript (for all components)
- Tailwind CSS (utility-first styling)
- Framer Motion (animations)
- Lucide React (modern icons)
- Optional: Shadcn/ui components (for complex UI elements)

ESSENTIAL FILES (MUST ALWAYS INCLUDE):
1. app/globals.css - Global styles and Tailwind imports
2. app/layout.tsx - Root layout with metadata
3. app/page.tsx - Homepage component
4. tailwind.config.ts - Tailwind configuration
5. components/ directory - Reusable components
6. Additional pages as needed (app/about/page.tsx, etc.)

OUTPUT FORMAT (must be valid JSON):
{
  "description": "Comprehensive overview of the Next.js application",
  "techStack": {
    "framework": "Next.js 14 (App Router)",
    "styling": "Tailwind CSS",
    "animations": "Framer Motion",
    "icons": "Lucide React",
    "additionalLibraries": ["Any extra libraries needed"]
  },
  "designTheme": {
    "colors": {
      "primary": "#hex",
      "secondary": "#hex",
      "accent": "#hex",
      "background": "#hex",
      "text": "#hex"
    },
    "typography": {
      "headingFont": "Font name",
      "bodyFont": "Font name",
      "scale": "Typographic scale approach"
    },
    "style": "Overall aesthetic (glassmorphism, neubrutalism, minimalist, etc)"
  },
  "fileStructure": [
    "app/globals.css",
    "app/layout.tsx",
    "app/page.tsx",
    "components/Header.tsx",
    "components/Footer.tsx",
    "... (list ALL files that will be created)"
  ],
  "pages": [
    {
      "name": "Homepage",
      "route": "/",
      "file": "app/page.tsx",
      "description": "Detailed page description",
      "priority": 1,
      "sections": [
        {
          "name": "Hero Section",
          "component": "HeroSection",
          "description": "What this section does and displays",
          "features": ["Feature 1", "Feature 2", "Feature 3"],
          "animations": "Specific Framer Motion animations to use"
        }
      ]
    }
  ]
}

IMPORTANT REQUIREMENTS:
- Plan for ultra-modern, professional Next.js 14 application
- Use TypeScript for ALL components
- Use Tailwind CSS for ALL styling (no separate CSS modules)
- Include Framer Motion animations for smooth interactions
- Use Lucide React for all icons (never use emojis or other icon libraries)
- Plan responsive design (mobile-first approach)
- Each section should have 3-5 specific features
- Include all necessary pages (About, Contact, etc.)
- Prioritize pages (1 = highest priority)
- Always include essential files: globals.css, layout.tsx, page.tsx
- Be EXTREMELY detailed in descriptions
- Think about user experience and flow
- Return ONLY valid JSON, no markdown`;

    let planText = '';

    if (modelConfig.provider === 'anthropic') {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY || '',
      });

      const completion = await anthropic.messages.create({
        model: modelConfig.model,
        max_tokens: 5000,
        temperature: 0.8,
        system: systemPrompt,
        messages: [
          { role: 'user', content: `Create a comprehensive Next.js 14 project plan for: ${prompt}` }
        ],
      });

      planText = completion.content[0].type === 'text' ? completion.content[0].text : '';
    } else {
      // OpenAI
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || '',
      });

      const completion = await openai.chat.completions.create({
        model: modelConfig.model,
        max_tokens: 5000,
        temperature: 0.8,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create a comprehensive Next.js 14 project plan for: ${prompt}` }
        ],
      });

      planText = completion.choices[0].message.content || '';
    }

    // Try to extract JSON
    let jsonStr = planText.trim();
    if (jsonStr.includes('```json')) {
      const match = jsonStr.match(/```json\s*\n([\s\S]*?)\n```/);
      if (match) jsonStr = match[1];
    } else if (jsonStr.includes('```')) {
      const match = jsonStr.match(/```\s*\n([\s\S]*?)\n```/);
      if (match) jsonStr = match[1];
    }

    const plan = JSON.parse(jsonStr);

    return NextResponse.json({ plan });
  } catch (error: any) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create plan' },
      { status: 500 }
    );
  }
}
