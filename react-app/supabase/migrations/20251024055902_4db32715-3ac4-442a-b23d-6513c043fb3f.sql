-- Add position field to fractions table
ALTER TABLE public.fractions
ADD COLUMN IF NOT EXISTS position integer;

-- Drop foreign key constraints first
ALTER TABLE public.ngo_votes
DROP CONSTRAINT IF EXISTS ngo_votes_ngo_id_fkey;

ALTER TABLE public.transactions
DROP CONSTRAINT IF EXISTS donations_ngo_id_fkey;

ALTER TABLE public.rounds
DROP CONSTRAINT IF EXISTS rounds_winning_ngo_id_fkey;

-- Change ngo_id from integer to text in all tables
ALTER TABLE public.ngos
ALTER COLUMN id TYPE text USING id::text;

ALTER TABLE public.ngo_votes
ALTER COLUMN ngo_id TYPE text USING ngo_id::text;

ALTER TABLE public.transactions
ALTER COLUMN ngo_id TYPE text USING ngo_id::text;

ALTER TABLE public.rounds
ALTER COLUMN winning_ngo_id TYPE text USING winning_ngo_id::text;

-- Re-add foreign key constraints
ALTER TABLE public.ngo_votes
ADD CONSTRAINT ngo_votes_ngo_id_fkey 
FOREIGN KEY (ngo_id) REFERENCES public.ngos(id);

ALTER TABLE public.transactions
ADD CONSTRAINT transactions_ngo_id_fkey 
FOREIGN KEY (ngo_id) REFERENCES public.ngos(id);

ALTER TABLE public.rounds
ADD CONSTRAINT rounds_winning_ngo_id_fkey 
FOREIGN KEY (winning_ngo_id) REFERENCES public.ngos(id);