
INSERT INTO public.site_settings (key, value) VALUES
  ('social_linkedin', ''),
  ('social_github', ''),
  ('social_twitter', ''),
  ('social_instagram', '')
ON CONFLICT (key) DO NOTHING;
