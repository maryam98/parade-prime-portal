import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Smartphone, Palette, Lightbulb, Cloud, Headphones, ChevronLeft, ChevronRight, Package, ArrowRight, ArrowLeft, Handshake, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect, useCallback } from 'react';
import { usePageContent } from '@/hooks/usePageContent';
import heroBg from '@/assets/hero-bg.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -80 : 80 }),
};

const Home = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'fa';
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const { get: pc } = usePageContent('home');

  const { data: slides = [] } = useQuery({
    queryKey: ['hero-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('status', 'Active')
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ['home-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'Active')
        .order('sort_order')
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  const { data: articles = [] } = useQuery({
    queryKey: ['home-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'Published')
        .order('published_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const { data: partners = [] } = useQuery({
    queryKey: ['home-partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('status', 'Active')
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['home-team'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('status', 'Active')
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const goTo = useCallback((index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  }, [current]);

  const next = useCallback(() => {
    if (slides.length === 0) return;
    setDirection(1);
    setCurrent(c => (c + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    if (slides.length === 0) return;
    setDirection(-1);
    setCurrent(c => (c - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  const slide = slides[current];

  const services = [
    { icon: Code, key: 'web' },
    { icon: Smartphone, key: 'mobile' },
    { icon: Palette, key: 'design' },
    { icon: Lightbulb, key: 'consulting' },
    { icon: Cloud, key: 'cloud' },
    { icon: Headphones, key: 'support' },
  ];

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hero Carousel */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <img src={slide?.image_url || heroBg} alt="" className="absolute inset-0 w-full h-full object-cover transition-all duration-700" />
        <div className="absolute inset-0 bg-accent/60" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <AnimatePresence mode="wait" custom={direction}>
            {slide && (
              <motion.div
                key={slide.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-heading font-bold text-accent-foreground leading-tight">
                  {slide.title}
                  {slide.subtitle && (
                    <>
                      <br />
                      <span className="text-gradient-crimson">{slide.subtitle}</span>
                    </>
                  )}
                </h1>
                {slide.description && (
                  <p className="mt-6 text-lg text-accent-foreground/60 max-w-2xl mx-auto">
                    {slide.description}
                  </p>
                )}
                {slide.cta_text && slide.cta_link && (
                  <div className="mt-8 flex flex-wrap gap-4 justify-center">
                    <Link to={slide.cta_link}
                      className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors glow-crimson">
                      {slide.cta_text}
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation arrows */}
        {slides.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-accent/40 backdrop-blur-sm flex items-center justify-center text-accent-foreground/80 hover:bg-accent/60 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-accent/40 backdrop-blur-sm flex items-center justify-center text-accent-foreground/80 hover:bg-accent/60 transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {slides.map((_, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'bg-primary w-7' : 'bg-accent-foreground/30 hover:bg-accent-foreground/50'}`} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl lg:text-4xl font-heading font-bold text-foreground">
              {pc('services_title', t('services.title'))}
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-3 text-muted-foreground max-w-xl mx-auto">
              {pc('services_subtitle', t('services.subtitle'))}
            </motion.p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, i) => (
              <motion.div key={svc.key} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="group p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <svc.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-card-foreground">{t(`services.${svc.key}`)}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t(`services.${svc.key}Desc`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 hero-gradient">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: pc('stat_projects_value', '120+'), label: pc('stat_projects_label', t('about.stats.projects')) },
              { value: pc('stat_clients_value', '80+'), label: pc('stat_clients_label', t('about.stats.clients')) },
              { value: pc('stat_years_value', '8+'), label: pc('stat_years_label', t('about.stats.years')) },
              { value: pc('stat_team_value', '25+'), label: pc('stat_team_label', t('about.stats.team')) },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="text-3xl lg:text-4xl font-heading font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-sm text-surface-dark-foreground/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Preview */}
      {products.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
              <motion.h2 variants={fadeUp} custom={0} className="text-3xl lg:text-4xl font-heading font-bold text-foreground">
                {t('products.title')}
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="mt-3 text-muted-foreground max-w-xl mx-auto">
                {t('products.subtitle')}
              </motion.p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <motion.div key={product.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                  <Link to={`/products/${product.id}`}
                    className="group block rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden">
                    {product.image_url ? (
                      <div className="w-full h-40 overflow-hidden">
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-muted flex items-center justify-center">
                        <Package className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="text-base font-heading font-semibold text-card-foreground line-clamp-1">{product.name}</h3>
                      {product.description && <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{product.description}</p>}
                      {product.price && <p className="mt-3 text-lg font-heading font-bold text-primary">{product.price}</p>}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/products" className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline">
                {t('products.learnMore')} {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Latest Articles */}
      {articles.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
              <motion.h2 variants={fadeUp} custom={0} className="text-3xl lg:text-4xl font-heading font-bold text-foreground">
                {t('blog.title')}
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="mt-3 text-muted-foreground max-w-xl mx-auto">
                {t('blog.subtitle')}
              </motion.p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article, i) => (
                <motion.div key={article.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                  <Link to={`/blog/${article.id}`}
                    className="group block rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden">
                    {article.image_url && (
                      <div className="w-full h-48 overflow-hidden">
                        <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{article.category}</span>
                        {article.published_at && (
                          <span className="text-xs text-muted-foreground">{new Date(article.published_at).toLocaleDateString(i18n.language === 'fa' ? 'fa-IR' : i18n.language === 'de' ? 'de-DE' : 'en-US')}</span>
                        )}
                      </div>
                      <h3 className="text-lg font-heading font-semibold text-card-foreground line-clamp-2">{article.title}</h3>
                      {article.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/blog" className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline">
                {t('blog.title')} {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Partners Slider */}
      {partners.length > 0 && (
        <section className="py-16 bg-muted/30 overflow-hidden">
          <div className="container mx-auto px-4">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-2xl lg:text-3xl font-heading font-bold text-foreground text-center mb-10">
              {t('partners.title')}
            </motion.h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {partners.map((p, i) => (
                <motion.a key={p.id} href={p.website_url || '#'} target={p.website_url ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                  className="flex flex-col items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
                  {p.logo_url ? (
                    <img src={p.logo_url} alt={p.name} className="w-24 h-24 object-contain grayscale hover:grayscale-0 transition-all" />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-card border border-border flex items-center justify-center">
                      <Handshake className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <span className="text-sm text-muted-foreground text-center">{p.name}</span>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team Members */}
      {teamMembers.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
              <motion.h2 variants={fadeUp} custom={0} className="text-3xl lg:text-4xl font-heading font-bold text-foreground">
                {t('team.title')}
              </motion.h2>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, i) => (
                <motion.div key={member.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                  className="text-center group">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-border group-hover:border-primary/50 transition-colors mb-4">
                    {member.photo_url ? (
                      <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Users className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-primary font-medium mt-1">{member.position}</p>
                  {member.bio && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{member.bio}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground">{pc('cta_title', t('contact.title'))}</h2>
          <p className="mt-3 text-muted-foreground">{pc('cta_subtitle', t('contact.subtitle'))}</p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
              {pc('cta_button', t('contact.send'))}
            </Link>
            <Link to="/reservation" className="px-8 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors">
              {pc('cta_button2', t('nav.reservation'))}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
