import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminMessages = () => {
  const { t } = useTranslation();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['contact_messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggleRead = async (id: string, read: boolean) => {
    await supabase.from('contact_messages').update({ read: !read }).eq('id', id);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.messages')}</h1>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : messages.length === 0 ? (
          <p className="text-muted-foreground">No messages yet.</p>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                onClick={() => toggleRead(m.id, m.read)}
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
                    {m.phone && <span className="text-xs text-muted-foreground ml-3">{m.phone}</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{m.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;
