import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Code, Smartphone, Palette, Lightbulb, Cloud, Headphones, Search, type LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useMemo } from 'react';
import SearchBar from '@/components/SearchBar';
import { usePageContent } from '@/hooks/usePageContent';

const iconMap: Record<string, LucideIcon> = {
  Code, Smartphone, Palette, Lightbulb, Cloud, Headphones,
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Services = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'fa';
  const [search, setSearch] = useState('');
  const { get: pc } = usePageContent('services');

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('status', 'Active')
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return services;
    const q = search.toLowerCase();
    return services.filter(s =>
      s.title.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q))
    );
  }, [services, search]);

  const labels = {
    search: isRtl ? 'جستجوی خدمات...' : i18n.language === 'de' ? 'Dienste suchen...' : 'Search services...',
    noResults: isRtl ? 'خدمتی یافت نشد' : i18n.language === 'de' ? 'Keine Dienste gefunden' : 'No services found',
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-heading font-bold text-surface-dark-foreground">
            {pc('title', t('services.title'))}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="mt-4 text-surface-dark-foreground/60 max-w-xl mx-auto">
            {pc('subtitle', t('services.subtitle'))}
          </motion.p>

          <SearchBar value={search} onChange={setSearch} placeholder={labels.search} />
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">{labels.noResults}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((svc, i) => {
                const Icon = iconMap[svc.icon] || Code;
                return (
                  <motion.div key={svc.id} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    variants={fadeUp} custom={i}
                    className="group p-8 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-heading font-semibold text-card-foreground">{svc.title}</h3>
                    <p className="mt-3 text-muted-foreground leading-relaxed">{svc.description}</p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Services;
