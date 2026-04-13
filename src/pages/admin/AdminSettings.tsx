import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/sonner';
import { Save, Upload, X, Palette, Type, Globe, Share2, ImageIcon, Shield, Cookie } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminSettings = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const { data: settings = [], isLoading, error } = useQuery({
    queryKey: ['site-settings-admin'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    if (!Array.isArray(settings)) return;
    const map: Record<string, string> = {};
    settings.forEach((s: any) => { map[s.key] = s.value || ''; });
    setForm(map);
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      const promises = Object.entries(form).map(([key, value]) =>
        supabase.from('site_settings').update({ value }).eq('key', key)
      );
      const results = await Promise.all(promises);
      const err = results.find(r => r.error);
      if (err?.error) throw err.error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site-settings-admin'] });
      qc.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success(t('admin.settingsSaved'));
    },
    onError: () => toast.error(t('admin.settingsSaveFailed')),
  });

  const uploadFile = async (file: File, key: string) => {
    const ext = file.name.split('.').pop();
    const fileName = `${key}-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from('media').upload(`settings/${fileName}`, file, { upsert: true });
    if (error) { toast.error(t('admin.uploadFailed')); return; }
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(data.path);
    setForm(f => ({ ...f, [key]: urlData.publicUrl }));
    toast.success(t('admin.fileUploaded'));
  };

  const handleImageUpload = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file, key);
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <p className="text-destructive">{t('admin.settingsLoadFailed')}: {(error as Error).message}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.settings')}</h1>
          <button onClick={() => save.mutate()} disabled={save.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            <Save className="h-4 w-4" /> {save.isPending ? t('common.saving') : t('admin.saveSettings')}
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>{t('common.loading')}</span>
          </div>
        ) : (
          <Tabs defaultValue="general" className="max-w-3xl">
            <TabsList className="mb-6 flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="general" className="gap-1.5"><Globe className="h-4 w-4" /> {t('admin.settingsGeneral')}</TabsTrigger>
              <TabsTrigger value="branding" className="gap-1.5"><ImageIcon className="h-4 w-4" /> {t('admin.settingsBranding')}</TabsTrigger>
              <TabsTrigger value="theme" className="gap-1.5"><Palette className="h-4 w-4" /> {t('admin.settingsTheme')}</TabsTrigger>
              <TabsTrigger value="fonts" className="gap-1.5"><Type className="h-4 w-4" /> {t('admin.settingsFonts')}</TabsTrigger>
              <TabsTrigger value="social" className="gap-1.5"><Share2 className="h-4 w-4" /> {t('admin.settingsSocial')}</TabsTrigger>
              <TabsTrigger value="gdpr" className="gap-1.5"><Cookie className="h-4 w-4" /> {t('admin.settingsGdpr')}</TabsTrigger>
              <TabsTrigger value="security" className="gap-1.5"><Shield className="h-4 w-4" /> {t('admin.settingsSecurity')}</TabsTrigger>
            </TabsList>

            {/* General */}
            <TabsContent value="general">
              <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                <h2 className="font-heading font-semibold text-card-foreground">{t('admin.settingsGeneral')}</h2>
                <SettingTextField form={form} setForm={setForm} settingKey="site_name" label={t('admin.siteName')} placeholder="Paradaim" />
                <SettingTextField form={form} setForm={setForm} settingKey="site_tagline" label={t('admin.siteTagline')} />
                <SettingTextField form={form} setForm={setForm} settingKey="footer_text" label={t('admin.footerText')} placeholder="© 2024 Paradaim" />
                <SettingTextField form={form} setForm={setForm} settingKey="contact_email" label={t('admin.contactEmail')} type="email" />
                <SettingTextField form={form} setForm={setForm} settingKey="contact_phone" label={t('admin.contactPhone')} type="tel" />
                <SettingTextField form={form} setForm={setForm} settingKey="address" label={t('admin.addressLabel')} />
              </div>

              <div className="p-6 rounded-xl border border-border bg-card space-y-4 mt-6">
                <h2 className="font-heading font-semibold text-card-foreground flex items-center gap-2">
                  <Share2 className="h-5 w-5" /> {t('admin.followUs')}
                </h2>
                <SettingTextField form={form} setForm={setForm} settingKey="social_linkedin" label="LinkedIn" type="url" placeholder="https://linkedin.com/..." />
                <SettingTextField form={form} setForm={setForm} settingKey="social_github" label="GitHub" type="url" placeholder="https://github.com/..." />
                <SettingTextField form={form} setForm={setForm} settingKey="social_twitter" label="Twitter / X" type="url" placeholder="https://x.com/..." />
                <SettingTextField form={form} setForm={setForm} settingKey="social_instagram" label="Instagram" type="url" placeholder="https://instagram.com/..." />
              </div>
            </TabsContent>

            {/* Branding */}
            <TabsContent value="branding">
              <div className="p-6 rounded-xl border border-border bg-card space-y-6">
                <h2 className="font-heading font-semibold text-card-foreground">{t('admin.logoAndIcon')}</h2>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">{t('admin.siteLogo')}</label>
                  <p className="text-xs text-muted-foreground">{t('admin.siteLogoDesc')}</p>
                  <div className="flex items-center gap-4">
                    {form.site_logo ? (
                      <div className="relative group">
                        <img src={form.site_logo} alt="Logo" className="h-16 w-auto rounded-lg border border-border object-contain bg-muted p-1" />
                        <button onClick={() => setForm(f => ({ ...f, site_logo: '' }))}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={handleImageUpload('site_logo')} />
                    <button onClick={() => logoInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
                      <Upload className="h-4 w-4" /> {t('common.upload')}
                    </button>
                  </div>
                </div>
                <div className="border-t border-border pt-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">{t('admin.favicon')}</label>
                    <p className="text-xs text-muted-foreground">{t('admin.faviconDesc')}</p>
                    <div className="flex items-center gap-4">
                      {form.site_favicon ? (
                        <div className="relative group">
                          <img src={form.site_favicon} alt="Favicon" className="h-16 w-auto rounded-lg border border-border object-contain bg-muted p-1" />
                          <button onClick={() => setForm(f => ({ ...f, site_favicon: '' }))}
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                      <input type="file" accept="image/*" className="hidden" ref={faviconInputRef} onChange={handleImageUpload('site_favicon')} />
                      <button onClick={() => faviconInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
                        <Upload className="h-4 w-4" /> {t('common.upload')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Theme */}
            <TabsContent value="theme">
              <div className="p-6 rounded-xl border border-border bg-card space-y-5">
                <h2 className="font-heading font-semibold text-card-foreground">{t('admin.themeColors')}</h2>
                <SettingColorField form={form} setForm={setForm} settingKey="theme_primary_color" label={t('admin.primaryColor')} />
                <SettingColorField form={form} setForm={setForm} settingKey="theme_bg_color" label={t('admin.bgColor')} />
                <SettingColorField form={form} setForm={setForm} settingKey="theme_text_color" label={t('admin.textColor')} />
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground">{t('admin.themeHint')}</p>
                </div>
              </div>
            </TabsContent>

            {/* Fonts */}
            <TabsContent value="fonts">
              <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                <h2 className="font-heading font-semibold text-card-foreground">{t('admin.settingsFonts')}</h2>
                <SettingTextField form={form} setForm={setForm} settingKey="theme_heading_font" label={t('admin.headingFont')} placeholder="Space Grotesk" />
                <SettingTextField form={form} setForm={setForm} settingKey="theme_body_font" label={t('admin.bodyFont')} placeholder="DM Sans" />
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground">{t('admin.fontHint')}</p>
                </div>
              </div>
            </TabsContent>

            {/* Social */}
            <TabsContent value="social">
              <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                <h2 className="font-heading font-semibold text-card-foreground">{t('admin.settingsSocial')}</h2>
                <SettingTextField form={form} setForm={setForm} settingKey="social_linkedin" label="LinkedIn" type="url" placeholder="https://linkedin.com/..." />
                <SettingTextField form={form} setForm={setForm} settingKey="social_twitter" label="Twitter / X" type="url" placeholder="https://x.com/..." />
                <SettingTextField form={form} setForm={setForm} settingKey="social_instagram" label="Instagram" type="url" placeholder="https://instagram.com/..." />
              </div>
            </TabsContent>

            {/* GDPR */}
            <TabsContent value="gdpr">
              <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                <h2 className="font-heading font-semibold text-card-foreground">{t('admin.gdprSettings')}</h2>
                <SettingTextField form={form} setForm={setForm} settingKey="gdpr_consent_text" label={t('admin.gdprTextFa')} />
                <SettingTextField form={form} setForm={setForm} settingKey="gdpr_consent_text_en" label={t('admin.gdprTextEn')} />
                <SettingTextField form={form} setForm={setForm} settingKey="gdpr_consent_text_de" label={t('admin.gdprTextDe')} />
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground">{t('admin.gdprHint')}</p>
                </div>
              </div>
            </TabsContent>

            {/* Security */}
            <TabsContent value="security">
              <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                <h2 className="font-heading font-semibold text-card-foreground">{t('admin.securitySettings')}</h2>
                <SettingTextField form={form} setForm={setForm} settingKey="hcaptcha_site_key" label={t('admin.turnstileKey')} placeholder="0x4AAAAAAA..." />
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground">
                    {t('admin.turnstileHint')} <a href="https://dash.cloudflare.com/" target="_blank" rel="noopener" className="text-primary underline">Cloudflare Dashboard</a> → Turnstile → Add Site. <strong>{t('admin.turnstileFree')}</strong>
                  </p>
                </div>
                <div className="border-t border-border pt-4">
                  <a href="/admin/blocked-ips" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
                    <Shield className="h-4 w-4" /> {t('admin.manageBlockedIpsLink')}
                  </a>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AdminLayout>
  );
};

const SettingTextField = ({ form, setForm, settingKey, label, type = 'text', placeholder = '' }: {
  form: Record<string, string>;
  setForm: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  settingKey: string;
  label: string;
  type?: string;
  placeholder?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
    <input
      type={type}
      value={form[settingKey] || ''}
      onChange={e => setForm(f => ({ ...f, [settingKey]: e.target.value }))}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    />
  </div>
);

const SettingColorField = ({ form, setForm, settingKey, label }: {
  form: Record<string, string>;
  setForm: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  settingKey: string;
  label: string;
}) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-foreground">{label}</label>
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={form[settingKey] || '#000000'}
        onChange={e => setForm(f => ({ ...f, [settingKey]: e.target.value }))}
        className="w-10 h-10 rounded-lg border border-input cursor-pointer"
      />
      <input
        type="text"
        value={form[settingKey] || ''}
        onChange={e => setForm(f => ({ ...f, [settingKey]: e.target.value }))}
        placeholder="#C8102E"
        className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  </div>
);

export default AdminSettings;