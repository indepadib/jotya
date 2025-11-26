# OpenAI API Setup for Netlify

## ⚠️ SECURITY ALERT
**YOU MUST ROTATE YOUR API KEY IMMEDIATELY!**

The API key you shared in chat (`sk-proj-DXfTx5Je7MG...`) is now compromised because it was posted in plain text. 

### Rotate the Key Now:
1. Go to https://platform.openai.com/api-keys
2. Find the key that starts with `sk-proj-DXfTx5Je7MG...`
3. Click **Delete** or **Revoke**
4. Create a **new API key**
5. Copy the new key (you'll only see it once!)

## Setup on Netlify

### 1. Add Environment Variable
1. Go to https://app.netlify.com
2. Select your Jotya site
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Set:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: (paste your NEW OpenAI API key)
   - **Scopes**: All scopes (or at least Production + Deploy previews)
6. Click **Save**

### 2. Remove Old Variable (Optional)
If you had `OPENROUTER_API_KEY` set, you can delete it:
1. Find `OPENROUTER_API_KEY` in the environment variables list
2. Click **Options** (three dots) → **Delete**

### 3. Redeploy
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**

## What Changed

### Code Updates
- ✅ Switched from OpenRouter to OpenAI
- ✅ Using `gpt-4o-mini` model (fast and cheap: ~$0.15 per 1M input tokens)
- ✅ All AI functions updated:
  - `chatWithAI` (floating chat)
  - `searchWithAI` (smart search)
  - `generateListingDescription` (sell form AI)
  - Test endpoint

### Environment Variable
- **Old**: `OPENROUTER_API_KEY`
- **New**: `OPENAI_API_KEY`

## Cost Estimate

With `gpt-4o-mini`:
- **Input**: $0.15 per 1M tokens (~750k words)
- **Output**: $0.60 per 1M tokens (~750k words)

Typical chat request (~500 tokens total) = **$0.0003** (less than a penny)

For 1000 requests/day: ~$10/month

## Verify It Works

After deploying:
1. Test the AI chat on your live site
2. Ask it "show me bags" or similar
3. Should now work without rate limit errors!

## Security Best Practices

🔒 **Never share API keys in:**
- Chat messages
- Public repositories
- Screenshots
- Email

✅ **Always use environment variables**
✅ **Rotate keys if exposed**
✅ **Set usage limits** on OpenAI dashboard to prevent unexpected costs
