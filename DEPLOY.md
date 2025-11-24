# Deployment Guide 🚀 (Netlify + Supabase)

Your Jotya marketplace is ready for the world! Here is how to deploy it using **Netlify** and **Supabase**.

## 1. Database Setup (Supabase)
1.  Go to [Supabase](https://supabase.com) and create a new project.
2.  Go to **Project Settings** -> **Database**.
3.  Scroll down to **Connection Pooling**.
4.  Copy these two connection strings:
    *   **Transaction Pooler (Port 6543)**: Use this for `DATABASE_URL`.
    *   **Session Pooler (Port 5432)**: Use this for `DIRECT_URL`.

### Option A: Automatic Setup (Recommended)
The app is configured to set up the database automatically when you deploy or run it locally.
- **Local**: `npx prisma db push`
- **Netlify**: The `postinstall` script (`prisma generate`) prepares the client, but you might need to run `npx prisma db push` manually from your local machine (connected to the remote DB) to ensure the schema is synced.

### Option B: Manual SQL Setup
If you prefer to create the tables manually in Supabase:
1.  Open the `supabase_schema.sql` file in this project.
2.  Copy the content.
3.  Go to your Supabase Project -> **SQL Editor**.
4.  Paste the SQL and click **Run**.

## 2. Netlify Deployment
1.  Push your code to **GitHub**.
2.  Log in to [Netlify](https://www.netlify.com/).
3.  Click **"Add new site"** -> **"Import an existing project"**.
4.  Select **GitHub** and choose your `Jotya` repository.

### Build Settings
Netlify should automatically detect Next.js, but ensure these settings are correct:
- **Build command**: `npm run build`
- **Publish directory**: `.next`

### Environment Variables
In the Netlify deploy setup (or later in Site Settings -> Environment variables), add these:

- `DATABASE_URL`: Your Supabase **Transaction** connection string (Port 6543).
- `DIRECT_URL`: Your Supabase **Session** connection string (Port 5432).
- `NEXTAUTH_SECRET`: A random string for authentication security.
- `NEXTAUTH_URL`: Your Netlify URL (e.g., `https://jotya-app.netlify.app`).

## 3. Important: Post-Install Script
Ensure your `package.json` has this script (we already added it):
```json
"postinstall": "prisma generate"
```
This ensures Netlify generates the database client before building the app.

## 4. Local Development
To run locally with Supabase:
1.  Ensure your local `.env` file has the Supabase credentials.
2.  Run `npm run dev`.
