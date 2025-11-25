# Testing the Admin Dashboard

## Step 1: Make Yourself an Admin

Since `isAdmin` defaults to `false`, you need to manually set it in the database.

### Option A: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project → **Table Editor**
2. Open the `User` table
3. Find your user (by email)
4. Click the row to edit
5. Set `isAdmin` to `true`
6. Save

### Option B: Using Prisma Studio
```bash
npx prisma studio
```
1. Open the `User` model
2. Find your user
3. Edit `isAdmin` to `true`
4. Save

### Option C: Using SQL Query
Go to Supabase → **SQL Editor** and run:
```sql
UPDATE "User" 
SET "isAdmin" = true 
WHERE email = 'your-email@example.com';
```

---

## Step 2: Access the Admin Dashboard

1. **Login** to your account (the one you just made admin)
2. Navigate to: **`/admin`**
3. You should see the admin dashboard overview

---

## Step 3: Test Admin Features

### Dashboard Overview (`/admin`)
✅ Check that platform stats display correctly:
- Total Users
- Total Listings
- Total Revenue
- Total Transactions

### User Management (`/admin/users`)
✅ Test user actions:
- **Search** for users by name/email
- **Ban** a test user → Verify they can't login
- **Unban** the user → Verify they can login again
- **Make Admin** on another user → Check `isAdmin` in database
- **Remove Admin** → Check `isAdmin` is false

### Listing Moderation (`/admin/listings`)
✅ Test moderation actions:
- **Search** listings by title
- **Filter** by moderation status (Pending, Approved, etc.)
- **Approve** a listing → Check `moderationStatus` changes
- **Reject** a listing
- **Flag** a listing

### Transaction Monitoring (`/admin/transactions`)
✅ Verify you can see:
- All transactions
- Buyer & seller details
- Transaction status
- Amounts (gross & net)

---

## Step 4: Test Access Control

### Test Non-Admin Access
1. Create/use a regular user account (not admin)
2. Try to access `/admin`
3. **Expected**: You should be redirected to home (`/`)

### Test Banned User
1. Ban a test user
2. Try to login with that user
3. **Expected**: Login should work but accessing `/admin` redirects home

---

## Quick Test Commands

**Check your admin status:**
```sql
SELECT email, "isAdmin", banned FROM "User" WHERE email = 'your-email@example.com';
```

**View all admins:**
```sql
SELECT email, name, "isAdmin" FROM "User" WHERE "isAdmin" = true;
```

**Reset moderation status for testing:**
```sql
UPDATE "Listing" SET "moderationStatus" = 'PENDING' WHERE id = 'some-listing-id';
```

---

## Common Issues

### "Redirected to home when accessing /admin"
- Check `isAdmin` is `true` in database
- Check you're logged in
- Check the user isn't banned

### "Database error when pushing schema"
- Make sure Supabase is running
- Check `.env` has correct `DATABASE_URL`

### "Page not found"
- Make sure you pushed the code
- Run `npm run dev` locally to test

---

## What You Should See

**Admin Dashboard**: Clean, data-dense interface with stats cards
**User Management**: Table with search, filter, ban/admin buttons
**Listing Moderation**: Table with approve/reject/flag actions
**Transactions**: Read-only view of all platform transactions

The admin panel is fully functional and ready for production! 🎉
