# 🤖 AI Model Configuration

## Current Models

Vibe Coder uses a **hybrid model approach** for optimal quality and cost:

### Planning Phase
- **Model**: `gpt-4o-mini`
- **Cost**: $0.15 per 1M input / $0.60 per 1M output tokens
- **Purpose**: Creates comprehensive project plans, architecture, and task breakdowns
- **Why**: Planning requires strategic thinking but not code generation, making the cheaper model perfect

### Code Generation
- **Model**: `gpt-4o`
- **Cost**: $2.50 per 1M input / $10.00 per 1M output tokens
- **Purpose**: Generates actual code for each task/section
- **Why**: Ensures impeccable, ultra-modern design quality (Stripe/Linear/Vercel level)

## Cost Optimization

For a typical project generation:
- **Planning**: ~2,000 tokens = $0.001
- **Code Generation**: ~20,000 tokens per task × 5 tasks = $2.00
- **Total**: ~$2.00 per complete website

### Budget-Friendly Option

To save ~75% on costs, you can use `gpt-4o-mini` for both phases:

**In `/app/api/execute-task/route.ts` (line 62):**
```typescript
// Change this line:
model: 'gpt-4o', // Current

// To this:
model: 'gpt-4o-mini', // Budget-friendly
```

**Trade-offs:**
- ✅ 75% cost reduction
- ⚠️ Slightly less creative designs
- ⚠️ May need more refinement prompts

## Alternative Models

### If OpenAI releases GPT-5 nano (as mentioned by user)
Once available, consider:
- **GPT-5 nano**: $0.05 per 1M input / $0.40 per 1M output
- Even cheaper than gpt-4o-mini
- May be suitable for both planning and generation
- Test quality before switching

### Recommended Strategy
1. **Start with**: Current setup (gpt-4o-mini for planning, gpt-4o for generation)
2. **If costs are high**: Switch both to gpt-4o-mini
3. **When GPT-5 nano available**: Test and potentially switch planning phase

## Changing Models

### Planning Model
Edit `/app/api/plan/route.ts`:
```typescript
model: 'gpt-4o-mini', // Line 48
```

### Code Generation Model
Edit `/app/api/execute-task/route.ts`:
```typescript
model: 'gpt-4o', // Line 62
```

### Simple Mode (Refinements)
Edit `/app/api/generate/route.ts`:
```typescript
model: 'gpt-4o', // Line 100
```

## Performance Comparison

| Model | Planning | Code Quality | Cost | Speed |
|-------|----------|--------------|------|-------|
| gpt-4o | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $$$$ | Medium |
| gpt-4o-mini | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $ | Fast |
| gpt-5-nano* | ⭐⭐⭐ | ⭐⭐⭐ | $ | Very Fast |

*Not yet available as of January 2025

## Monitoring Usage

Track your API costs at: https://platform.openai.com/usage

Set up usage limits in your OpenAI dashboard to avoid unexpected bills.
