import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/sonner';
import { Save, Upload, X, Palette, Type, Globe, Share2, Image } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminSettings = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['site-settings-admin'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const map: Record<string, string> = {};
    settings.forEach(s => { map[s.key] = s.value || ''; });
    setForm(map);
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      // Upsert all form values
      const promises = Object.entries(form).map(([key, value]) =>
        supabase.from('site_settings').update({ value }).eq('key', key)
      );
      const results = await Promise.all(promises);
      const err = results.find(r => r.error);
      if (err?.error) throw err.error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['site-settings-admin'] }); qc.invalidateQueries({ queryKey: ['site-settings'] }); toast.success('تنظیمات ذخیره شد'); },
    onError: () => toast.error('خطا در ذخیره تنظیمات'),
  });

  const uploadFile = async (file: File, key: string) => {
    const ext = file.name.split('.').pop();
    const fileName = `${key}-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from('media').upload(`settings/${fileName}`, file, { upsert: true });
    if (error) { toast.error('خطا در آپلود'); return; }
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(data.path);
    setForm(f => ({ ...f, [key]: urlData.publicUrl }));
    toast.success('فایل آپلود شد');
  };

  const handleImageUpload = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file, key);
  };

  const ImageUploadField = ({ settingKey, label, description }: { settingKey: string; label: string; description: string }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="flex items-center gap-4">
        {form[settingKey] ? (
          <div className="relative group">
            <img src={form[settingKey]} alt={label} className="h-16 w-auto rounded-lg border border-border object-contain bg-muted p-1" />
            <button
              onClick={() => setForm(f => ({ ...f, [settingKey]: '' }))}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="h-16 w-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
            <Image className="h-6 w-6" />
          </div>
        )}
        <input type="file" accept="image/*" className="hidden" ref={settingKey === 'site_logo' ? logoInputRef : faviconInputRef} onChange={handleImageUpload(settingKey)} />
        <button
          onClick={() => (settingKey === 'site_logo' ? logoInputRef : faviconInputRef).current?.click()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
        >
          <Upload className="h-4 w-4" /> آپلود
        </button>
      </div>
    </div>
  );

  const ColorField = ({ settingKey, label }: { settingKey: string; label: string }) => (
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

  const TextField = ({ settingKey, label, type = 'text', placeholder = '' }: { settingKey: string; label: string; type?: string; placeholder?: string }) => (
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.settings')}</h1>
          <button onClick={() => save.mutate()} disabled={save.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            <Save className="h-4 w-4" /> {save.isPending ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
          </button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <Tabs defaultValue="general" className="max-w-3xl">
            <TabsList className="mb-6">
              <TabsTrigger value="general" className="gap-1.5"><Globe className="h-4 w-4" /> عمومی</TabsTrigger>
              <TabsTrigger value="branding" className="gap-1.5"><Image className="h-4 w-4" /> برندینگ</TabsTrigger>
              <TabsTrigger value="theme" className="gap-1.5"><Palette className="h-4 w-4" /> تم و رنگ</TabsTrigger>
              <TabsTrigger value="fonts" className="gap-1.5"><Type className="h-4 w-4" /> فونت‌ها</TabsTrigger>
              <TabsTrigger value="social" className="gap-1.5"><Share2 className="h-4 w-4" /> شبکه‌های اجتماعی</TabsTrigger>
            </TabsList>

            {/* General */}
            <TabsContent value="general">
              <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                <h2 className="font-heading font-semibold text-card-foreground">اطلاعات عمومی</h2>
                <TextField settingKey="site_name" label="نام سایت" placeholder="Paradaim" />
                <TextField settingKey="site_tagline" label="شعار سایت" placeholder="شعار کوتاه سایت شما" />
                <TextField settingKey="footer_text" label="متن فوتر" placeholder="© 2024 Paradaim" />
                <TextField settingKey="contact_email" label="ایمیل تماس" type="email" />
                <TextField settingKey="contact_phone" label="تلفن تماس" type="tel" />
                <TextField settingKey="address" label="آدرس" />
              </div>
            </TabsContent>

            {/* Branding */}
            <TabsContent value="branding">
              <div className="p-6 rounded-xl border border-border bg-card space-y-6">
                <h2 className="font-heading font-semibold text-card-foreground">لوگو و آیکون</h2>
                <ImageUploadField settingKey="site_logo" label="لوگوی سایت" description="لوگو در هدر و فوتر نمایش داده می‌شود (PNG یا SVG پیشنهاد می‌شود)" />
                <div className="border-t border-border pt-6">
                  <ImageUploadField settingKey="site_favicon" label="Favicon" description="آیکون کوچک مرورگر — سایز پیشنهادی ۳۲×۳۲ یا ۶۴×۶۴ پیکسل" />
                </div>
              </div>
            </TabsContent>

            {/* Theme */}
            <TabsContent value="theme">
              <div className="p-6 rounded-xl border border-border bg-card space-y-5">
                <h2 className="font-heading font-semibold text-card-foreground">رنگ‌های تم</h2>
                <ColorField settingKey="theme_primary_color" label="رنگ اصلی (Primary)" />
                <ColorField settingKey="theme_bg_color" label="رنگ پس‌زمینه" />
                <ColorField settingKey="theme_text_color" label="رنگ متن" />
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground">
                    💡 پس از ذخیره تنظیمات، رنگ‌ها در بارگذاری بعدی صفحه اعمال می‌شوند.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Fonts */}
            <TabsContent value="fonts">
              <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                <h2 className="font-heading font-semibold text-card-foreground">فونت‌ها</h2>
                <TextField settingKey="theme_heading_font" label="فونت عناوین" placeholder="Space Grotesk" />
                <TextField settingKey="theme_body_font" label="فونت متن" placeholder="DM Sans" />
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground">
                    💡 از فونت‌های Google Fonts استفاده کنید. نام فونت باید دقیقاً مطابق Google Fonts باشد.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Social */}
            <TabsContent value="social">
              <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                <h2 className="font-heading font-semibold text-card-foreground">شبکه‌های اجتماعی</h2>
                <TextField settingKey="social_linkedin" label="LinkedIn" type="url" placeholder="https://linkedin.com/..." />
                <TextField settingKey="social_twitter" label="Twitter / X" type="url" placeholder="https://x.com/..." />
                <TextField settingKey="social_instagram" label="Instagram" type="url" placeholder="https://instagram.com/..." />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
