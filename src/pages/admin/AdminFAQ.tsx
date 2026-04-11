import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Edit2, Trash2, Save, Loader2, HelpCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-faqs'] }); setEditing(null); toast.success('FAQ saved'); },
    onError: () => toast.error('Failed to save FAQ'),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('faqs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-faqs'] }); setDeleteId(null); toast.success('FAQ deleted'); },
  });

  const openEdit = (faq: any) => {
    setForm({ question: faq.question, answer: faq.answer, language: faq.language, sort_order: faq.sort_order, status: faq.status });
    setEditing(faq.id);
  };

  const langLabel = (l: string) => l === 'fa' ? 'فارسی' : l === 'de' ? 'Deutsch' : 'English';

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">FAQ Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage frequently asked questions</p>
          </div>
          <Button onClick={() => { setForm(empty); setEditing('new'); }}>
            <Plus className="h-4 w-4" /> Add FAQ
          </Button>
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

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl">
            <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">{filterLang ? 'No FAQs for this language' : 'No FAQs yet'}</p>
            <Button variant="outline" className="mt-4" onClick={() => { setForm(empty); setEditing('new'); }}>
              <Plus className="h-4 w-4" /> Add your first FAQ
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
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
                      <span className={`text-xs px-2 py-0.5 rounded-full ${faq.status === 'Active' ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>{faq.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(faq)}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(faq.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing === 'new' ? 'New FAQ' : 'Edit FAQ'}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Language</Label>
                  <select value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                    className="mt-1.5 w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                    <option value="en">English</option><option value="de">Deutsch</option><option value="fa">فارسی</option>
                  </select>
                </div>
                <div><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))} className="mt-1.5" /></div>
              </div>
              <div><Label>Question</Label><Input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} className="mt-1.5" /></div>
              <div><Label>Answer</Label><Textarea rows={4} value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} className="mt-1.5" /></div>
              <div>
                <Label>Status</Label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="mt-1.5 w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="Active">Active</option><option value="Draft">Draft</option>
                </select>
              </div>
              <Button onClick={() => save.mutate()} disabled={save.isPending || !form.question.trim() || !form.answer.trim()} className="w-full">
                {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
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

export default AdminFAQ;
