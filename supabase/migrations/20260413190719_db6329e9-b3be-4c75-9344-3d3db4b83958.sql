
-- Add GDPR and captcha settings
INSERT INTO public.site_settings (key, value) VALUES
  ('gdpr_consent_text', 'ما از کوکی‌ها برای بهبود تجربه شما استفاده می‌کنیم. با ادامه استفاده از سایت، شما با سیاست حریم خصوصی ما موافقت می‌کنید.'),
  ('gdpr_consent_text_en', 'We use cookies to improve your experience. By continuing to use this site, you agree to our privacy policy.'),
  ('gdpr_consent_text_de', 'Wir verwenden Cookies, um Ihre Erfahrung zu verbessern. Durch die weitere Nutzung dieser Website stimmen Sie unserer Datenschutzrichtlinie zu.'),
  ('hcaptcha_site_key', '')
ON CONFLICT (key) DO NOTHING;

-- Create blocked_ips table
CREATE TABLE public.blocked_ips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  reason TEXT,
  blocked_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint on ip_address
ALTER TABLE public.blocked_ips ADD CONSTRAINT blocked_ips_ip_unique UNIQUE (ip_address);

-- Enable RLS
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

-- Anyone can check if their IP is blocked (needed for client-side check)
CREATE POLICY "Anyone can check blocked IPs" ON public.blocked_ips FOR SELECT USING (true);

-- Admins can manage blocked IPs
CREATE POLICY "Admins can insert blocked IPs" ON public.blocked_ips FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update blocked IPs" ON public.blocked_ips FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete blocked IPs" ON public.blocked_ips FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
