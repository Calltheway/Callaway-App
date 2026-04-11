-- ─────────────────────────────────────────────────────────────────
-- ORACLE — Supabase Schema
-- Run in Supabase SQL Editor to create all required tables
-- ─────────────────────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Oracle Users ───────────────────────────────────────────────────
create table if not exists oracle_users (
  id                       text primary key,  -- Supabase auth.users.id
  email                    text unique not null,
  name                     text,
  avatar_url               text,
  goals                    text,
  fears                    text,
  life_context             jsonb default '{}',
  notification_preferences jsonb default '{"daily_digest": true, "real_time_alerts": false, "weekly_report": true, "pattern_alerts": true}',
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);

-- ── Oracle Integrations ────────────────────────────────────────────
create table if not exists oracle_integrations (
  id            text primary key default gen_random_uuid()::text,
  user_id       text not null references oracle_users(id) on delete cascade,
  type          text not null,  -- gmail | calendar | plaid | health
  access_token  text,
  refresh_token text,
  token_expiry  timestamptz,
  last_synced   timestamptz,
  status        text default 'disconnected',  -- connected | syncing | error | disconnected
  metadata      jsonb default '{}',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique (user_id, type)
);

-- ── Oracle Insights ────────────────────────────────────────────────
create table if not exists oracle_insights (
  id          text primary key default gen_random_uuid()::text,
  user_id     text not null references oracle_users(id) on delete cascade,
  category    text not null,  -- financial | social | health | behavioral | emotional | growth
  severity    text default 'info',  -- info | warning | alert
  title       text not null,
  content     text not null,
  confidence  float default 0.8,
  data_points jsonb default '[]',
  action      text,
  action_type text,
  read        boolean default false,
  dismissed   boolean default false,
  created_at  timestamptz default now()
);

create index if not exists oracle_insights_user_id_idx on oracle_insights(user_id);
create index if not exists oracle_insights_category_idx on oracle_insights(user_id, category);
create index if not exists oracle_insights_created_at_idx on oracle_insights(created_at desc);

-- ── Oracle Life Scores ─────────────────────────────────────────────
create table if not exists oracle_life_scores (
  id           text primary key default gen_random_uuid()::text,
  user_id      text not null references oracle_users(id) on delete cascade,
  overall      int not null,
  financial    int not null,
  social       int not null,
  health       int not null,
  productivity int not null,
  emotional    int not null,
  growth       int not null,
  week_of      date not null,
  notes        text,
  created_at   timestamptz default now(),
  unique (user_id, week_of)
);

create index if not exists oracle_life_scores_user_id_idx on oracle_life_scores(user_id);

-- ── Oracle Messages ────────────────────────────────────────────────
create table if not exists oracle_messages (
  id         text primary key default gen_random_uuid()::text,
  user_id    text not null references oracle_users(id) on delete cascade,
  role       text not null,  -- user | assistant
  content    text not null,
  metadata   jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists oracle_messages_user_id_idx on oracle_messages(user_id);

-- ── Oracle Weekly Reports ──────────────────────────────────────────
create table if not exists oracle_weekly_reports (
  id         text primary key default gen_random_uuid()::text,
  user_id    text not null references oracle_users(id) on delete cascade,
  week_of    date not null,
  summary    text not null,
  highlights jsonb default '[]',
  patterns   jsonb default '[]',
  score      int,
  created_at timestamptz default now(),
  unique (user_id, week_of)
);

create index if not exists oracle_weekly_reports_user_id_idx on oracle_weekly_reports(user_id);

-- ── Row Level Security ─────────────────────────────────────────────
alter table oracle_users        enable row level security;
alter table oracle_integrations enable row level security;
alter table oracle_insights     enable row level security;
alter table oracle_life_scores  enable row level security;
alter table oracle_messages     enable row level security;
alter table oracle_weekly_reports enable row level security;

-- RLS Policies: users can only access their own data
create policy "Users can read own data"
  on oracle_users for select using (auth.uid()::text = id);

create policy "Users can update own data"
  on oracle_users for all using (auth.uid()::text = id);

create policy "Users can manage own integrations"
  on oracle_integrations for all using (auth.uid()::text = user_id);

create policy "Users can manage own insights"
  on oracle_insights for all using (auth.uid()::text = user_id);

create policy "Users can manage own life scores"
  on oracle_life_scores for all using (auth.uid()::text = user_id);

create policy "Users can manage own messages"
  on oracle_messages for all using (auth.uid()::text = user_id);

create policy "Users can manage own weekly reports"
  on oracle_weekly_reports for all using (auth.uid()::text = user_id);

-- ── Auto-create user profile on auth signup ────────────────────────
create or replace function public.handle_new_oracle_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.oracle_users (id, email, name, avatar_url)
  values (
    new.id::text,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger to create oracle user on signup
drop trigger if exists on_auth_user_created_oracle on auth.users;
create trigger on_auth_user_created_oracle
  after insert on auth.users
  for each row execute procedure public.handle_new_oracle_user();
