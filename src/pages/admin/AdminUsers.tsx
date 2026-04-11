import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';

const AdminUsers = () => {
  const { t } = useTranslation();

  const users = [
    { id: 1, name: 'Admin User', email: 'admin@paradaim.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Max Müller', email: 'max@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Sara Ahmed', email: 'sara@example.com', role: 'User', status: 'Active' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.users')}</h1>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Name</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Email</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Role</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 text-card-foreground font-medium">{u.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      u.role === 'Admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-600">{u.status}</span>
                  </td>
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
