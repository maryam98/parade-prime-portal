import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';

const AdminMessages = () => {
  const { t } = useTranslation();

  const messages = [
    { id: 1, name: 'Max Müller', email: 'max@example.com', msg: 'Interested in web development services', date: '2026-04-10', read: false },
    { id: 2, name: 'Sara Ahmed', email: 'sara@example.com', msg: 'Need a quote for mobile app', date: '2026-04-09', read: false },
    { id: 3, name: 'John Smith', email: 'john@example.com', msg: 'Partnership inquiry', date: '2026-04-08', read: true },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.messages')}</h1>

        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`p-5 rounded-xl border bg-card transition-colors cursor-pointer hover:border-primary/30 ${
                m.read ? 'border-border' : 'border-primary/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-card-foreground">{m.name}</span>
                    {!m.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <span className="text-xs text-muted-foreground">{m.email}</span>
                </div>
                <span className="text-xs text-muted-foreground">{m.date}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{m.msg}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;
