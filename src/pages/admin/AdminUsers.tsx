import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminUsers = () => {
  const { t } = useTranslation();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error: pErr } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (pErr) throw pErr;

      // Get all roles
      const { data: roles, error: rErr } = await supabase.from('user_roles').select('*');
      if (rErr) throw rErr;

      // Map roles by user_id
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.users')}</h1>
          <span className="text-sm text-muted-foreground">{users.length} users</span>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Name</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Phone</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Role</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
