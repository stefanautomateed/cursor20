export interface ModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic';
  model: string;
  description: string;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'good' | 'great' | 'excellent';
  costPer1kTokens: number;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    model: 'gpt-4o-mini',
    description: 'Fast and affordable - best for quick iterations',
    speed: 'fast',
    quality: 'great',
    costPer1kTokens: 0.00015,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    model: 'gpt-4o',
    description: 'Balanced speed and quality',
    speed: 'medium',
    quality: 'excellent',
    costPer1kTokens: 0.005,
  },
  {
    id: 'claude-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    model: 'claude-3-5-haiku-20241022',
    description: 'Lightning fast Claude model',
    speed: 'fast',
    quality: 'great',
    costPer1kTokens: 0.001,
  },
  {
    id: 'claude-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    description: 'Most capable - slower but highest quality',
    speed: 'slow',
    quality: 'excellent',
    costPer1kTokens: 0.003,
  },
];

export const DEFAULT_MODEL_ID = 'gpt-4o-mini';

export function getModelById(id: string): ModelConfig | undefined {
  return AVAILABLE_MODELS.find(m => m.id === id);
}
