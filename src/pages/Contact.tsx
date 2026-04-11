import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

const Contact = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'fa';
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('contact_messages').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      message: form.message.trim(),
    });
    setLoading(false);
    if (error) {
      toast.error(t('contact.error', 'خطا در ارسال پیام'));
    } else {
      toast.success(t('contact.success'));
      setForm({ name: '', email: '', phone: '', message: '' });
    }
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-heading font-bold text-surface-dark-foreground"
          >
            {t('contact.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-surface-dark-foreground/60"
          >
            {t('contact.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t('contact.name')}</label>
                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t('contact.email')}</label>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t('contact.phone')}</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t('contact.message')}</label>
                <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                {loading ? '...' : t('contact.send')}
              </button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-8"
            >
              {[
                { icon: Mail, label: 'info@paradaim.com' },
                { icon: Phone, label: '+49 123 456 789' },
                { icon: MapPin, label: t('contact.addressText') },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">{item.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
