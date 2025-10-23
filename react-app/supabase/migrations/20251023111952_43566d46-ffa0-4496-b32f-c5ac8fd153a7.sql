-- Add not_allowed column to fractions table
ALTER TABLE public.fractions 
ADD COLUMN not_allowed boolean NOT NULL DEFAULT false;

-- Add comment explaining the column
COMMENT ON COLUMN public.fractions.not_allowed IS 'Marks fractions that cannot be selected (e.g., no trash present, trees already planted, etc.)';

-- Create index for faster queries on not_allowed fractions
CREATE INDEX idx_fractions_not_allowed ON public.fractions(not_allowed) WHERE not_allowed = true;