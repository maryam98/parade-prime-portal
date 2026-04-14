import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { Save, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const LANGUAGES = ['en', 'fa', 'de'] as const;
const LANG_LABELS: Record<string, string> = { en: 'English', fa: 'فارسی', de: 'Deutsch' };

const PAGES = [
  {
    slug: 'about',
    label: 'About',
    sections: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'mission_title', label: 'Mission Title', type: 'text' },
      { key: 'mission_text', label: 'Mission Text', type: 'textarea' },
      { key: 'vision_title', label: 'Vision Title', type: 'text' },
      { key: 'vision_text', label: 'Vision Text', type: 'textarea' },
      { key: 'stat_projects_value', label: 'Stat: Projects Value', type: 'text' },
      { key: 'stat_projects_label', label: 'Stat: Projects Label', type: 'text' },
      { key: 'stat_clients_value', label: 'Stat: Clients Value', type: 'text' },
      { key: 'stat_clients_label', label: 'Stat: Clients Label', type: 'text' },
      { key: 'stat_years_value', label: 'Stat: Years Value', type: 'text' },
      { key: 'stat_years_label', label: 'Stat: Years Label', type: 'text' },
      { key: 'stat_team_value', label: 'Stat: Team Value', type: 'text' },
      { key: 'stat_team_label', label: 'Stat: Team Label', type: 'text' },
    ],
  },
];

const AdminPages = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [activePage, setActivePage] = useState(PAGES[0].slug);
  const [activeLang, setActiveLang] = useState<string>('en');
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: contents = [], isLoading } = useQuery({
    queryKey: ['admin-page-contents', activePage, activeLang],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_contents')
        .select('*')
        .eq('page_slug', activePage)
        .eq('language', activeLang);
      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    const map: Record<string, string> = {};
    contents.forEach((c: any) => { map[c.section_key] = c.content || ''; });
    setForm(map);
  }, [contents]);

  const save = useMutation({
    mutationFn: async () => {
      const page = PAGES.find(p => p.slug === activePage)!;
      const promises = page.sections.map(section => {
        const existing = contents.find((c: any) => c.section_key === section.key);
        if (existing) {
          return supabase
            .from('page_contents')
            .update({ content: form[section.key] || '', updated_at: new Date().toISOString() })
            .eq('id', (existing as any).id);
        } else {
          return supabase
            .from('page_contents')
            .insert({ page_slug: activePage, section_key: section.key, language: activeLang, content: form[section.key] || '' });
        }
      });
      const results = await Promise.all(promises);
      const err = results.find(r => r.error);
      if (err?.error) throw err.error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-page-contents'] });
      qc.invalidateQueries({ queryKey: ['page-content'] });
      toast.success(t('admin.settingsSaved'));
    },
    onError: () => toast.error(t('admin.settingsSaveFailed')),
  });

  const currentPage = PAGES.find(p => p.slug === activePage)!;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-foreground">
            {t('admin.pages')}
          </h1>
          <button
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {save.isPending ? t('common.saving') : t('admin.saveSettings')}
          </button>
        </div>

        {/* Page selector */}
        <div className="flex gap-2">
          {PAGES.map(p => (
            <button
              key={p.slug}
              onClick={() => setActivePage(p.slug)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activePage === p.slug
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Language tabs */}
        <Tabs value={activeLang} onValueChange={setActiveLang}>
          <TabsList>
            {LANGUAGES.map(lang => (
              <TabsTrigger key={lang} value={lang} className="gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                {LANG_LABELS[lang]}
              </TabsTrigger>
            ))}
          </TabsList>

          {LANGUAGES.map(lang => (
            <TabsContent key={lang} value={lang}>
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground py-8">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>{t('common.loading')}</span>
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-border bg-card space-y-5">
                  {currentPage.sections.map(section => (
                    <div key={section.key}>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        {section.label}
                      </label>
                      {section.type === 'textarea' ? (
                        <textarea
                          value={form[section.key] || ''}
                          onChange={e => setForm(f => ({ ...f, [section.key]: e.target.value }))}
                          rows={4}
                          dir={lang === 'fa' ? 'rtl' : 'ltr'}
                          className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                        />
                      ) : (
                        <input
                          type="text"
                          value={form[section.key] || ''}
                          onChange={e => setForm(f => ({ ...f, [section.key]: e.target.value }))}
                          dir={lang === 'fa' ? 'rtl' : 'ltr'}
                          className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPages;
