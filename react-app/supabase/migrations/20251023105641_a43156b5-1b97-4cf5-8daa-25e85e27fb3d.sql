-- Add message column to transactions table
ALTER TABLE public.transactions
ADD COLUMN message text;

-- Create proper foreign key relationship between transactions and profiles
ALTER TABLE public.transactions
ADD CONSTRAINT transactions_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;