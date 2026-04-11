import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Loader2, Mail, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useState } from 'react';

const AdminMessages = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['contact_messages'],
    queryFn: async () => {
      const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggleRead = useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) => {
      const { error } = await supabase.from('contact_messages').update({ read: !read }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contact_messages'] });
      qc.invalidateQueries({ queryKey: ['admin-unread-count'] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contact_messages'] });
      qc.invalidateQueries({ queryKey: ['admin-unread-count'] });
      setDeleteId(null);
      toast.success('Message deleted');
    },
  });

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.messages')}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {messages.length} messages{unreadCount > 0 && ` · ${unreadCount} unread`}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id}
                className={`p-5 rounded-xl border bg-card transition-colors ${m.read ? 'border-border' : 'border-primary/20 bg-primary/[0.02]'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${m.read ? 'bg-muted' : 'bg-primary/10'}`}>
                      <Mail className={`h-4 w-4 ${m.read ? 'text-muted-foreground' : 'text-primary'}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-card-foreground">{m.name}</span>
                        {!m.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{m.email}</span>
                        {m.phone && <><span>·</span><span>{m.phone}</span></>}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{m.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-muted-foreground mr-2 hidden sm:block">{new Date(m.created_at).toLocaleDateString()}</span>
                    <Button variant="ghost" size="sm" onClick={() => toggleRead.mutate({ id: m.id, read: m.read })} className="text-xs">
                      {m.read ? 'Mark unread' : 'Mark read'}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(m.id)} className="text-muted-foreground hover:text-destructive h-8 w-8">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Message</AlertDialogTitle>
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

export default AdminMessages;
