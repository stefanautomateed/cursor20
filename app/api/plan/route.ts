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

    const systemPrompt = `You are an expert web architect and project planner. When given a high-level website request, you create comprehensive, detailed project plans.

Your job is to:
1. Understand the user's vision and expand on it
2. Design a complete multi-page website structure
3. Break down each page into detailed sections
4. Plan the design theme and aesthetics
5. Create a task-based implementation plan

OUTPUT FORMAT (must be valid JSON):
{
  "description": "Comprehensive overview of the website",
  "designTheme": {
    "colors": ["#color1", "#color2", "#color3"],
    "typography": "Font choices and hierarchy",
    "style": "Overall aesthetic (glassmorphism, minimalist, etc)"
  },
  "structure": ["List of all files needed"],
  "pages": [
    {
      "name": "Homepage",
      "route": "index.html",
      "description": "Detailed page description",
      "priority": 1,
      "sections": [
        {
          "name": "Hero Section",
          "description": "What this section does",
          "features": ["Feature 1", "Feature 2"]
        }
      ]
    }
  ]
}

IMPORTANT:
- Be EXTREMELY detailed in descriptions
- Each section should have 3-5 specific features
- Plan for ultra-modern, professional design
- Think about user experience and flow
- Include all necessary pages (About, Contact, etc)
- Prioritize pages (1 = highest priority)
- Return ONLY valid JSON, no markdown`;

    let planText = '';

    if (modelConfig.provider === 'anthropic') {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY || '',
      });

      const completion = await anthropic.messages.create({
        model: modelConfig.model,
        max_tokens: 4000,
        temperature: 0.8,
        system: systemPrompt,
        messages: [
          { role: 'user', content: `Create a comprehensive plan for: ${prompt}` }
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
        max_tokens: 4000,
        temperature: 0.8,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create a comprehensive plan for: ${prompt}` }
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
