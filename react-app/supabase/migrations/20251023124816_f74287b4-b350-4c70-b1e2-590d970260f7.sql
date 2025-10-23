-- Allow updating donated fractions and metadata
CREATE POLICY "Anyone can update fractions"
ON public.fractions
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow updating round statistics after donations/withdrawals
CREATE POLICY "Anyone can update rounds"
ON public.rounds
FOR UPDATE
USING (true)
WITH CHECK (true);