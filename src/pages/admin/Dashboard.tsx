import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FileText, MessageSquare, CalendarDays, Layers, Package } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const { t } = useTranslation();

  const { data: counts } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [articles, messages, unreadMessages, reservations, services, products] = await Promise.all([
        supabase.from('articles').select('id', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('id', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('read', false),
        supabase.from('reservations').select('id', { count: 'exact', head: true }),
        supabase.from('services').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
      ]);
      return {
        articles: articles.count ?? 0,
        messages: messages.count ?? 0,
        unreadMessages: unreadMessages.count ?? 0,
        reservations: reservations.count ?? 0,
        services: services.count ?? 0,
        products: products.count ?? 0,
      };
    },
  });

  const { data: recentMessages = [] } = useQuery({
    queryKey: ['admin-recent-messages'],
    queryFn: async () => {
      const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: recentReservations = [] } = useQuery({
    queryKey: ['admin-recent-reservations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('reservations').select('*').order('created_at', { ascending: false }).limit(5);
      if (error) throw error;
      return data;
    },
  });

  const stats = [
    { label: t('admin.articles'), value: counts?.articles ?? '—', icon: FileText, trend: `${counts?.articles ?? 0} ${t('admin.total')}` },
    { label: t('admin.newMessages'), value: counts?.unreadMessages ?? '—', icon: MessageSquare, trend: `${counts?.messages ?? 0} ${t('admin.total')}` },
    { label: t('admin.reservations'), value: counts?.reservations ?? '—', icon: CalendarDays, trend: t('admin.allTime') },
    { label: t('admin.activeServices'), value: counts?.services ?? '—', icon: Layers, trend: `${counts?.products ?? 0} ${t('admin.products')}` },
  ];

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.dashboard')}</h1>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-5 rounded-xl border border-border bg-card">
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
          {recentMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('admin.noMessages')}</p>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((m) => (
                <div key={m.id} className="flex items-start justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-card-foreground text-sm">{m.name}</span>
                      {!m.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <div className="text-xs text-muted-foreground">{m.message}</div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{timeAgo(m.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Reservations */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-lg font-heading font-semibold text-card-foreground mb-4">{t('admin.reservations')}</h2>
          {recentReservations.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('admin.noReservations')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">{t('common.name')}</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">{t('common.date')}</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">{t('common.time')}</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">{t('common.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReservations.map((r) => (
                    <tr key={r.id} className="border-b border-border/50">
                      <td className="py-3 text-card-foreground">{r.name}</td>
                      <td className="py-3 text-muted-foreground">{r.reservation_date}</td>
                      <td className="py-3 text-muted-foreground">{r.reservation_time}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          r.status === 'Confirmed' ? 'bg-green-500/10 text-green-600' :
                          r.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-600' :
                          'bg-destructive/10 text-destructive'
                        }`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;