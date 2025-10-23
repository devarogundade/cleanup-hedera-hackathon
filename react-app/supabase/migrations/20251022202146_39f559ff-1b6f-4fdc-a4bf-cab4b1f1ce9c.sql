-- Create function to increment profile stats atomically
CREATE OR REPLACE FUNCTION public.increment_profile_stats(
  profile_id UUID,
  xp_amount INTEGER,
  donation_amount INTEGER,
  fraction_amount INTEGER,
  nft_amount INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_xp INTEGER;
  new_level INTEGER;
BEGIN
  -- Update stats and get new XP
  UPDATE public.profiles
  SET 
    total_xp = total_xp + xp_amount,
    total_donations = total_donations + donation_amount,
    total_fractions = total_fractions + fraction_amount,
    total_nfts = total_nfts + nft_amount
  WHERE id = profile_id
  RETURNING total_xp INTO new_xp;

  -- Calculate new level (100 XP per level)
  new_level := FLOOR(new_xp / 100.0) + 1;

  -- Update level if changed
  UPDATE public.profiles
  SET level = new_level
  WHERE id = profile_id AND level != new_level;
END;
$$;