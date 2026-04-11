import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Check } from 'lucide-react';

const ResetPassword = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'fa';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  const labels = {
    title: isRtl ? 'رمز عبور جدید' : i18n.language === 'de' ? 'Neues Passwort' : 'New Password',
    newPassword: isRtl ? 'رمز عبور جدید' : i18n.language === 'de' ? 'Neues Passwort' : 'New Password',
    confirmPassword: isRtl ? 'تکرار رمز عبور' : i18n.language === 'de' ? 'Passwort bestätigen' : 'Confirm Password',
    save: isRtl ? 'ذخیره رمز عبور' : i18n.language === 'de' ? 'Passwort speichern' : 'Save Password',
    success: isRtl ? 'رمز عبور با موفقیت تغییر کرد!' : i18n.language === 'de' ? 'Passwort erfolgreich geändert!' : 'Password changed successfully!',
    mismatch: isRtl ? 'رمزهای عبور مطابقت ندارند' : i18n.language === 'de' ? 'Passwörter stimmen nicht überein' : 'Passwords do not match',
    invalidLink: isRtl ? 'لینک نامعتبر است' : i18n.language === 'de' ? 'Ungültiger Link' : 'Invalid or expired reset link',
  };

  useEffect(() => {
    // Check for recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    // Also check hash for type=recovery
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError(labels.mismatch);
      return;
    }

    if (password.length < 6) {
      setError(isRtl ? 'رمز عبور باید حداقل ۶ کاراکتر باشد' : 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    }
    setLoading(false);
  };

  if (!isRecovery && !window.location.hash.includes('access_token')) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-[80vh] flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <p className="text-muted-foreground">{labels.invalidLink}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-[80vh] flex items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-4 p-8 rounded-2xl border border-border bg-card text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
            <Check className="h-7 w-7 text-green-500" />
          </div>
          <h2 className="text-xl font-heading font-bold text-card-foreground">{labels.success}</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-[80vh] flex items-center justify-center bg-background">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-4 p-8 rounded-2xl border border-border bg-card">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-card-foreground">{labels.title}</h1>
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{labels.newPassword}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{labels.confirmPassword}</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {loading ? '...' : labels.save}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
