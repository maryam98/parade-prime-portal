import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';

interface ServiceForm {
  title: string;
  description: string;
  icon: string;
  status: string;
}

const empty: ServiceForm = { title: '', description: '', icon: 'Code', status: 'Active' };
const icons = ['Code', 'Smartphone', 'Palette', 'Lightbulb', 'Cloud', 'Headphones'];

const AdminServices = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(empty);
  const [adding, setAdding] = useState(false);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const { data, error } = await supabase.from('services').select('*').order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from('services').update(form).eq('id', editing);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('services').insert({ ...form, sort_order: services.length + 1 });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-services'] }); setEditing(null); setAdding(false); setForm(empty); toast.success('Saved'); },
    onError: () => toast.error('Error saving'),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-services'] }); toast.success('Deleted'); },
  });

  const startEdit = (s: any) => { setEditing(s.id); setForm({ title: s.title, description: s.description || '', icon: s.icon, status: s.status }); setAdding(false); };
  const startAdd = () => { setAdding(true); setEditing(null); setForm(empty); };
  const cancel = () => { setEditing(null); setAdding(false); setForm(empty); };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.services')}</h1>
          <button onClick={startAdd} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> Add Service
          </button>
        </div>

        {adding && (
          <div className="p-5 rounded-xl border border-primary/30 bg-card space-y-3">
            <input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
            <input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
            <div className="flex gap-3">
              <select value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                {icons.map(ic => <option key={ic} value={ic}>{ic}</option>)}
              </select>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => save.mutate()} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm"><Save className="h-3.5 w-3.5" /> Save</button>
              <button onClick={cancel} className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-sm text-muted-foreground"><X className="h-3.5 w-3.5" /> Cancel</button>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Title</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Icon</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Status</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((svc) => (
                <tr key={svc.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  {editing === svc.id ? (
                    <>
                      <td className="px-5 py-2"><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-2 py-1 rounded border border-input bg-background text-foreground text-sm" /></td>
                      <td className="px-5 py-2">
                        <select value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="px-2 py-1 rounded border border-input bg-background text-foreground text-sm">
                          {icons.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-2">
                        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="px-2 py-1 rounded border border-input bg-background text-foreground text-sm">
                          <option value="Active">Active</option><option value="Draft">Draft</option>
                        </select>
                      </td>
                      <td className="px-5 py-2 flex gap-1">
                        <button onClick={() => save.mutate()} className="p-1.5 rounded hover:bg-green-500/10 text-green-600"><Save className="h-4 w-4" /></button>
                        <button onClick={cancel} className="p-1.5 rounded hover:bg-muted text-muted-foreground"><X className="h-4 w-4" /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3 text-card-foreground font-medium">{svc.title}</td>
                      <td className="px-5 py-3 text-muted-foreground">{svc.icon}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${svc.status === 'Active' ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>{svc.status}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEdit(svc)} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => remove.mutate(svc.id)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
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

export default AdminServices;
