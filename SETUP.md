# Keeper — Setup Guide

## Run the website locally (takes ~5 minutes)

### Step 1 — Install Node.js
Download from **nodejs.org** → pick the "LTS" version → install like any app.

### Step 2 — Open Terminal and run:
```bash
cd /path/to/Callaway-App
cp .env.example .env.local
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser. You'll see the Keeper landing page.

---

## Set up your accounts (in this order)

### 1. Supabase (free — the database)
1. Go to **supabase.com** → "Start for free" → create account
2. Click "New project" → name it "Keeper" → pick a region
3. Wait ~2 minutes for it to create
4. Go to **SQL Editor** → "New query" → paste contents of `supabase/migrations/001_initial_schema.sql` → click Run
5. Go to **Settings → API**:
   - Copy "Project URL" → paste into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy "anon public" key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Anthropic / Claude (the AI brain)
1. Go to **console.anthropic.com** → sign up / log in
2. Click "API Keys" → "Create Key"
3. Copy key → paste into `.env.local` as `ANTHROPIC_API_KEY`
4. Add a credit card (you'll only be charged for actual usage — typically < $5/month for testing)

### 3. Plaid (bank connections — free sandbox)
1. Go to **plaid.com** → "Get API Keys" → create free account
2. Go to **Team Settings → Keys**
3. Copy "client_id" → paste as `PLAID_CLIENT_ID`
4. Copy the "sandbox" secret → paste as `PLAID_SECRET`
5. Leave `PLAID_ENV=sandbox` (this uses fake bank data for testing — no real bank needed)

---

## Restart and test
After filling in the env vars:
```bash
# Stop the server (Ctrl+C), then restart:
npm run dev
```

Go to **http://localhost:3000** → click "Get started" → create an account → connect a (sandbox) bank.

**Sandbox bank credentials** (fake test bank):
- Username: `user_good`
- Password: `pass_good`

Keeper will import fake transactions and Claude will analyze them for issues.

---

## Deploy to the internet (share with others)
The easiest option is **Vercel** (free):
1. Go to **vercel.com** → "Import Project" → connect your GitHub repo
2. Add all your env vars in the Vercel dashboard
3. Click Deploy — you'll get a public URL like `keeper-abc123.vercel.app`
