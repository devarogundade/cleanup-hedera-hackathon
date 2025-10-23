-- Rename donations table to transactions
ALTER TABLE public.donations RENAME TO transactions;

-- Add type column to transactions table (donation or withdrawal)
ALTER TABLE public.transactions 
ADD COLUMN type text NOT NULL DEFAULT 'donation' CHECK (type IN ('donation', 'withdrawal'));

-- Add columns to rounds table
ALTER TABLE public.rounds 
ADD COLUMN total_donations numeric NOT NULL DEFAULT 0,
ADD COLUMN total_withdrawals numeric NOT NULL DEFAULT 0;

-- Add columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN total_rewards integer NOT NULL DEFAULT 0,
ADD COLUMN total_claimed_rewards integer NOT NULL DEFAULT 0,
ADD COLUMN total_rewards_value numeric NOT NULL DEFAULT 0,
ADD COLUMN total_donation_value numeric NOT NULL DEFAULT 0;

-- Update foreign key names for renamed table
ALTER TABLE public.fractions 
DROP CONSTRAINT IF EXISTS fractions_transaction_id_fkey,
ADD CONSTRAINT fractions_transaction_id_fkey 
  FOREIGN KEY (transaction_id) 
  REFERENCES public.transactions(id) 
  ON DELETE CASCADE;

ALTER TABLE public.ngo_votes 
DROP CONSTRAINT IF EXISTS ngo_votes_donation_id_fkey,
ADD CONSTRAINT ngo_votes_donation_id_fkey 
  FOREIGN KEY (donation_id) 
  REFERENCES public.transactions(id) 
  ON DELETE CASCADE;

-- Update RLS policies for transactions table
DROP POLICY IF EXISTS "Users can insert own donations" ON public.transactions;
DROP POLICY IF EXISTS "Users can view all donations" ON public.transactions;

CREATE POLICY "Users can insert own transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all transactions" 
ON public.transactions 
FOR SELECT 
USING (true);

-- Create storage bucket for profile avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);