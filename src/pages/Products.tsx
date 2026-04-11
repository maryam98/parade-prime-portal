import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const mockProducts = [
  { id: 1, name: 'Paradaim CRM', desc: 'Customer relationship management tailored for SMBs.', price: '€49/mo' },
  { id: 2, name: 'Paradaim ERP', desc: 'Enterprise resource planning for streamlined operations.', price: '€99/mo' },
  { id: 3, name: 'Paradaim Analytics', desc: 'Data analytics dashboard for real-time business insights.', price: '€29/mo' },
  { id: 4, name: 'Paradaim HRM', desc: 'Human resource management with automated workflows.', price: '€39/mo' },
];

const Products = () => {
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
            {t('products.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-surface-dark-foreground/60"
          >
            {t('products.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {mockProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="group p-8 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-xl font-heading font-semibold text-card-foreground">{product.name}</h3>
                <p className="mt-3 text-muted-foreground">{product.desc}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-2xl font-heading font-bold text-primary">{product.price}</span>
                  <button className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                    {t('products.learnMore')} <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;
