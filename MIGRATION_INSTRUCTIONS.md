# Database Migration: Add Style Column

## Problem
The `style` column doesn't exist in the production database, causing the profile page to crash.

## Solution
Run this SQL command in your Supabase dashboard:

```sql
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "style" TEXT;
```

## Steps to Apply

1. Go to https://supabase.com/dashboard
2. Select your Jotya project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**
5. Paste the SQL command above
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see: "Success. No rows returned"

## Verification

After running the SQL:
1. Go back to your Jotya site
2. Try accessing `/profile` again
3. It should work now!

## Alternative: Using Prisma Migrate (if you have access to the database URL)

If you have `psql` installed locally, you can run:

```bash
psql "YOUR_DIRECT_URL_HERE" -c "ALTER TABLE \"Listing\" ADD COLUMN IF NOT EXISTS \"style\" TEXT;"
```

Replace `YOUR_DIRECT_URL_HERE` with the value from your `.env` file's `DIRECT_URL`.
