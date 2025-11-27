# Database Migration: Add Notification Fields to Messages

## SQL Command

Run this in your Supabase SQL Editor:

```sql
-- Add read and readAt fields to Message table
ALTER TABLE "Message" 
  ADD COLUMN IF NOT EXISTS "read" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP(3);
```

## Steps

1. Go to https://supabase.com/dashboard
2. Select your Jotya project
3. Click **SQL Editor**
4. Click **New query**
5. Paste the SQL above
6. Click **Run**

## Verification

After running:
1. The notification badges should work
2. New messages will show as unread by default
3. Opening a conversation will mark messages as read
