import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Eye, MessageSquare, CalendarDays, Layers } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

const AdminDashboard = () => {
  const { t } = useTranslation();

  const stats = [
    { label: t('admin.totalVisits'), value: '12,458', icon: Eye, trend: '+12%' },
    { label: t('admin.newMessages'), value: '23', icon: MessageSquare, trend: '+5' },
    { label: t('admin.upcomingBookings'), value: '8', icon: CalendarDays, trend: 'This week' },
    { label: t('admin.activeServices'), value: '6', icon: Layers, trend: 'Active' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.dashboard')}</h1>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-xl border border-border bg-card"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">{stat.trend}</span>
              </div>
              <div className="text-2xl font-heading font-bold text-card-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Recent Messages */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-lg font-heading font-semibold text-card-foreground mb-4">{t('admin.messages')}</h2>
          <div className="space-y-3">
            {[
              { name: 'Max Müller', email: 'max@example.com', msg: 'Interested in web development services', date: '2h ago' },
              { name: 'Sara Ahmed', email: 'sara@example.com', msg: 'Need a quote for mobile app', date: '5h ago' },
              { name: 'John Smith', email: 'john@example.com', msg: 'Partnership inquiry', date: '1d ago' },
            ].map((m, i) => (
              <div key={i} className="flex items-start justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <div className="font-medium text-card-foreground text-sm">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.msg}</div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{m.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-lg font-heading font-semibold text-card-foreground mb-4">{t('admin.reservations')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">Name</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Date</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Time</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Ali Rezaei', date: '2026-04-15', time: '10:00', status: 'Confirmed' },
                  { name: 'Anna Schmidt', date: '2026-04-16', time: '14:00', status: 'Pending' },
                  { name: 'David Lee', date: '2026-04-17', time: '11:00', status: 'Confirmed' },
                ].map((r, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-3 text-card-foreground">{r.name}</td>
                    <td className="py-3 text-muted-foreground">{r.date}</td>
                    <td className="py-3 text-muted-foreground">{r.time}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        r.status === 'Confirmed'
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-yellow-500/10 text-yellow-600'
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
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
