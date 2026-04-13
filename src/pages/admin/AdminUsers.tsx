import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users as UsersIcon, ShieldCheck, ShieldOff } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const AdminUsers = () => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const qc = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles, error: pErr } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (pErr) throw pErr;
      const { data: roles, error: rErr } = await supabase.from('user_roles').select('*');
      if (rErr) throw rErr;
      const roleMap: Record<string, string[]> = {};
      roles.forEach(r => {
        if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
        roleMap[r.user_id].push(r.role);
      });
      return profiles.map(p => ({
        ...p,
        roles: roleMap[p.user_id] || ['user'],
        isAdmin: (roleMap[p.user_id] || []).includes('admin'),
      }));
    },
  });

  const toggleAdmin = useMutation({
    mutationFn: async ({ userId, makeAdmin }: { userId: string; makeAdmin: boolean }) => {
      if (makeAdmin) {
        const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
        if (error) throw error;
      }
    },
    onSuccess: (_, { makeAdmin }) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(makeAdmin ? t('admin.adminGranted') : t('admin.adminRemoved'));
    },
    onError: () => toast.error(t('admin.roleFailed')),
  });

  const isSelf = (userId: string) => currentUser?.id === userId;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.users')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('admin.registeredUsers', { count: users.length })}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl">
            <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">{t('admin.noUsers')}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">{t('admin.user')}</th>
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">{t('common.phone')}</th>
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">{t('admin.role')}</th>
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">{t('admin.joined')}</th>
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                            {(u.display_name || '?')[0].toUpperCase()}
                          </div>
                        )}
                        <span className="text-card-foreground font-medium">{u.display_name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{u.phone || '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1.5">
                        {u.roles.map((role: string) => (
                          <span key={role} className={`text-xs px-2 py-0.5 rounded-full ${
                            role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                          }`}>{role}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      {!isSelf(u.user_id) && (
                        <div className="flex gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                  u.isAdmin
                                    ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                                }`}
                              >
                                {u.isAdmin ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                                {u.isAdmin ? t('admin.removeAdmin') : t('admin.makeAdmin')}
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {u.isAdmin ? t('admin.removeAdminTitle') : t('admin.makeAdminTitle')}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {u.isAdmin
                                    ? t('admin.removeAdminConfirm', { name: u.display_name || t('admin.user') })
                                    : t('admin.makeAdminConfirm', { name: u.display_name || t('admin.user') })
                                  }
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => toggleAdmin.mutate({ userId: u.user_id, makeAdmin: !u.isAdmin })}
                                >
                                  {t('common.confirm')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
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

export default AdminUsers;