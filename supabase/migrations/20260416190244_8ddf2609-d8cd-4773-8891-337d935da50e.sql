CREATE POLICY "Users can cancel their own appointments by user_id"
ON public.appointments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel their own appointments by email"
ON public.appointments
FOR UPDATE
TO authenticated
USING (email = auth.email())
WITH CHECK (email = auth.email());