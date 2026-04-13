import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Turnstile } from '@marsidev/react-turnstile';

const Register = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'fa';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const { signUp } = useAuth();
  const settings = useSiteSettings();
  const turnstileSiteKey = settings.hcaptcha_site_key;

  const labels = {
    orContinueWith: isRtl ? 'یا ثبت‌نام با' : i18n.language === 'de' ? 'Oder registrieren mit' : 'Or sign up with',
    displayName: isRtl ? 'نام نمایشی' : i18n.language === 'de' ? 'Anzeigename' : 'Display Name',
    alreadyHave: isRtl ? 'قبلاً حساب دارید؟' : i18n.language === 'de' ? 'Bereits registriert?' : 'Already have an account?',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (turnstileSiteKey && !captchaToken) {
      setError(isRtl ? 'لطفاً کپچا را تکمیل کنید' : 'Please complete the captcha');
      return;
    }
    setError('');
    setLoading(true);
    const { error } = await signUp(email, password, displayName);
    if (error) {
      setError(error.message);
      setCaptchaToken('');
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
  };

  if (success) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-[80vh] flex items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-4 p-8 rounded-2xl border border-border bg-card text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-xl font-heading font-bold text-card-foreground mb-2">
            {isRtl ? 'ثبت‌نام موفقیت‌آمیز!' : i18n.language === 'de' ? 'Registrierung erfolgreich!' : 'Registration Successful!'}
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            {isRtl ? 'لطفاً ایمیل خود را بررسی کنید.' : i18n.language === 'de' ? 'Bitte überprüfen Sie Ihre E-Mail.' : 'Please check your email to verify your account.'}
          </p>
          <Link to="/login" className="text-primary hover:underline font-medium text-sm">{t('auth.login')}</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-[80vh] flex items-center justify-center bg-background">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-4 p-8 rounded-2xl border border-border bg-card">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-heading font-bold text-card-foreground">{t('auth.register')}</h1>
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{labels.displayName}</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('auth.email')}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('auth.password')}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          {turnstileSiteKey && (
            <div className="flex justify-center">
              <Turnstile siteKey={turnstileSiteKey} onSuccess={setCaptchaToken} />
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {loading ? t('common.loading') : t('auth.register')}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">{labels.orContinueWith}</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {labels.alreadyHave}{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">{t('auth.login')}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
