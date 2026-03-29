# Keeper — Setup Guide for Non-Technical Founders

This is your complete setup checklist. Follow these steps in order.

---

## STEP 1: Install the tools on your computer

1. **Install Node.js** (the engine that runs JavaScript):
   - Go to https://nodejs.org and download the "LTS" version
   - Install it like any other app

2. **Install Expo Go on your phone** (to see the app without App Store submission):
   - iPhone: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

3. **Open Terminal on your Mac** (Applications → Utilities → Terminal)

---

## STEP 2: Set up the project

In your Terminal, run these commands one at a time:

```bash
# Navigate to the Keeper folder
cd /path/to/Callaway-App

# Install all dependencies (this takes 2-3 minutes)
npm install

# Copy the environment file
cp .env.example .env
```

---

## STEP 3: Create your Supabase account (the database)

1. Go to https://supabase.com and click "Start for free"
2. Sign up with your email
3. Click "New project"
   - Name: "Keeper"
   - Database password: Make a strong password and save it somewhere safe
   - Region: US East (or closest to you)
4. Wait 2 minutes while it creates
5. Go to **SQL Editor** (left sidebar)
6. Click "New query"
7. Copy and paste the ENTIRE contents of `supabase/migrations/001_initial_schema.sql`
8. Click "Run" (or press Ctrl+Enter)
9. You should see "Success. No rows returned"

**Get your API keys:**
1. Go to **Settings → API** in your Supabase project
2. Copy the "Project URL" — paste it into your `.env` file as `EXPO_PUBLIC_SUPABASE_URL`
3. Copy the "anon public" key — paste it as `EXPO_PUBLIC_SUPABASE_ANON_KEY`

---

## STEP 4: Get your Claude (Anthropic) API key

1. Go to https://console.anthropic.com
2. Sign up / log in
3. Click "API Keys" → "Create Key"
4. Copy the key — paste into `.env` as `EXPO_PUBLIC_ANTHROPIC_API_KEY`
5. Add a credit card (you'll be charged only for actual usage — typically < $5/month for testing)

---

## STEP 5: Set up Plaid (bank connections)

1. Go to https://plaid.com/docs/quickstart/ and create a free account
2. Go to **Team Settings → Keys**
3. Copy:
   - "client_id" → paste as `EXPO_PUBLIC_PLAID_CLIENT_ID`
   - "sandbox" secret → paste as `EXPO_PUBLIC_PLAID_SECRET`
4. Keep `EXPO_PUBLIC_PLAID_ENV=sandbox` for now (this uses fake bank data for testing)

---

## STEP 6: Start the app

```bash
npx expo start
```

- A QR code appears in your Terminal
- Open the **Expo Go** app on your phone
- Scan the QR code
- The Keeper app loads on your phone!

**What you'll see:**
- The Keeper welcome screen (deep navy background, green K logo)
- Tap "Get Started" to create an account
- Go through the 3-step onboarding

---

## STEP 7: Test with fake bank data

Since we're using Plaid's sandbox mode, you can connect a fake bank:

1. Tap "Connect my bank securely" in onboarding
2. Search for "Chase" or any bank
3. Use these test credentials:
   - Username: `user_good`
   - Password: `pass_good`
4. Keeper will import fake transactions and run AI analysis on them

---

## STEP 8 (later): Set up RevenueCat for subscriptions

1. Go to https://app.revenuecat.com and create a free account
2. Add your app
3. Get your iOS and Android API keys
4. Paste them into `.env` as `EXPO_PUBLIC_REVENUECAT_IOS_KEY` and `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`

---

## Questions?

If anything doesn't work, the most important thing to share is the **error message** you see in the Terminal or on your phone screen.
