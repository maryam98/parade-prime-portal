import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Edit, Trash2, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import ImageUpload from '@/components/ImageUpload';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: slides = [], isLoading } = useQuery({
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
        title: form.title, subtitle: form.subtitle || null, description: form.description || null,
        cta_text: form.cta_text || null, cta_link: form.cta_link || null,
        image_url: form.image_url || null, status: form.status,
      };
      if (editing === 'new') {
        const { error } = await supabase.from('hero_slides').insert({ ...payload, sort_order: slides.length + 1 });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('hero_slides').update(payload).eq('id', editing!);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-slides'] }); setEditing(null); toast.success('Slide saved'); },
    onError: () => toast.error('Failed to save slide'),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('hero_slides').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-slides'] }); setDeleteId(null); toast.success('Slide deleted'); },
  });

  const openEdit = (s: any) => {
    setForm({ title: s.title, subtitle: s.subtitle || '', description: s.description || '', cta_text: s.cta_text || '', cta_link: s.cta_link || '', image_url: s.image_url || '', status: s.status });
    setEditing(s.id);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.slider')}</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage hero slider content</p>
          </div>
          <Button onClick={() => { setForm(empty); setEditing('new'); }}>
            <Plus className="h-4 w-4" /> Add Slide
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : slides.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No slides yet</p>
            <Button variant="outline" className="mt-4" onClick={() => { setForm(empty); setEditing('new'); }}>
              <Plus className="h-4 w-4" /> Add your first slide
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {slides.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-border/80 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0">
                    {s.sort_order}
                  </span>
                  {s.image_url && <img src={s.image_url} alt="" className="w-16 h-10 rounded-lg object-cover hidden sm:block" />}
                  <div>
                    <h3 className="font-medium text-card-foreground">{s.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {s.subtitle && <span className="text-xs text-muted-foreground">{s.subtitle}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'Active' ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>{s.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(s.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing === 'new' ? 'New Slide' : 'Edit Slide'}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1.5" /></div>
                <div><Label>Subtitle</Label><Input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className="mt-1.5" /></div>
              </div>
              <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1.5" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Button Text</Label><Input value={form.cta_text} onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))} className="mt-1.5" /></div>
                <div><Label>Button Link</Label><Input value={form.cta_link} onChange={e => setForm(f => ({ ...f, cta_link: e.target.value }))} placeholder="/contact" className="mt-1.5" /></div>
              </div>
              <div>
                <Label>Status</Label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="mt-1.5 w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="Active">Active</option><option value="Draft">Draft</option>
                </select>
              </div>
              <div><Label>Image</Label><div className="mt-1.5"><ImageUpload value={form.image_url} onChange={url => setForm(f => ({ ...f, image_url: url }))} folder="slides" /></div></div>
              <Button onClick={() => save.mutate()} disabled={save.isPending || !form.title.trim()} className="w-full">
                {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Slide</AlertDialogTitle>
              <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteId && remove.mutate(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminSlider;
