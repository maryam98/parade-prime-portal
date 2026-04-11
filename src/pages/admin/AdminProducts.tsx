import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  status: string;
}

const empty: ProductForm = { name: '', description: '', price: '', status: 'Active' };

const AdminProducts = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(empty);
  const [adding, setAdding] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from('products').update(form).eq('id', editing);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert({ ...form, sort_order: products.length + 1 });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); setEditing(null); setAdding(false); setForm(empty); toast.success('Saved'); },
    onError: () => toast.error('Error saving'),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Deleted'); },
  });

  const startEdit = (p: any) => { setEditing(p.id); setForm({ name: p.name, description: p.description || '', price: p.price || '', status: p.status }); setAdding(false); };
  const startAdd = () => { setAdding(true); setEditing(null); setForm(empty); };
  const cancel = () => { setEditing(null); setAdding(false); setForm(empty); };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.products')}</h1>
          <button onClick={startAdd} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>

        {adding && (
          <div className="p-5 rounded-xl border border-primary/30 bg-card space-y-3">
            <input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
            <input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
            <div className="flex gap-3">
              <input placeholder="Price" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
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
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Name</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Price</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Status</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  {editing === p.id ? (
                    <>
                      <td className="px-5 py-2"><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-2 py-1 rounded border border-input bg-background text-foreground text-sm" /></td>
                      <td className="px-5 py-2"><input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="w-full px-2 py-1 rounded border border-input bg-background text-foreground text-sm" /></td>
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
                      <td className="px-5 py-3 text-card-foreground font-medium">{p.name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{p.price}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'Active' ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>{p.status}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEdit(p)} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => remove.mutate(p.id)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
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

export default AdminProducts;
