-- ─────────────────────────────────────────────────────────────────
-- KEEPER — Initial Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ─────────────────────────────────────────────────────────────────

-- Enable UUID generation (already enabled in Supabase by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────
-- USERS TABLE
-- Mirrors Supabase auth.users but adds app-specific fields
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT NOT NULL,
  full_name         TEXT,
  avatar_url        TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free'
                    CHECK (subscription_tier IN ('free', 'pro', 'keeper_plus')),
  total_saved       NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create a user profile when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to add to total_saved safely
CREATE OR REPLACE FUNCTION public.increment_total_saved(user_id UUID, amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET total_saved = total_saved + amount,
      updated_at  = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────
-- CONNECTED ACCOUNTS TABLE (Plaid bank connections)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.connected_accounts (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plaid_item_id       TEXT NOT NULL,
  plaid_access_token  TEXT,            -- Encrypted via Supabase Vault in production
  institution_name    TEXT NOT NULL,
  institution_logo    TEXT,
  institution_color   TEXT,
  account_name        TEXT NOT NULL,
  account_type        TEXT NOT NULL DEFAULT 'other'
                      CHECK (account_type IN ('checking', 'savings', 'credit', 'investment', 'other')),
  mask                TEXT,            -- Last 4 digits of account number
  last_synced         TIMESTAMPTZ,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, plaid_item_id)
);

-- ─────────────────────────────────────────────────────────────────
-- TRANSACTIONS TABLE
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_id            UUID REFERENCES public.connected_accounts(id) ON DELETE SET NULL,
  plaid_transaction_id  TEXT UNIQUE,   -- Prevents duplicate imports
  merchant_name         TEXT NOT NULL,
  merchant_logo         TEXT,
  amount                NUMERIC(10, 2) NOT NULL,
  date                  DATE NOT NULL,
  category              TEXT NOT NULL DEFAULT 'other'
                        CHECK (category IN (
                          'streaming','software','fitness','food',
                          'utilities','insurance','finance','shopping','other'
                        )),
  is_recurring          BOOLEAN NOT NULL DEFAULT FALSE,
  recurring_frequency   TEXT
                        CHECK (recurring_frequency IN (
                          'weekly','biweekly','monthly','quarterly','annual', NULL
                        )),
  pending               BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date
  ON public.transactions(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_recurring
  ON public.transactions(user_id, is_recurring);

-- ─────────────────────────────────────────────────────────────────
-- DETECTED ISSUES TABLE (AI findings)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.detected_issues (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  issue_type                  TEXT NOT NULL
                              CHECK (issue_type IN (
                                'forgotten_subscription','price_increase','duplicate_charge',
                                'unused_subscription','overpriced_service','unclaimed_refund',
                                'warranty_expiring','billing_error','free_trial_ending'
                              )),
  merchant_name               TEXT NOT NULL,
  merchant_logo               TEXT,
  monthly_cost                NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  annual_cost                 NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  status                      TEXT NOT NULL DEFAULT 'new'
                              CHECK (status IN ('new','in_progress','resolved','dismissed')),
  confidence_score            NUMERIC(3, 2) NOT NULL DEFAULT 0.80
                              CHECK (confidence_score BETWEEN 0 AND 1),
  plain_english_explanation   TEXT NOT NULL,
  recommended_action          TEXT NOT NULL
                              CHECK (recommended_action IN (
                                'cancel','dispute','negotiate','claim','review','switch'
                              )),
  action_difficulty           TEXT NOT NULL DEFAULT 'medium'
                              CHECK (action_difficulty IN ('easy','medium','hard')),
  metadata                    JSONB,
  detected_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at                 TIMESTAMPTZ,
  amount_saved                NUMERIC(10, 2),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, issue_type, merchant_name)
);

CREATE INDEX IF NOT EXISTS idx_issues_user_status
  ON public.detected_issues(user_id, status);

CREATE INDEX IF NOT EXISTS idx_issues_monthly_cost
  ON public.detected_issues(user_id, monthly_cost DESC);

-- ─────────────────────────────────────────────────────────────────
-- EMAIL CONNECTIONS TABLE
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_connections (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL CHECK (provider IN ('gmail', 'outlook')),
  email_address   TEXT NOT NULL,
  access_token    TEXT,           -- OAuth token, encrypted via Supabase Vault
  refresh_token   TEXT,           -- OAuth refresh token, encrypted via Supabase Vault
  token_expires_at TIMESTAMPTZ,
  last_synced     TIMESTAMPTZ,
  receipts_found  INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, email_address)
);

-- ─────────────────────────────────────────────────────────────────
-- SAVINGS EVENTS TABLE
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.savings_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  issue_id        UUID REFERENCES public.detected_issues(id) ON DELETE SET NULL,
  amount_saved    NUMERIC(10, 2) NOT NULL,
  saved_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  method          TEXT NOT NULL
                  CHECK (method IN (
                    'cancellation','negotiation','dispute_won','refund_claimed','manual'
                  )),
  merchant_name   TEXT NOT NULL,
  description     TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_savings_user_date
  ON public.savings_events(user_id, saved_at DESC);

-- ─────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- This is the security layer — users can ONLY access their own data
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detected_issues     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_connections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_events      ENABLE ROW LEVEL SECURITY;

-- Users: can only read/update their own row
CREATE POLICY "users_own_data" ON public.users
  FOR ALL USING (auth.uid() = id);

-- Connected accounts: own data only
CREATE POLICY "accounts_own_data" ON public.connected_accounts
  FOR ALL USING (auth.uid() = user_id);

-- Transactions: own data only
CREATE POLICY "transactions_own_data" ON public.transactions
  FOR ALL USING (auth.uid() = user_id);

-- Detected issues: own data only
CREATE POLICY "issues_own_data" ON public.detected_issues
  FOR ALL USING (auth.uid() = user_id);

-- Email connections: own data only
CREATE POLICY "email_own_data" ON public.email_connections
  FOR ALL USING (auth.uid() = user_id);

-- Savings events: own data only
CREATE POLICY "savings_own_data" ON public.savings_events
  FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────
-- UPDATED_AT trigger (keeps updated_at fresh automatically)
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_accounts_updated_at
  BEFORE UPDATE ON public.connected_accounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_issues_updated_at
  BEFORE UPDATE ON public.detected_issues
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_email_updated_at
  BEFORE UPDATE ON public.email_connections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
