import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Code, Smartphone, Palette, Lightbulb, Cloud, Headphones } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Services = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'fa';

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
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-heading font-bold text-surface-dark-foreground"
          >
            {t('services.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-surface-dark-foreground/60 max-w-xl mx-auto"
          >
            {t('services.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((svc, i) => (
              <motion.div
                key={svc.key}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="group p-8 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <svc.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-card-foreground">
                  {t(`services.${svc.key}`)}
                </h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {t(`services.${svc.key}Desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
