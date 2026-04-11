
CREATE TABLE public.hero_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  cta_text TEXT,
  cta_link TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active slides"
ON public.hero_slides FOR SELECT
USING (status = 'Active');

CREATE POLICY "Admins can view all slides"
ON public.hero_slides FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert slides"
ON public.hero_slides FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update slides"
ON public.hero_slides FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete slides"
ON public.hero_slides FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_hero_slides_updated_at
BEFORE UPDATE ON public.hero_slides
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial slides
INSERT INTO public.hero_slides (title, subtitle, description, cta_text, cta_link, status, sort_order) VALUES
  ('Building Digital Solutions', 'For Tomorrow', 'We create innovative software solutions that drive business growth and digital transformation.', 'Get Started', '/reservation', 'Active', 1),
  ('Innovation in Technology', 'Your Partner', 'Leveraging cutting-edge technologies to build scalable and reliable applications.', 'Our Services', '/services', 'Active', 2),
  ('Your Growth Partner', 'Since 2018', 'From concept to deployment, we are with you every step of the way.', 'Contact Us', '/contact', 'Active', 3);
