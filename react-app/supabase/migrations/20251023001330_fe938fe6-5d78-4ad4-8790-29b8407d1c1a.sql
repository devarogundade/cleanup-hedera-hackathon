-- Update fractions table to only store donated fractions
-- Remove x, y, width, height columns since we'll generate grid dynamically
-- Keep only donated fractions data

-- Add transaction_id column to link donations
ALTER TABLE fractions ADD COLUMN IF NOT EXISTS transaction_id uuid REFERENCES donations(id) ON DELETE CASCADE;

-- Create galleries table for round images
CREATE TABLE IF NOT EXISTS galleries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id integer NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  location text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;

-- Create policy for public viewing
CREATE POLICY "Anyone can view galleries"
ON galleries FOR SELECT
USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_galleries_round_id ON galleries(round_id);
CREATE INDEX IF NOT EXISTS idx_fractions_round_donor ON fractions(round_id, donor_id);
CREATE INDEX IF NOT EXISTS idx_fractions_transaction ON fractions(transaction_id);