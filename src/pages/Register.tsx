import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Register = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'fa';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signUp(email, password, displayName);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-[80vh] flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-4 p-8 rounded-2xl border border-border bg-card text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-xl font-heading font-bold text-card-foreground mb-2">
            {i18n.language === 'fa' ? 'ثبت‌نام موفقیت‌آمیز!' : i18n.language === 'de' ? 'Registrierung erfolgreich!' : 'Registration Successful!'}
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            {i18n.language === 'fa' ? 'لطفاً ایمیل خود را بررسی کنید.' : i18n.language === 'de' ? 'Bitte überprüfen Sie Ihre E-Mail.' : 'Please check your email to verify your account.'}
          </p>
          <Link to="/login" className="text-primary hover:underline font-medium text-sm">{t('auth.login')}</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-[80vh] flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-4 p-8 rounded-2xl border border-border bg-card"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-heading font-bold text-card-foreground">{t('auth.register')}</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {i18n.language === 'fa' ? 'نام نمایشی' : i18n.language === 'de' ? 'Anzeigename' : 'Display Name'}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? t('common.loading') : t('auth.register')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {i18n.language === 'fa' ? 'قبلاً حساب دارید؟' : i18n.language === 'de' ? 'Bereits registriert?' : 'Already have an account?'}{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">{t('auth.login')}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
