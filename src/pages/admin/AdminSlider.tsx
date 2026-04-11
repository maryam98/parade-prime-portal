import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';

interface SlideForm {
  title: string;
  subtitle: string;
  description: string;
  cta_text: string;
  cta_link: string;
  image_url: string;
  status: string;
}

const empty: SlideForm = { title: '', subtitle: '', description: '', cta_text: '', cta_link: '', image_url: '', status: 'Active' };

const AdminSlider = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<SlideForm>(empty);
  const [adding, setAdding] = useState(false);

  const { data: slides = [] } = useQuery({
    queryKey: ['admin-slides'],
    queryFn: async () => {
      const { data, error } = await supabase.from('hero_slides').select('*').order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        image_url: form.image_url || null,
        subtitle: form.subtitle || null,
        description: form.description || null,
        cta_text: form.cta_text || null,
        cta_link: form.cta_link || null,
      };
      if (editing) {
        const { error } = await supabase.from('hero_slides').update(payload).eq('id', editing);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('hero_slides').insert({ ...payload, sort_order: slides.length + 1 });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-slides'] }); cancel(); toast.success('Saved'); },
    onError: () => toast.error('Error saving'),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('hero_slides').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-slides'] }); toast.success('Deleted'); },
  });

  const startEdit = (s: any) => {
    setEditing(s.id);
    setForm({ title: s.title, subtitle: s.subtitle || '', description: s.description || '', cta_text: s.cta_text || '', cta_link: s.cta_link || '', image_url: s.image_url || '', status: s.status });
    setAdding(false);
  };
  const startAdd = () => { setAdding(true); setEditing(null); setForm(empty); };
  const cancel = () => { setEditing(null); setAdding(false); setForm(empty); };

  const inp = (field: keyof SlideForm, placeholder: string) => (
    <input placeholder={placeholder} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
  );

  const formBlock = (
    <div className="p-5 rounded-xl border border-primary/30 bg-card space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        {inp('title', 'Title *')}
        {inp('subtitle', 'Subtitle')}
      </div>
      {inp('description', 'Description')}
      <div className="grid sm:grid-cols-2 gap-3">
        {inp('cta_text', 'Button Text')}
        {inp('cta_link', 'Button Link (e.g. /contact)')}
      </div>
      {inp('image_url', 'Image URL')}
      <div className="flex items-center gap-3">
        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
          className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
          <option value="Active">Active</option>
          <option value="Draft">Draft</option>
        </select>
        <button onClick={() => save.mutate()} className="flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"><Save className="h-3.5 w-3.5" /> Save</button>
        <button onClick={cancel} className="flex items-center gap-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground"><X className="h-3.5 w-3.5" /> Cancel</button>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.slider')}</h1>
          <button onClick={startAdd} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> Add Slide
          </button>
        </div>

        {adding && formBlock}

        <div className="grid gap-4">
          {slides.map((s) => (
            <div key={s.id}>
              {editing === s.id ? formBlock : (
                <div className="flex items-center justify-between p-5 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                      {s.sort_order}
                    </span>
                    <div>
                      <h3 className="font-medium text-card-foreground">{s.title}</h3>
                      {s.subtitle && <span className="text-xs text-muted-foreground">{s.subtitle}</span>}
                      <span className={`ml-2 text-xs ${s.status === 'Active' ? 'text-green-600' : 'text-muted-foreground'}`}>{s.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(s)} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => remove.mutate(s.id)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSlider;
