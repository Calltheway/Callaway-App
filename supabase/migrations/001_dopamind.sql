-- Dopamind App Database Schema
-- Full schema with RLS policies

-- profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  sobriety_start_date TIMESTAMPTZ,
  habit_type TEXT,
  motivations TEXT[],
  recovery_style TEXT DEFAULT 'solo',
  daily_commitment_minutes INT DEFAULT 15,
  ybocs_severity INT DEFAULT 0,
  xp_total INT DEFAULT 0,
  level INT DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  epilepsy_safe_mode BOOLEAN DEFAULT false,
  onboarding_complete BOOLEAN DEFAULT false,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- journal_entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mood INT CHECK (mood >= 0 AND mood <= 10),
  energy INT CHECK (energy >= 0 AND energy <= 10),
  urge_intensity INT CHECK (urge_intensity >= 0 AND urge_intensity <= 10),
  trigger_location TEXT,
  trigger_activity TEXT,
  trigger_emotion TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- relapses
CREATE TABLE IF NOT EXISTS relapses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  trigger TEXT,
  mood INT CHECK (mood >= 0 AND mood <= 10),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- sessions (brainwave/HRV/SOS/journal)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL, -- 'brainwave' | 'hrv' | 'sos' | 'journal'
  duration_seconds INT,
  mode TEXT,
  xp_earned INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- community_posts
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  streak_days INT DEFAULT 0,
  likes INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_relapses_user_id ON relapses(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE relapses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: users can only see/edit their own
CREATE POLICY "own_profile_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own_profile_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "own_profile_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Journal entries: private
CREATE POLICY "own_journals_all" ON journal_entries FOR ALL USING (auth.uid() = user_id);

-- Relapses: private
CREATE POLICY "own_relapses_all" ON relapses FOR ALL USING (auth.uid() = user_id);

-- Sessions: private
CREATE POLICY "own_sessions_all" ON sessions FOR ALL USING (auth.uid() = user_id);

-- Community posts: public read, own write
CREATE POLICY "community_read" ON community_posts FOR SELECT USING (is_visible = true);
CREATE POLICY "own_posts_insert" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_posts_update" ON community_posts FOR UPDATE USING (auth.uid() = user_id);
