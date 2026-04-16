import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Edit, Trash2, Save, Loader2, Users } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';

interface MemberForm {
  name: string;
  position: string;
  photo_url: string;
  bio: string;
  status: string;
}

const empty: MemberForm = { name: '', position: '', photo_url: '', bio: '', status: 'Active' };

const AdminTeam = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<MemberForm>(empty);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['admin-team'],
    queryFn: async () => {
      const { data, error } = await supabase.from('team_members').select('*').order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        position: form.position,
        photo_url: form.photo_url || null,
        bio: form.bio || null,
        status: form.status,
      };
      if (editing === 'new') {
        const { error } = await supabase.from('team_members').insert({ ...payload, sort_order: members.length + 1 });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('team_members').update(payload).eq('id', editing!);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-team'] }); setEditing(null); toast.success(t('admin.memberSaved')); },
    onError: () => toast.error(t('admin.memberSaveFailed')),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-team'] }); setDeleteId(null); toast.success(t('admin.memberDeleted')); },
  });

  const openEdit = (m: any) => {
    setForm({ name: m.name, position: m.position, photo_url: m.photo_url || '', bio: m.bio || '', status: m.status });
    setEditing(m.id);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.team')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('admin.manageTeam')}</p>
          </div>
          <Button onClick={() => { setForm(empty); setEditing('new'); }}>
            <Plus className="h-4 w-4" /> {t('admin.addMember')}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : members.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">{t('admin.noMembers')}</p>
            <Button variant="outline" className="mt-4" onClick={() => { setForm(empty); setEditing('new'); }}>
              <Plus className="h-4 w-4" /> {t('admin.firstMember')}
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-border/80 transition-colors">
                <div className="flex items-center gap-4">
                  {m.photo_url ? (
                    <img src={m.photo_url} alt={m.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <span className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </span>
                  )}
                  <div>
                    <h3 className="font-medium text-card-foreground">{m.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{m.position}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === 'Active' ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>{m.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(m)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(m.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing === 'new' ? t('admin.newMember') : t('admin.editMember')}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>{t('common.name')}</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1.5" /></div>
              <div><Label>{t('admin.position')}</Label><Input value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} className="mt-1.5" placeholder={t('admin.positionPlaceholder')} /></div>
              <div><Label>{t('admin.bio')}</Label><Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} className="mt-1.5" rows={3} /></div>
              <div>
                <Label>{t('common.status')}</Label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="mt-1.5 w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="Active">{t('common.active')}</option><option value="Draft">{t('common.draft')}</option>
                </select>
              </div>
              <div><Label>{t('admin.photo')}</Label><div className="mt-1.5"><ImageUpload value={form.photo_url} onChange={url => setForm(f => ({ ...f, photo_url: url }))} folder="team" /></div></div>
              <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name.trim() || !form.position.trim()} className="w-full">
                {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {t('common.save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('admin.deleteMember')}</AlertDialogTitle>
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

export default AdminTeam;
