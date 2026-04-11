import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';

interface ArticleForm {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string;
  status: string;
  published_at: string;
}

const empty: ArticleForm = { title: '', excerpt: '', content: '', category: 'General', image_url: '', status: 'Draft', published_at: '' };

const AdminArticles = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleForm>(empty);
  const [adding, setAdding] = useState(false);

  const { data: articles = [] } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        excerpt: form.excerpt || null,
        content: form.content || null,
        category: form.category,
        image_url: form.image_url || null,
        status: form.status,
        published_at: form.published_at || null,
      };
      if (editing) {
        const { error } = await supabase.from('articles').update(payload).eq('id', editing);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('articles').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-articles'] }); cancel(); toast.success('Saved'); },
    onError: () => toast.error('Error saving'),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-articles'] }); toast.success('Deleted'); },
  });

  const startEdit = (a: any) => {
    setEditing(a.id);
    setForm({ title: a.title, excerpt: a.excerpt || '', content: a.content || '', category: a.category, image_url: a.image_url || '', status: a.status, published_at: a.published_at || '' });
    setAdding(false);
  };
  const startAdd = () => { setAdding(true); setEditing(null); setForm(empty); };
  const cancel = () => { setEditing(null); setAdding(false); setForm(empty); };

  const formBlock = (
    <div className="p-5 rounded-xl border border-primary/30 bg-card space-y-3">
      <input placeholder="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
      <input placeholder="Excerpt" value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
      <textarea placeholder="Content" rows={5} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm resize-none" />
      <div className="grid sm:grid-cols-3 gap-3">
        <input placeholder="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
        <input type="date" value={form.published_at} onChange={e => setForm(f => ({ ...f, published_at: e.target.value }))}
          className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
          className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
        </select>
      </div>
      <input placeholder="Image URL" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
      <div className="flex gap-2">
        <button onClick={() => save.mutate()} className="flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"><Save className="h-3.5 w-3.5" /> Save</button>
        <button onClick={cancel} className="flex items-center gap-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground"><X className="h-3.5 w-3.5" /> Cancel</button>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.articles')}</h1>
          <button onClick={startAdd} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> Add Article
          </button>
        </div>

        {adding && formBlock}

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Title</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Category</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Date</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Status</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  {editing === a.id ? (
                    <td colSpan={5} className="p-0">{formBlock}</td>
                  ) : (
                    <>
                      <td className="px-5 py-3 text-card-foreground font-medium">{a.title}</td>
                      <td className="px-5 py-3 text-muted-foreground">{a.category}</td>
                      <td className="px-5 py-3 text-muted-foreground">{a.published_at || '-'}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${a.status === 'Published' ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>{a.status}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEdit(a)} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => remove.mutate(a.id)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminArticles;
