import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const FAQ = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'fa';
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const { data: faqs = [] } = useQuery({
    queryKey: ['faqs', i18n.language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('status', 'Active')
        .eq('language', i18n.language)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return faqs;
    const q = search.toLowerCase();
    return faqs.filter(f => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
  }, [faqs, search]);

  const labels = {
    title: isRtl ? 'سوالات متداول' : i18n.language === 'de' ? 'Häufig gestellte Fragen' : 'Frequently Asked Questions',
    subtitle: isRtl ? 'پاسخ سوالات رایج شما' : i18n.language === 'de' ? 'Antworten auf Ihre häufigsten Fragen' : 'Answers to your most common questions',
    search: isRtl ? 'جستجو در سوالات...' : i18n.language === 'de' ? 'Fragen durchsuchen...' : 'Search questions...',
    noResults: isRtl ? 'سوالی یافت نشد' : i18n.language === 'de' ? 'Keine Fragen gefunden' : 'No questions found',
    contact: isRtl ? 'سوال دیگری دارید؟' : i18n.language === 'de' ? 'Haben Sie weitere Fragen?' : 'Still have questions?',
    contactBtn: isRtl ? 'تماس با ما' : i18n.language === 'de' ? 'Kontaktieren Sie uns' : 'Contact Us',
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-heading font-bold text-surface-dark-foreground">
            {labels.title}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="mt-4 text-surface-dark-foreground/60">
            {labels.subtitle}
          </motion.p>
          <SearchBar value={search} onChange={setSearch} placeholder={labels.search} />
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">{labels.noResults}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((faq, i) => (
                <motion.div key={faq.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-border bg-card overflow-hidden">
                  <button onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left">
                    <span className="font-medium text-card-foreground pr-4">{faq.question}</span>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} />
                  </button>
                  <motion.div initial={false}
                    animate={{ height: openIndex === i ? 'auto' : 0, opacity: openIndex === i ? 1 : 0 }}
                    transition={{ duration: 0.3 }} className="overflow-hidden">
                    <p className="px-6 pb-5 text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-16 text-center p-10 rounded-2xl border border-border bg-card">
            <h3 className="text-xl font-heading font-semibold text-card-foreground">{labels.contact}</h3>
            <a href="/contact"
              className="mt-4 inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
              {labels.contactBtn}
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
