# AI Chat Debug Guide

## Problem
The AI chat returns "I'm having a little trouble connecting right now. Please try again in a moment!" when asking about items.

## Confirmed Working
- ✅ OpenRouter API key is configured on Netlify
- ✅ OpenRouter shows activity from Jotya Marketplace (API calls are reaching OpenRouter)

## What We Added
Enhanced logging to track exactly where the error occurs:

```
[chatWithAI] Starting request with message: <user message>
[chatWithAI] Got completion from AI
[chatWithAI] Response content: <AI response>
[chatWithAI] Parsed result: <parsed JSON>
[chatWithAI] Processing search request with criteria: <search criteria>
[chatWithAI] Database query where clause: <prisma where>
[chatWithAI] Found listings: <count>
```

## How to Debug

### Step 1: Check Netlify Logs
1. Go to https://app.netlify.com
2. Select your Jotya site
3. Go to **Deploys** → **Site is live** (latest deploy)
4. Click **Functions** tab
5. Find logs for when you test the AI chat

### Step 2: Look for the Error
The logs will show exactly which step failed:

**If you see:**
- `[chatWithAI] Starting request` but NOT `[chatWithAI] Got completion from AI`
  → **Problem**: OpenRouter API call is failing
  → **Fix**: Check OPENROUTER_API_KEY is correct

- `[chatWithAI] Got completion from AI` but NOT `[chatWithAI] Response content`
  → **Problem**: AI returned empty response
  → **Fix**: Model might be unavailable, check OpenRouter status

- `[chatWithAI] Response content` but NOT `[chatWithAI] Parsed result`
  → **Problem**: AI returned invalid JSON
  → **Fix**: Check the response content in logs, AI might need better prompting

- `[chatWithAI] Parsed result` but NOT `[chatWithAI] Found listings`
  → **Problem**: Database query is failing
  → **Fix**: Check DATABASE_URL and DIRECT_URL environment variables

- `[chatWithAI] ERROR:` followed by error details
  → **Problem**: Check the error message and stack trace

## Most Likely Issues

### 1. Database Connection (Most Likely)
**Symptoms**: Logs show search parsing works but fails at database query

**Check**:
- Netlify environment variables include:
  - `DATABASE_URL` (Supabase Transaction pooler, port 6543, with `?pgbouncer=true`)
  - `DIRECT_URL` (Supabase Direct connection, port 5432)

**Fix**:
```bash
# Correct format:
DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.<ref>:<password>@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

### 2. Prisma Client Not Generated
**Symptoms**: Import error or "PrismaClient is not a constructor"

**Fix**: Netlify build command should include:
```bash
npx prisma generate && npm run build
```

### 3. JSON Parsing Error
**Symptoms**: AI returns text instead of JSON

**Fix**: Already handled in code, but check if AI model supports `response_format: { type: 'json_object' }`

## Next Steps
1. Push this version with logging to Netlify (DONE)
2. Wait for deployment
3. Test the AI chat
4. Check Netlify function logs
5. Share the logs here so we can see the exact error
