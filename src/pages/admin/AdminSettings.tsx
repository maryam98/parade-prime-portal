import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { Save } from 'lucide-react';

const settingsConfig = [
  { section: 'General', items: [
    { key: 'site_name', label: 'Site Name', type: 'text' },
    { key: 'footer_text', label: 'Footer Text', type: 'text' },
  ]},
  { section: 'Contact Info', items: [
    { key: 'contact_email', label: 'Contact Email', type: 'email' },
    { key: 'contact_phone', label: 'Contact Phone', type: 'tel' },
    { key: 'address', label: 'Address', type: 'text' },
  ]},
  { section: 'Social Media', items: [
    { key: 'social_linkedin', label: 'LinkedIn URL', type: 'url' },
    { key: 'social_twitter', label: 'Twitter / X URL', type: 'url' },
    { key: 'social_instagram', label: 'Instagram URL', type: 'url' },
  ]},
];

const AdminSettings = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['site-settings'],
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
      const promises = Object.entries(form).map(([key, value]) =>
        supabase.from('site_settings').update({ value }).eq('key', key)
      );
      const results = await Promise.all(promises);
      const err = results.find(r => r.error);
      if (err?.error) throw err.error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['site-settings'] }); toast.success('Settings saved'); },
    onError: () => toast.error('Error saving settings'),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.settings')}</h1>
          <button onClick={() => save.mutate()} disabled={save.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            <Save className="h-4 w-4" /> {t('common.save', 'Save')}
          </button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <div className="max-w-2xl space-y-6">
            {settingsConfig.map(section => (
              <div key={section.section} className="p-6 rounded-xl border border-border bg-card space-y-4">
                <h2 className="font-heading font-semibold text-card-foreground">{section.section}</h2>
                {section.items.map(item => (
                  <div key={item.key}>
                    <label className="block text-sm font-medium text-foreground mb-1.5">{item.label}</label>
                    <input
                      type={item.type}
                      value={form[item.key] || ''}
                      onChange={e => setForm(f => ({ ...f, [item.key]: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
