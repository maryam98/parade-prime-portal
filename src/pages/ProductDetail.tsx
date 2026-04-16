import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ArrowRight, Package, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'fa';
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <Package className="h-16 w-16 text-muted-foreground/30" />
        <p className="text-muted-foreground">{t('products.notFound')}</p>
        <Link to="/products" className="text-primary hover:underline flex items-center gap-1.5">
          <BackArrow className="h-4 w-4" />
          {t('products.backToProducts')}
        </Link>
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <BackArrow className="h-4 w-4" />
            {t('products.backToProducts')}
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {product.image_url && (
              <div className="w-full h-64 md:h-96 rounded-xl overflow-hidden mb-8">
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-3xl lg:text-4xl font-heading font-bold text-foreground">{product.name}</h1>
                {product.price && (
                  <span className="text-3xl font-heading font-bold text-primary shrink-0">{product.price}</span>
                )}
              </div>

              {product.description && (
                <p className="text-lg text-muted-foreground">{product.description}</p>
              )}

              {product.content && (
                <div className="prose prose-sm max-w-none border-t border-border pt-6">
                  <div className="text-foreground/80 whitespace-pre-wrap leading-relaxed">{product.content}</div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
