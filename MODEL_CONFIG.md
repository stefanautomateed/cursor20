# 🤖 AI Model Configuration

## Current Model: Claude Sonnet 4.5

Vibe Coder now uses **Anthropic's Claude Sonnet 4.5** for all code generation tasks!

### Why Claude Sonnet 4.5?
- **Exceptional Coding Quality**: Claude Sonnet 4.5 is one of the best models for code generation
- **Large Context Window**: 200K tokens for handling complex projects
- **Fast & Reliable**: Quick responses with consistent quality
- **Cost-Effective**: Great balance of quality and price
- **Latest Model**: Released May 2025 with cutting-edge capabilities

## Model Details

**Model Used**: `claude-sonnet-4-20250514`

### All Endpoints Use Claude Sonnet 4.5:
1. **Planning** (`/api/plan`) - Creates project architecture and task breakdown
2. **Task Execution** (`/api/execute-task`) - Generates code for each section
3. **Refinements** (`/api/generate`) - Makes surgical edits to existing code

## Pricing

**Claude Sonnet 4.5 Pricing:**
- **Input**: $3 per million tokens
- **Output**: $15 per million tokens

### Cost Per Project
For a typical autonomous project generation:
- **Planning**: ~3,000 tokens input = $0.009
- **Code Generation**: ~30,000 tokens input, ~20,000 tokens output per task × 5 tasks = ~$1.95
- **Total**: ~$2 per complete website

This is comparable to the OpenAI hybrid approach, but with superior code quality!

## API Key Setup

### Getting Your API Key

1. Go to: https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key (starts with `sk-ant-`)

### Adding Your API Key

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and add your key:**
   ```bash
   ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
   ```

3. **That's it!** The application will automatically use your API key.

### Important Notes:
- ⚠️ Never commit your `.env` file to git (it's already in `.gitignore`)
- 🔒 Keep your API key secret
- 💰 Monitor usage at: https://console.anthropic.com/settings/cost

## Configuration Options

### Adjusting Max Tokens

Edit the API routes to change token limits:

**Planning** (`/app/api/plan/route.ts`, line 64):
```typescript
max_tokens: 4000, // Adjust for longer plans
```

**Task Execution** (`/app/api/execute-task/route.ts`, line 59):
```typescript
max_tokens: 8000, // Adjust for longer code sections
```

**Refinements** (`/app/api/generate/route.ts`, line 115):
```typescript
max_tokens: 8000, // Adjust for larger changes
```

### Adjusting Temperature

Control creativity vs consistency:

```typescript
temperature: 0.7, // Range: 0.0 (deterministic) to 1.0 (creative)
```

- **0.0-0.3**: Very consistent, deterministic
- **0.4-0.7**: Balanced (recommended)
- **0.8-1.0**: More creative, varied outputs

## Alternative Models

### Claude 3.5 Sonnet (Previous Version)
If you want to use the previous version:
```typescript
model: 'claude-3-5-sonnet-20241022',
```

### Claude Opus (Premium)
For maximum quality (more expensive):
```typescript
model: 'claude-opus-4-20250514',
```
- **Pricing**: $15 input / $75 output per million tokens
- Best for extremely complex requirements

### Claude Haiku (Budget)
For cost optimization:
```typescript
model: 'claude-3-5-haiku-20241022',
```
- **Pricing**: $0.80 input / $4 output per million tokens
- Good for simpler projects

## Performance Comparison

| Model | Code Quality | Speed | Context | Cost |
|-------|-------------|-------|---------|------|
| Claude Sonnet 4.5 | ⭐⭐⭐⭐⭐ | Fast | 200K | $$ |
| Claude Opus 4 | ⭐⭐⭐⭐⭐ | Medium | 200K | $$$$ |
| Claude 3.5 Haiku | ⭐⭐⭐⭐ | Very Fast | 200K | $ |

## Advantages Over OpenAI

✅ **Better Code Quality**: Claude is renowned for coding capabilities
✅ **Larger Context**: 200K vs 128K tokens
✅ **Consistent Output**: More reliable JSON formatting
✅ **No Rate Limits**: Generally more permissive
✅ **Better Understanding**: Excellent at following complex instructions

## Monitoring Usage

Track your API usage and costs:
- Dashboard: https://console.anthropic.com/settings/cost
- Set usage limits to avoid unexpected bills
- Monitor token consumption per project

## Troubleshooting

### "API key is missing" error
- Check your `.env` file exists
- Verify `ANTHROPIC_API_KEY` is set correctly
- Restart your dev server after adding the key

### Rate limits
- Claude has generous rate limits
- If you hit them, wait a moment and retry
- Consider upgrading your plan for higher limits

### Streaming issues
- Ensure your API key has streaming permissions
- Check console for detailed error messages

## Example `.env` File

```bash
# Anthropic API Key (Required)
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Optional: For debugging
NODE_ENV=development
```

---

**Ready to start?** Just add your API key and run `npm run dev`! 🚀
