-- Insert sample fractions for round 1 (10x10 grid)
DO $$
DECLARE
  i INTEGER;
  grid_size INTEGER := 10;
  fraction_width INTEGER := 10;
  fraction_height INTEGER := 10;
  fraction_count INTEGER;
BEGIN
  -- Check if fractions already exist for round 1
  SELECT COUNT(*) INTO fraction_count FROM public.fractions WHERE round_id = 1;
  
  IF fraction_count = 0 THEN
    FOR i IN 0..(grid_size * grid_size - 1) LOOP
      INSERT INTO public.fractions (round_id, x, y, width, height, price, donated)
      VALUES (
        1,
        (i % grid_size) * fraction_width,
        (i / grid_size) * fraction_height,
        fraction_width,
        fraction_height,
        50.0,
        false
      );
    END LOOP;
  END IF;
END $$;

-- Insert sample achievements
INSERT INTO public.achievements (id, title, description, xp, icon, rarity, requirement_type, requirement_value) VALUES
('first_donation', 'First Step', 'Made your first donation to ocean cleanup', 100, 'Heart', 'common', 'donations', 1),
('early_adopter', 'Early Adopter', 'One of the first 100 contributors', 500, 'Star', 'rare', 'user_rank', 100),
('ocean_guardian', 'Ocean Guardian', 'Donated to 10 different cleanup sites', 1000, 'Shield', 'epic', 'donations', 10),
('nft_collector', 'NFT Collector', 'Collected 25 unique cleanup NFTs', 2000, 'Image', 'legendary', 'nfts', 25)
ON CONFLICT (id) DO NOTHING;

-- Insert sample rewards
INSERT INTO public.rewards (title, description, type, value, requirement_level, requirement_xp, icon, rarity) VALUES
('Bronze Badge', 'Awarded for reaching Level 5', 'badge', 'Bronze Cleanup Hero', 5, NULL, 'Award', 'common'),
('Silver Badge', 'Awarded for reaching Level 10', 'badge', 'Silver Ocean Protector', 10, NULL, 'Award', 'rare'),
('Gold Badge', 'Awarded for reaching Level 20', 'badge', 'Gold Environmental Champion', 20, NULL, 'Award', 'epic'),
('Platinum Badge', 'Awarded for reaching Level 50', 'badge', 'Platinum Eco Warrior', 50, NULL, 'Award', 'legendary')
ON CONFLICT DO NOTHING;