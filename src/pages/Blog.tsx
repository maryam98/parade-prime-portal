import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useState, useMemo } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Blog = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'fa';
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: articles = [] } = useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'Published')
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const categories = useMemo(() => {
    const cats = [...new Set(articles.map(a => a.category))];
    return cats.sort();
  }, [articles]);

  const filtered = useMemo(() => {
    let result = articles;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
        a.category.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) {
      result = result.filter(a => a.category === selectedCategory);
    }
    return result;
  }, [articles, search, selectedCategory]);

  const labels = {
    search: isRtl ? 'جستجوی مقالات...' : i18n.language === 'de' ? 'Artikel suchen...' : 'Search articles...',
    all: isRtl ? 'همه' : i18n.language === 'de' ? 'Alle' : 'All',
    noResults: isRtl ? 'مقاله‌ای یافت نشد' : i18n.language === 'de' ? 'Keine Artikel gefunden' : 'No articles found',
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-heading font-bold text-surface-dark-foreground">
            {t('blog.title')}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="mt-4 text-surface-dark-foreground/60">
            {t('blog.subtitle')}
          </motion.p>

          {/* Search bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mt-8 max-w-lg mx-auto relative">
            <Search className="absolute top-3.5 left-4 h-5 w-5 text-muted-foreground pointer-events-none" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={labels.search}
              className="w-full pl-12 pr-10 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-lg" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute top-3.5 right-4 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {/* Category filters */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              <button onClick={() => setSelectedCategory('')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !selectedCategory ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}>
                {labels.all}
              </button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">{labels.noResults}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((article, i) => (
                <Link to={`/blog/${article.id}`} key={article.id}>
                  <motion.article initial="hidden" whileInView="visible" viewport={{ once: true }}
                    variants={fadeUp} custom={i}
                    className="group p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">{article.category}</span>
                      <span className="text-xs text-muted-foreground">{article.published_at}</span>
                    </div>
                    <h3 className="text-lg font-heading font-semibold text-card-foreground group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{article.excerpt}</p>
                    <span className="mt-4 inline-block text-sm text-primary font-medium">{t('blog.readMore')} →</span>
                  </motion.article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;
