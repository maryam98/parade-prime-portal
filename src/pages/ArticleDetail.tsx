import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';

const ArticleDetail = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'fa';
  const { id } = useParams<{ id: string }>();

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-lg">{t('blog.notFound', 'Article not found')}</p>
        <Link to="/blog" className="text-primary hover:underline flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> {t('blog.backToList', 'Back to articles')}
        </Link>
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary font-medium">
                {article.category}
              </span>
              {article.published_at && (
                <span className="flex items-center gap-1 text-sm text-surface-dark-foreground/50">
                  <Calendar className="h-3.5 w-3.5" />
                  {article.published_at}
                </span>
              )}
            </div>
            <h1 className="text-3xl lg:text-5xl font-heading font-bold text-surface-dark-foreground max-w-3xl mx-auto leading-tight">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="mt-4 text-surface-dark-foreground/60 max-w-2xl mx-auto">
                {article.excerpt}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mb-8">
              <ArrowLeft className="h-4 w-4" /> {t('blog.backToList', 'Back to articles')}
            </Link>

            {article.image_url && (
              <motion.img
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                src={article.image_url}
                alt={article.title}
                className="w-full rounded-xl mb-10 object-cover max-h-[400px]"
              />
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary"
            >
              {article.content ? (
                article.content.split('\n').map((paragraph, i) => (
                  paragraph.trim() ? <p key={i} className="text-muted-foreground leading-relaxed mb-4">{paragraph}</p> : null
                ))
              ) : (
                <p className="text-muted-foreground italic">{t('blog.noContent', 'No content available for this article.')}</p>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArticleDetail;
