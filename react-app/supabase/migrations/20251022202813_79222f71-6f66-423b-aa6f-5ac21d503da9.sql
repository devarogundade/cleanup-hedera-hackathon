-- Add guest mode support - create anonymous profile
CREATE OR REPLACE FUNCTION public.create_guest_profile()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  guest_id UUID;
BEGIN
  -- Generate a new UUID for guest
  guest_id := gen_random_uuid();
  
  -- Insert guest profile
  INSERT INTO public.profiles (id, username, total_xp, level)
  VALUES (guest_id, 'Guest User', 0, 1);
  
  RETURN guest_id;
END;
$$;