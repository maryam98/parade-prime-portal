import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Plus, Trash2, Shield } from 'lucide-react';

const AdminBlockedIPs = () => {
  const qc = useQueryClient();
  const [newIp, setNewIp] = useState('');
  const [newReason, setNewReason] = useState('');

  const { data: ips = [], isLoading } = useQuery({
    queryKey: ['blocked-ips'],
    queryFn: async () => {
      const { data, error } = await supabase.from('blocked_ips').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const addIp = useMutation({
    mutationFn: async () => {
      if (!newIp.trim()) throw new Error('IP required');
      const { error } = await supabase.from('blocked_ips').insert({ ip_address: newIp.trim(), reason: newReason.trim() || null });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blocked-ips'] });
      setNewIp('');
      setNewReason('');
      toast.success('IP بلاک شد');
    },
    onError: (e: any) => toast.error(e.message || 'خطا'),
  });

  const removeIp = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blocked_ips').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blocked-ips'] });
      toast.success('IP آزاد شد');
    },
    onError: () => toast.error('خطا'),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <Shield className="h-6 w-6" /> مدیریت IP بلاک
        </h1>

        {/* Add IP */}
        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
          <h2 className="font-heading font-semibold text-card-foreground">بلاک کردن IP جدید</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input value={newIp} onChange={e => setNewIp(e.target.value)} placeholder="مثلاً 192.168.1.100"
              className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <input value={newReason} onChange={e => setNewReason(e.target.value)} placeholder="دلیل (اختیاری)"
              className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <button onClick={() => addIp.mutate()} disabled={addIp.isPending || !newIp.trim()}
              className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              <Plus className="h-4 w-4" /> بلاک
            </button>
          </div>
        </div>

        {/* IP List */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-muted-foreground">در حال بارگذاری...</div>
          ) : ips.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">هیچ IP بلاک‌شده‌ای وجود ندارد</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-right p-3 font-medium text-foreground">IP</th>
                  <th className="text-right p-3 font-medium text-foreground">دلیل</th>
                  <th className="text-right p-3 font-medium text-foreground">تاریخ</th>
                  <th className="p-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {ips.map((ip: any) => (
                  <tr key={ip.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="p-3 font-mono text-foreground">{ip.ip_address}</td>
                    <td className="p-3 text-muted-foreground">{ip.reason || '—'}</td>
                    <td className="p-3 text-muted-foreground">{new Date(ip.created_at).toLocaleDateString('fa-IR')}</td>
                    <td className="p-3">
                      <button onClick={() => removeIp.mutate(ip.id)}
                        className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBlockedIPs;
