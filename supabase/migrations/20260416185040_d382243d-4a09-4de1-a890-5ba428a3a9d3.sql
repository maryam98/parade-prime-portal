CREATE POLICY "Users can view appointments by their email"
ON public.appointments
FOR SELECT
TO authenticated
USING (email = auth.email());