# Email Notifications Setup

## Resend API Key
Add this line to your `.env` file:

```env
RESEND_API_KEY=re_Vkeby2Pd_8WCbme7QZQQVy6gT82AN9g5g
```

## Netlify Environment Variable
1. Go to Netlify Dashboard → Site Settings → Environment variables
2. Add: `RESEND_API_KEY` = `re_Vkeby2Pd_8WCbme7QZQQVy6gT82AN9g5g`

## Important: Update Email Domain
Before emails will work, you need to update the `from` address in `src/lib/email.ts`:

```typescript
from: 'Jotya <notifications@jotya.com>',
```

Change `@jotya.com` to your verified domain in Resend (or use Resend's onboarding email).

## Testing
Once deployed, test by:
1. Sending a message → Check email
2. Making an offer → Check email
3. Accepting/rejecting offer → Check email
