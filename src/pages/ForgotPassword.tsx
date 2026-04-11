import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'fa';
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const labels = {
    title: isRtl ? 'بازیابی رمز عبور' : i18n.language === 'de' ? 'Passwort zurücksetzen' : 'Reset Password',
    subtitle: isRtl ? 'ایمیل خود را وارد کنید تا لینک بازیابی ارسال شود' : i18n.language === 'de' ? 'Geben Sie Ihre E-Mail ein' : 'Enter your email to receive a reset link',
    send: isRtl ? 'ارسال لینک بازیابی' : i18n.language === 'de' ? 'Link senden' : 'Send Reset Link',
    sent: isRtl ? 'لینک بازیابی ارسال شد!' : i18n.language === 'de' ? 'Link wurde gesendet!' : 'Reset link sent!',
    sentDesc: isRtl ? 'لطفاً ایمیل خود را بررسی کنید.' : i18n.language === 'de' ? 'Bitte überprüfen Sie Ihre E-Mail.' : 'Please check your email for the reset link.',
    back: isRtl ? 'بازگشت به ورود' : i18n.language === 'de' ? 'Zurück zum Login' : 'Back to Login',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-[80vh] flex items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-4 p-8 rounded-2xl border border-border bg-card text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-xl font-heading font-bold text-card-foreground mb-2">{labels.sent}</h2>
          <p className="text-muted-foreground text-sm mb-4">{labels.sentDesc}</p>
          <Link to="/login" className="text-primary hover:underline font-medium text-sm">{labels.back}</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-[80vh] flex items-center justify-center bg-background">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-4 p-8 rounded-2xl border border-border bg-card">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-heading font-bold text-card-foreground">{labels.title}</h1>
          <p className="text-muted-foreground text-sm mt-2">{labels.subtitle}</p>
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('auth.email')}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {loading ? t('common.loading') : labels.send}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> {labels.back}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
