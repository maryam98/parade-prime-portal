
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  published_at DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published articles"
ON public.articles FOR SELECT
USING (status = 'Published');

CREATE POLICY "Admins can view all articles"
ON public.articles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert articles"
ON public.articles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update articles"
ON public.articles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete articles"
ON public.articles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial articles
INSERT INTO public.articles (title, excerpt, category, status, published_at) VALUES
  ('Building Scalable Web Applications', 'Learn the best practices for building scalable and maintainable web applications using modern frameworks.', 'Development', 'Published', '2026-03-15'),
  ('The Future of AI in Software', 'How artificial intelligence is transforming the software development landscape.', 'Technology', 'Published', '2026-03-10'),
  ('Cloud Migration Strategies', 'A comprehensive guide to migrating your infrastructure to the cloud.', 'Cloud', 'Published', '2026-03-05'),
  ('UI/UX Design Principles', 'Essential design principles every developer should know for better user experiences.', 'Design', 'Published', '2026-02-28'),
  ('Mobile-First Development', 'Why mobile-first approach matters and how to implement it effectively.', 'Mobile', 'Published', '2026-02-20'),
  ('DevOps Best Practices', 'Streamline your development workflow with modern DevOps methodologies.', 'DevOps', 'Published', '2026-02-15');
