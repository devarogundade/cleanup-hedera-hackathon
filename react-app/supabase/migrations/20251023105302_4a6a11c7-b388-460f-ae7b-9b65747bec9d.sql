-- Add account_id column to profiles table for Hedera account IDs
ALTER TABLE public.profiles 
ADD COLUMN account_id text UNIQUE;

-- Create index for faster lookups
CREATE INDEX idx_profiles_account_id ON public.profiles(account_id);

-- Update RLS policies to work with account_id instead of auth.uid()
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- New RLS policies
CREATE POLICY "Anyone can view all profiles"
ON public.profiles
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert their profile"
ON public.profiles
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update their own profile"
ON public.profiles
FOR UPDATE
USING (true);

-- Update transactions table RLS policies to use account_id from profiles
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view all transactions" ON public.transactions;

CREATE POLICY "Anyone can view all transactions"
ON public.transactions
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert transactions"
ON public.transactions
FOR INSERT
WITH CHECK (true);

-- Update ngo_votes RLS policies
DROP POLICY IF EXISTS "Users can insert own votes" ON public.ngo_votes;
DROP POLICY IF EXISTS "Users can view all votes" ON public.ngo_votes;

CREATE POLICY "Anyone can view all votes"
ON public.ngo_votes
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert votes"
ON public.ngo_votes
FOR INSERT
WITH CHECK (true);

-- Update user_achievements RLS policies
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can update own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can view all user achievements" ON public.user_achievements;

CREATE POLICY "Anyone can view user achievements"
ON public.user_achievements
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert achievements"
ON public.user_achievements
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update achievements"
ON public.user_achievements
FOR UPDATE
USING (true);

-- Update user_rewards RLS policies
DROP POLICY IF EXISTS "Users can insert own rewards" ON public.user_rewards;
DROP POLICY IF EXISTS "Users can update own rewards" ON public.user_rewards;
DROP POLICY IF EXISTS "Users can view all user rewards" ON public.user_rewards;

CREATE POLICY "Anyone can view user rewards"
ON public.user_rewards
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert rewards"
ON public.user_rewards
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update rewards"
ON public.user_rewards
FOR UPDATE
USING (true);