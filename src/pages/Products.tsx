import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ExternalLink, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useMemo } from 'react';
import SearchBar from '@/components/SearchBar';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Products = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'fa';
  const [search, setSearch] = useState('');

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'Active')
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.price && p.price.toLowerCase().includes(q))
    );
  }, [products, search]);

  const labels = {
    search: isRtl ? 'جستجوی محصولات...' : i18n.language === 'de' ? 'Produkte suchen...' : 'Search products...',
    noResults: isRtl ? 'محصولی یافت نشد' : i18n.language === 'de' ? 'Keine Produkte gefunden' : 'No products found',
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-heading font-bold text-surface-dark-foreground">
            {t('products.title')}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="mt-4 text-surface-dark-foreground/60">
            {t('products.subtitle')}
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
            <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {filtered.map((product, i) => (
                <motion.div key={product.id} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp} custom={i}
                  className="group p-8 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                  <h3 className="text-xl font-heading font-semibold text-card-foreground">{product.name}</h3>
                  <p className="mt-3 text-muted-foreground">{product.description}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-2xl font-heading font-bold text-primary">{product.price}</span>
                    <button className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                      {t('products.learnMore')} <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;
