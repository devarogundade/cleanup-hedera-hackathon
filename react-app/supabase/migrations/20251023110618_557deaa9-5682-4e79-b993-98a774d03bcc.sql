-- Drop ALL foreign key constraints that reference profiles
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey CASCADE;
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS donations_user_id_fkey CASCADE;
ALTER TABLE user_achievements DROP CONSTRAINT IF EXISTS user_achievements_user_id_fkey CASCADE;
ALTER TABLE user_rewards DROP CONSTRAINT IF EXISTS user_rewards_user_id_fkey CASCADE;
ALTER TABLE ngo_votes DROP CONSTRAINT IF EXISTS ngo_votes_user_id_fkey CASCADE;
ALTER TABLE fractions DROP CONSTRAINT IF EXISTS fractions_donor_id_fkey CASCADE;

-- Drop the old primary key with CASCADE
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE;

-- Drop the id column
ALTER TABLE profiles DROP COLUMN IF EXISTS id CASCADE;

-- Make account_id NOT NULL and set it as primary key
ALTER TABLE profiles ALTER COLUMN account_id SET NOT NULL;
ALTER TABLE profiles ADD PRIMARY KEY (account_id);

-- Update all user_id columns to text type to match account_id
ALTER TABLE transactions ALTER COLUMN user_id TYPE text;
ALTER TABLE user_achievements ALTER COLUMN user_id TYPE text;
ALTER TABLE user_rewards ALTER COLUMN user_id TYPE text;
ALTER TABLE ngo_votes ALTER COLUMN user_id TYPE text;
ALTER TABLE fractions ALTER COLUMN donor_id TYPE text;

-- Add foreign key constraints pointing to account_id
ALTER TABLE transactions 
  ADD CONSTRAINT transactions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(account_id) ON DELETE CASCADE;

ALTER TABLE user_achievements 
  ADD CONSTRAINT user_achievements_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(account_id) ON DELETE CASCADE;

ALTER TABLE user_rewards 
  ADD CONSTRAINT user_rewards_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(account_id) ON DELETE CASCADE;

ALTER TABLE ngo_votes 
  ADD CONSTRAINT ngo_votes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(account_id) ON DELETE CASCADE;

ALTER TABLE fractions 
  ADD CONSTRAINT fractions_donor_id_fkey 
  FOREIGN KEY (donor_id) REFERENCES profiles(account_id) ON DELETE SET NULL;

-- Insert sample gallery images for existing rounds
INSERT INTO galleries (round_id, image_url, caption, location, display_order) VALUES
  (1, 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800', 'Community cleanup team collecting plastic waste', 'Marina Beach, Lagos', 1),
  (1, 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800', 'Volunteers sorting recyclable materials', 'Marina Beach, Lagos', 2),
  (1, 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800', 'Beach restoration progress - before cleanup', 'Marina Beach, Lagos', 3),
  (1, 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800', 'Clean beach after community effort', 'Marina Beach, Lagos', 4),
  (2, 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800', 'River cleanup crew in action', 'Niger River Delta', 1),
  (2, 'https://images.unsplash.com/photo-1622184884172-8d0b97a7d2b2?w=800', 'Collected waste ready for proper disposal', 'Niger River Delta', 2),
  (2, 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800', 'Water quality testing after cleanup', 'Niger River Delta', 3),
  (3, 'https://images.unsplash.com/photo-1618477460930-de2076556220?w=800', 'Urban cleanup initiative kickoff', 'Abuja City Center', 1),
  (3, 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800', 'Street waste collection in progress', 'Abuja City Center', 2),
  (3, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800', 'Community members working together', 'Abuja City Center', 3)
ON CONFLICT DO NOTHING;