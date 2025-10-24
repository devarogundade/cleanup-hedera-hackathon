-- Add delivery_type column to rewards table to distinguish physical vs digital rewards
ALTER TABLE public.rewards 
ADD COLUMN delivery_type text NOT NULL DEFAULT 'digital' CHECK (delivery_type IN ('physical', 'digital'));