
-- Create media storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true);

-- Public read access
CREATE POLICY "Anyone can view media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Admin upload
CREATE POLICY "Admins can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

-- Admin update
CREATE POLICY "Admins can update media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

-- Admin delete
CREATE POLICY "Admins can delete media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
