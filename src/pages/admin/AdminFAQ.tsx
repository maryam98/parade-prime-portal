import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';

interface FaqForm {
  question: string;
  answer: string;
  language: string;
  sort_order: number;
  status: string;
}

const empty: FaqForm = { question: '', answer: '', language: 'en', sort_order: 0, status: 'Active' };

const AdminFAQ = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FaqForm>(empty);
  const [filterLang, setFilterLang] = useState('');

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('faqs').select('*').order('language').order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const filtered = filterLang ? faqs.filter(f => f.language === filterLang) : faqs;

  const save = useMutation({
    mutationFn: async () => {
      if (editing === 'new') {
        const { error } = await supabase.from('faqs').insert(form);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('faqs').update(form).eq('id', editing!);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-faqs'] }); setEditing(null); toast.success('Saved'); },
    onError: () => toast.error('Error saving'),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('faqs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-faqs'] }); toast.success('Deleted'); },
    onError: () => toast.error('Error deleting'),
  });

  const openEdit = (faq: any) => {
    setForm({ question: faq.question, answer: faq.answer, language: faq.language, sort_order: faq.sort_order, status: faq.status });
    setEditing(faq.id);
  };

  const openNew = () => { setForm(empty); setEditing('new'); };

  const langLabel = (l: string) => l === 'fa' ? 'فارسی' : l === 'de' ? 'Deutsch' : 'English';

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-foreground">FAQ Management</h1>
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> Add FAQ
          </button>
        </div>

        {/* Language filter */}
        <div className="flex gap-2">
          {['', 'en', 'de', 'fa'].map(l => (
            <button key={l} onClick={() => setFilterLang(l)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterLang === l ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
              {l ? langLabel(l) : 'All'}
            </button>
          ))}
        </div>

        {/* Modal */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg p-6 rounded-xl border border-border bg-card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-semibold text-card-foreground">{editing === 'new' ? 'New FAQ' : 'Edit FAQ'}</h2>
                <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Language</label>
                  <select value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground">
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                    <option value="fa">فارسی</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Question</label>
                <input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Answer</label>
                <textarea rows={4} value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground">
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              <button onClick={() => save.mutate()} disabled={save.isPending || !form.question.trim() || !form.answer.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {isLoading ? <p className="text-muted-foreground">Loading...</p> : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Question</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground w-20">Lang</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground w-20">Order</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground w-24">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(faq => (
                  <tr key={faq.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-foreground max-w-xs truncate">{faq.question}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{faq.language.toUpperCase()}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{faq.sort_order}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${faq.status === 'Active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{faq.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(faq)} className="p-1.5 text-muted-foreground hover:text-foreground"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => { if (confirm('Delete?')) remove.mutate(faq.id); }} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminFAQ;
