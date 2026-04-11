
-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
ON public.products FOR SELECT
USING (status = 'Active');

CREATE POLICY "Admins can view all products"
ON public.products FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
ON public.products FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
ON public.products FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'Code',
  status TEXT NOT NULL DEFAULT 'Active',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active services"
ON public.services FOR SELECT
USING (status = 'Active');

CREATE POLICY "Admins can view all services"
ON public.services FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert services"
ON public.services FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update services"
ON public.services FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete services"
ON public.services FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial data
INSERT INTO public.products (name, description, price, status, sort_order) VALUES
  ('Paradaim CRM', 'Customer relationship management tailored for SMBs.', '€49/mo', 'Active', 1),
  ('Paradaim ERP', 'Enterprise resource planning for streamlined operations.', '€99/mo', 'Active', 2),
  ('Paradaim Analytics', 'Data analytics dashboard for real-time business insights.', '€29/mo', 'Active', 3),
  ('Paradaim HRM', 'Human resource management with automated workflows.', '€39/mo', 'Active', 4);

INSERT INTO public.services (title, description, icon, status, sort_order) VALUES
  ('Web Development', 'Full-stack web development with modern technologies.', 'Code', 'Active', 1),
  ('Mobile Development', 'Native and cross-platform mobile app development.', 'Smartphone', 'Active', 2),
  ('UI/UX Design', 'User-centered design for exceptional digital experiences.', 'Palette', 'Active', 3),
  ('IT Consulting', 'Strategic technology consulting for digital transformation.', 'Lightbulb', 'Active', 4),
  ('Cloud Services', 'Cloud infrastructure setup, migration and management.', 'Cloud', 'Active', 5),
  ('Technical Support', '24/7 technical support and maintenance services.', 'Headphones', 'Active', 6);
