import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Smartphone, Palette, Lightbulb, Cloud, Headphones, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect, useCallback } from 'react';
import { usePageContent } from '@/hooks/usePageContent';
import heroBg from '@/assets/hero-bg.jpg';
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
              {t('services.title')}
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-3 text-muted-foreground max-w-xl mx-auto">
              {t('services.subtitle')}
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
              { value: '120+', label: t('about.stats.projects') },
              { value: '80+', label: t('about.stats.clients') },
              { value: '8+', label: t('about.stats.years') },
              { value: '25+', label: t('about.stats.team') },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="text-3xl lg:text-4xl font-heading font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-sm text-surface-dark-foreground/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground">{t('contact.title')}</h2>
          <p className="mt-3 text-muted-foreground">{t('contact.subtitle')}</p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
              {t('contact.send')}
            </Link>
            <Link to="/reservation" className="px-8 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors">
              {t('nav.reservation')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
