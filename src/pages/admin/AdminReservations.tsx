import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';

const AdminReservations = () => {
  const { t } = useTranslation();

  const reservations = [
    { id: 1, name: 'Ali Rezaei', email: 'ali@example.com', date: '2026-04-15', time: '10:00', status: 'Confirmed' },
    { id: 2, name: 'Anna Schmidt', email: 'anna@example.com', date: '2026-04-16', time: '14:00', status: 'Pending' },
    { id: 3, name: 'David Lee', email: 'david@example.com', date: '2026-04-17', time: '11:00', status: 'Confirmed' },
    { id: 4, name: 'Fatima Hassan', email: 'fatima@example.com', date: '2026-04-18', time: '09:00', status: 'Cancelled' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.reservations')}</h1>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Name</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Email</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Date</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Time</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 text-card-foreground font-medium">{r.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.email}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.date}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.time}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      r.status === 'Confirmed' ? 'bg-green-500/10 text-green-600' :
                      r.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-600' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {r.status}
                    </span>
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

export default AdminReservations;
