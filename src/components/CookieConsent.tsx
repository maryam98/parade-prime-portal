import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

const CookieConsent = () => {
  const { i18n } = useTranslation();
  const settings = useSiteSettings();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setVisible(false);
  };

  const getText = () => {
    if (i18n.language === 'fa') return settings.gdpr_consent_text || '';
    if (i18n.language === 'de') return settings.gdpr_consent_text_de || settings.gdpr_consent_text_en || '';
    return settings.gdpr_consent_text_en || '';
  };

  const text = getText();
  if (!text) return null;

  const labels = i18n.language === 'fa'
    ? { accept: 'قبول می‌کنم', decline: 'رد می‌کنم' }
    : i18n.language === 'de'
    ? { accept: 'Akzeptieren', decline: 'Ablehnen' }
    : { accept: 'Accept', decline: 'Decline' };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="max-w-3xl mx-auto p-4 rounded-xl border border-border bg-card shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Cookie className="h-6 w-6 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-card-foreground flex-1">{text}</p>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={decline}
                className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">
                {labels.decline}
              </button>
              <button onClick={accept}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                {labels.accept}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
