# Google Gemini API Setup Guide

This project now uses **Google Gemini** instead of Anthropic Claude for AI-powered summarization.

## Why Gemini?

✅ **Generous Free Tier**: 15 requests per minute, 1 million tokens per month
✅ **No Credit Card Required**: Start using immediately
✅ **Fast & Reliable**: Gemini 1.5 Flash is optimized for speed
✅ **Cost-Effective**: Free tier is more than enough for personal podcast summarization

## Getting Your Gemini API Key

### Step 1: Go to Google AI Studio

Visit: **https://aistudio.google.com/**

### Step 2: Sign In

- Click "Get API Key" or "Sign in with Google"
- Use your Google account (Gmail)

### Step 3: Create API Key

1. Click **"Get API key"** button in the top right
2. Select **"Create API key in new project"** (or use existing project)
3. Your API key will be generated instantly
4. **Copy the API key** - it looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### Step 4: Save Your API Key

**Option A: Using .env file (Recommended)**

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your key:
   ```bash
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

**Option B: Using config.json**

1. Copy the example file:
   ```bash
   cp config.json.example config.json
   ```

2. Edit `config.json` and add your key:
   ```json
   {
     "gemini_api_key": "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
     ...
   }
   ```

### Step 5: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install the `google-generativeai` package.

## Available Models

The script uses **gemini-1.5-flash** by default (best for this use case):

| Model | Speed | Quality | Cost (Free Tier) |
|-------|-------|---------|------------------|
| `gemini-1.5-flash` | ⚡ Very Fast | ⭐⭐⭐ Good | ✅ Free |
| `gemini-1.5-pro` | 🐌 Slower | ⭐⭐⭐⭐⭐ Excellent | ✅ Free |
| `gemini-1.0-pro` | ⚡ Fast | ⭐⭐⭐ Good | ✅ Free |

**Recommendation**: Stick with `gemini-1.5-flash` - it's fast and free!

## Free Tier Limits

Google's free tier includes:

- **15 RPM** (Requests Per Minute)
- **1 Million TPM** (Tokens Per Minute)
- **1,500 RPD** (Requests Per Day)

**For podcast summarization:**
- 1 episode = 1 request
- Average transcript = 5,000-10,000 tokens
- You can process **100+ episodes per day** for free!

## Pricing (If You Exceed Free Tier)

**Gemini 1.5 Flash:**
- Input: $0.075 per 1M tokens
- Output: $0.30 per 1M tokens

**Cost per podcast episode:**
- ~$0.0008 (less than a tenth of a penny!)

**Monthly cost for 30 episodes:**
- ~$0.024 (2.4 cents per month)

**Comparison to Anthropic Claude:**
- Gemini: $0.024/month (with generous free tier)
- Claude Haiku: $0.09/month (no free tier, requires payment)

## Testing Your Setup

1. Make sure your API key is configured
2. Run a test:
   ```bash
   python run_summarizer.py
   ```

3. Check the logs:
   ```bash
   tail -f summarizer.log
   ```

You should see:
```
Successfully generated summary for '[Video Title]'
```

## Troubleshooting

### Error: "API key not found"

**Solution**: Make sure you've set `GEMINI_API_KEY` in your `.env` or `config.json`

### Error: "quota exceeded"

**Solution**: You've hit the free tier limits. Wait a minute or upgrade to paid tier.

### Error: "API key not valid"

**Solution**:
1. Go back to https://aistudio.google.com/
2. Check your API key is correct
3. Try generating a new API key

### Summaries are low quality

**Solution**: Try switching to `gemini-1.5-pro` for better quality:

In `.env`:
```bash
GEMINI_MODEL=gemini-1.5-pro
```

Or in `config.json`:
```json
{
  "gemini_model": "gemini-1.5-pro"
}
```

## Security Best Practices

1. **Never commit your API key to git**
   - `.env` and `config.json` are already in `.gitignore`

2. **Rotate keys periodically**
   - Generate a new key every few months

3. **Restrict API key** (optional)
   - In Google AI Studio, you can restrict keys to specific IPs or domains

4. **Monitor usage**
   - Check https://aistudio.google.com/ to see your quota usage

## Switching Back to Claude (Optional)

If you want to switch back to Anthropic Claude:

1. Install the Anthropic SDK:
   ```bash
   pip install anthropic
   ```

2. Modify `summarizer.py`:
   - Change `import google.generativeai as genai` → `import anthropic`
   - Rename `GeminiSummarizer` → `ClaudeSummarizer`
   - Update the implementation to use Claude's API

3. Update configuration files to use `ANTHROPIC_API_KEY`

But honestly, Gemini's free tier is hard to beat!

## Quick Start Checklist

- [ ] Go to https://aistudio.google.com/
- [ ] Sign in with Google account
- [ ] Click "Get API key"
- [ ] Copy your API key
- [ ] Add to `.env` or `config.json`
- [ ] Run `pip install -r requirements.txt`
- [ ] Test with `python run_summarizer.py`
- [ ] Check logs for success message

## Support

**Google AI Studio**: https://aistudio.google.com/
**Gemini Documentation**: https://ai.google.dev/docs
**Pricing Info**: https://ai.google.dev/pricing

---

**You're all set!** 🎉

Gemini's free tier should cover all your podcast summarization needs without costing a penny!
