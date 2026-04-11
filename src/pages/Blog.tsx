import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const mockArticles = [
  { id: 1, title: 'Building Scalable Web Applications', category: 'Development', date: '2026-03-15', excerpt: 'Learn the best practices for building scalable and maintainable web applications using modern frameworks.' },
  { id: 2, title: 'The Future of AI in Software', category: 'Technology', date: '2026-03-10', excerpt: 'How artificial intelligence is transforming the software development landscape.' },
  { id: 3, title: 'Cloud Migration Strategies', category: 'Cloud', date: '2026-03-05', excerpt: 'A comprehensive guide to migrating your infrastructure to the cloud.' },
  { id: 4, title: 'UI/UX Design Principles', category: 'Design', date: '2026-02-28', excerpt: 'Essential design principles every developer should know for better user experiences.' },
  { id: 5, title: 'Mobile-First Development', category: 'Mobile', date: '2026-02-20', excerpt: 'Why mobile-first approach matters and how to implement it effectively.' },
  { id: 6, title: 'DevOps Best Practices', category: 'DevOps', date: '2026-02-15', excerpt: 'Streamline your development workflow with modern DevOps methodologies.' },
];

const Blog = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'fa';

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-heading font-bold text-surface-dark-foreground"
          >
            {t('blog.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-surface-dark-foreground/60"
          >
            {t('blog.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockArticles.map((article, i) => (
              <motion.article
                key={article.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="group p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {article.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{article.date}</span>
                </div>
                <h3 className="text-lg font-heading font-semibold text-card-foreground group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {article.excerpt}
                </p>
                <span className="mt-4 inline-block text-sm text-primary font-medium">
                  {t('blog.readMore')} →
                </span>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
