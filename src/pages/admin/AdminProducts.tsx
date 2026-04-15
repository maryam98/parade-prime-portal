import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Edit, Trash2, Save, Loader2, Package } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import ImageUpload from '@/components/ImageUpload';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ProductForm {
  name: string;
  description: string;
  content: string;
  price: string;
  status: string;
  image_url: string;
}

const empty: ProductForm = { name: '', description: '', content: '', price: '', status: 'Active', image_url: '' };

const AdminProducts = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(empty);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
      const payload = { name: form.name, description: form.description || null, content: form.content || null, price: form.price || null, status: form.status, image_url: form.image_url || null };
      if (editing === 'new') {
        const { error } = await supabase.from('products').insert({ ...payload, sort_order: products.length + 1 });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').update(payload).eq('id', editing!);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); setEditing(null); toast.success(t('admin.productSaved')); },
    onError: () => toast.error(t('admin.productSaveFailed')),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); setDeleteId(null); toast.success(t('admin.productDeleted')); },
  });

  const openEdit = (p: any) => {
    setForm({ name: p.name, description: p.description || '', content: p.content || '', price: p.price || '', status: p.status, image_url: p.image_url || '' });
    setEditing(p.id);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.products')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('admin.manageProducts')}</p>
          </div>
          <Button onClick={() => { setForm(empty); setEditing('new'); }}>
            <Plus className="h-4 w-4" /> {t('admin.addProduct')}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">{t('admin.noProducts')}</p>
            <Button variant="outline" className="mt-4" onClick={() => { setForm(empty); setEditing('new'); }}>
              <Plus className="h-4 w-4" /> {t('admin.firstProduct')}
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">{t('admin.product')}</th>
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">{t('admin.price')}</th>
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">{t('common.status')}</th>
                  <th className="text-right px-5 py-3 text-muted-foreground font-medium">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {p.image_url ? <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><Package className="h-4 w-4 text-muted-foreground" /></div>}
                        <div>
                          <span className="text-card-foreground font-medium block">{p.name}</span>
                          {p.description && <span className="text-xs text-muted-foreground line-clamp-1">{p.description}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{p.price || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'Active' ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>{p.status}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing === 'new' ? t('admin.newProduct') : t('admin.editProduct')}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>{t('common.name')}</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1.5" /></div>
              <div><Label>{t('common.description')}</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1.5" placeholder={t('admin.shortDescription')} /></div>
              <div><Label>{t('admin.content')}</Label><Textarea rows={8} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="mt-1.5" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t('admin.price')}</Label><Input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="mt-1.5" /></div>
                <div>
                  <Label>{t('common.status')}</Label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="mt-1.5 w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                    <option value="Active">{t('common.active')}</option><option value="Draft">{t('common.draft')}</option>
                  </select>
                </div>
              </div>
              <div><Label>{t('common.image')}</Label><div className="mt-1.5"><ImageUpload value={form.image_url} onChange={url => setForm(f => ({ ...f, image_url: url }))} folder="products" /></div></div>
              <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name.trim()} className="w-full">
                {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {t('common.save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('admin.deleteProduct')}</AlertDialogTitle>
              <AlertDialogDescription>{t('admin.deleteConfirm')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteId && remove.mutate(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t('common.delete')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;