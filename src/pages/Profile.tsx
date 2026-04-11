import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { User, Mail, Phone, Save, Lock, Camera } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import ImageUpload from '@/components/ImageUpload';

const Profile = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'fa';
  const { user, profile } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setPhone(profile.phone || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const labels = {
    title: isRtl ? 'پروفایل من' : i18n.language === 'de' ? 'Mein Profil' : 'My Profile',
    subtitle: isRtl ? 'اطلاعات حساب خود را مدیریت کنید' : i18n.language === 'de' ? 'Verwalten Sie Ihre Kontoinformationen' : 'Manage your account information',
    displayName: isRtl ? 'نام نمایشی' : i18n.language === 'de' ? 'Anzeigename' : 'Display Name',
    accountInfo: isRtl ? 'اطلاعات حساب' : i18n.language === 'de' ? 'Kontoinformationen' : 'Account Info',
    changePassword: isRtl ? 'تغییر رمز عبور' : i18n.language === 'de' ? 'Passwort ändern' : 'Change Password',
    currentPassword: isRtl ? 'رمز عبور فعلی' : i18n.language === 'de' ? 'Aktuelles Passwort' : 'Current Password',
    newPassword: isRtl ? 'رمز عبور جدید' : i18n.language === 'de' ? 'Neues Passwort' : 'New Password',
    confirmPassword: isRtl ? 'تکرار رمز عبور' : i18n.language === 'de' ? 'Passwort bestätigen' : 'Confirm Password',
    avatar: isRtl ? 'تصویر پروفایل' : i18n.language === 'de' ? 'Profilbild' : 'Profile Picture',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, phone, avatar_url: avatarUrl || null })
      .eq('user_id', user.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(isRtl ? 'تغییرات ذخیره شد!' : 'Changes saved!');
    }
    setSaving(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(isRtl ? 'رمزهای عبور مطابقت ندارند' : 'Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error(isRtl ? 'رمز عبور باید حداقل ۶ کاراکتر باشد' : 'Password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(isRtl ? 'رمز عبور تغییر کرد!' : 'Password changed!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setChangingPassword(false);
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-heading font-bold text-surface-dark-foreground">
            {labels.title}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="mt-4 text-surface-dark-foreground/60">
            {labels.subtitle}
          </motion.p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-2xl space-y-6">
          {/* Avatar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-primary" />
              )}
            </div>
            <div className="w-full max-w-xs">
              <ImageUpload value={avatarUrl} onChange={setAvatarUrl} folder="avatars" className="[&_button]:h-12 [&_img]:h-12" />
            </div>
          </motion.div>

          {/* Account Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="p-5 rounded-xl border border-border bg-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">{labels.accountInfo}</h3>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-card-foreground">{user?.email}</span>
            </div>
          </motion.div>

          {/* Edit Profile */}
          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-6 rounded-xl border border-border bg-card space-y-5">
            <h3 className="font-heading font-semibold text-card-foreground">{labels.title}</h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{labels.displayName}</label>
              <div className="relative">
                <User className="absolute top-3.5 left-3 h-4 w-4 text-muted-foreground" />
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('contact.phone')}</label>
              <div className="relative">
                <Phone className="absolute top-3.5 left-3 h-4 w-4 text-muted-foreground" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <button type="submit" disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              <Save className="h-4 w-4" />
              {saving ? t('common.loading') : t('common.save')}
            </button>
          </motion.form>

          {/* Change Password */}
          <motion.form onSubmit={handlePasswordChange} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="p-6 rounded-xl border border-border bg-card space-y-5">
            <h3 className="font-heading font-semibold text-card-foreground flex items-center gap-2">
              <Lock className="h-4 w-4" /> {labels.changePassword}
            </h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{labels.newPassword}</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{labels.confirmPassword}</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <button type="submit" disabled={changingPassword}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors disabled:opacity-50">
              <Lock className="h-4 w-4" />
              {changingPassword ? t('common.loading') : labels.changePassword}
            </button>
          </motion.form>
        </div>
      </section>
    </div>
  );
};

export default Profile;
