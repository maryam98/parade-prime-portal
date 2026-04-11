import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Target, Eye } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const About = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'fa';

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-heading font-bold text-surface-dark-foreground"
          >
            {t('about.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-surface-dark-foreground/60 max-w-2xl mx-auto"
          >
            {t('about.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* Description */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-lg text-muted-foreground leading-relaxed text-center"
          >
            {t('about.description')}
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: Target, title: t('about.mission'), text: t('about.missionText') },
              { icon: Eye, title: t('about.vision'), text: t('about.visionText') },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="p-8 rounded-xl bg-card border border-border"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-card-foreground">{item.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: '120+', label: t('about.stats.projects') },
              { value: '80+', label: t('about.stats.clients') },
              { value: '8+', label: t('about.stats.years') },
              { value: '25+', label: t('about.stats.team') },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl border border-border"
              >
                <div className="text-3xl font-heading font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
