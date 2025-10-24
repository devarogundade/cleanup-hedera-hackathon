-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  total_donations INTEGER NOT NULL DEFAULT 0,
  total_fractions INTEGER NOT NULL DEFAULT 0,
  total_nfts INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create rounds table
CREATE TABLE public.rounds (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  contract_id TEXT,
  location_name TEXT NOT NULL,
  location_coordinates TEXT NOT NULL,
  location_description TEXT,
  image_url TEXT NOT NULL,
  total_fractions INTEGER NOT NULL DEFAULT 0,
  donated_fractions INTEGER NOT NULL DEFAULT 0,
  total_amount DECIMAL NOT NULL DEFAULT 0,
  total_votes INTEGER NOT NULL DEFAULT 0,
  participant_count INTEGER NOT NULL DEFAULT 0,
  winning_ngo_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create NGOs table
CREATE TABLE public.ngos (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  logo TEXT NOT NULL,
  website TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create fractions table
CREATE TABLE public.fractions (
  id SERIAL PRIMARY KEY,
  round_id INTEGER NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  price DECIMAL NOT NULL,
  donated BOOLEAN NOT NULL DEFAULT FALSE,
  donor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  token_id TEXT,
  nft_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create donations table
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  round_id INTEGER NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  ngo_id INTEGER NOT NULL REFERENCES public.ngos(id) ON DELETE RESTRICT,
  amount DECIMAL NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('HBAR', 'NGN')),
  amount_in_hbar DECIMAL NOT NULL,
  amount_in_ngn DECIMAL NOT NULL,
  fraction_ids INTEGER[] NOT NULL,
  transaction_id TEXT NOT NULL,
  nft_token_ids TEXT[],
  xp_earned INTEGER NOT NULL,
  voting_power INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'failed')) DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create ngo_votes table
CREATE TABLE public.ngo_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  round_id INTEGER NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  ngo_id INTEGER NOT NULL REFERENCES public.ngos(id) ON DELETE CASCADE,
  voting_power INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(donation_id)
);

-- Create achievements table
CREATE TABLE public.achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  xp INTEGER NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  progress_current INTEGER NOT NULL DEFAULT 0,
  progress_total INTEGER NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create rewards table
CREATE TABLE public.rewards (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('badge', 'achievement', 'reward')),
  value TEXT NOT NULL,
  requirement_level INTEGER,
  requirement_xp INTEGER,
  icon TEXT,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create user_rewards table
CREATE TABLE public.user_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_id INTEGER NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('locked', 'available', 'claimed')) DEFAULT 'locked',
  progress_current INTEGER NOT NULL DEFAULT 0,
  progress_total INTEGER NOT NULL,
  earned_date TIMESTAMP WITH TIME ZONE,
  claimed_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, reward_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngo_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for rounds (public read)
CREATE POLICY "Anyone can view rounds" ON public.rounds FOR SELECT USING (true);

-- RLS Policies for NGOs (public read)
CREATE POLICY "Anyone can view NGOs" ON public.ngos FOR SELECT USING (true);

-- RLS Policies for fractions (public read)
CREATE POLICY "Anyone can view fractions" ON public.fractions FOR SELECT USING (true);

-- RLS Policies for donations
CREATE POLICY "Users can view all donations" ON public.donations FOR SELECT USING (true);
CREATE POLICY "Users can insert own donations" ON public.donations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ngo_votes
CREATE POLICY "Users can view all votes" ON public.ngo_votes FOR SELECT USING (true);
CREATE POLICY "Users can insert own votes" ON public.ngo_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for achievements (public read)
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view all user achievements" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "Users can update own achievements" ON public.user_achievements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for rewards (public read)
CREATE POLICY "Anyone can view rewards" ON public.rewards FOR SELECT USING (true);

-- RLS Policies for user_rewards
CREATE POLICY "Users can view all user rewards" ON public.user_rewards FOR SELECT USING (true);
CREATE POLICY "Users can update own rewards" ON public.user_rewards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rewards" ON public.user_rewards FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_fractions_round_id ON public.fractions(round_id);
CREATE INDEX idx_fractions_donated ON public.fractions(donated);
CREATE INDEX idx_donations_user_id ON public.donations(user_id);
CREATE INDEX idx_donations_round_id ON public.donations(round_id);
CREATE INDEX idx_ngo_votes_round_id ON public.ngo_votes(round_id);
CREATE INDEX idx_ngo_votes_ngo_id ON public.ngo_votes(ngo_id);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_rewards_user_id ON public.user_rewards(user_id);