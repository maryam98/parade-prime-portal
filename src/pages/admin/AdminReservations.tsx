import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Loader2, CalendarDays, Trash2, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';

const AdminReservations = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('reservations').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('reservations').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ['reservations'] });
      toast.success(t('admin.reservationStatusUpdated', { status: status.toLowerCase() }));
    },
    onError: () => toast.error(t('admin.reservationStatusFailed')),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reservations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reservations'] }); setDeleteId(null); toast.success(t('admin.reservationDeleted')); },
  });

  const filtered = statusFilter ? reservations.filter(r => r.status === statusFilter) : reservations;
  const counts = {
    all: reservations.length,
    Pending: reservations.filter(r => r.status === 'Pending').length,
    Confirmed: reservations.filter(r => r.status === 'Confirmed').length,
    Cancelled: reservations.filter(r => r.status === 'Cancelled').length,
  };

  const statusBadge = (status: string) => {
    const cls = status === 'Confirmed' ? 'bg-green-500/10 text-green-600' : status === 'Pending' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-destructive/10 text-destructive';
    return <span className={`text-xs px-2 py-1 rounded-full ${cls}`}>{status}</span>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.reservations')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('admin.manageReservations')}</p>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2">
          {[
            { key: '', label: t('common.all'), count: counts.all },
            { key: 'Pending', label: t('common.pending'), count: counts.Pending },
            { key: 'Confirmed', label: t('common.confirmed'), count: counts.Confirmed },
            { key: 'Cancelled', label: t('common.cancelled'), count: counts.Cancelled },
          ].map(tab => (
            <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
              {tab.label} {tab.count > 0 && <span className="ml-1 opacity-70">({tab.count})</span>}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl">
            <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">{t('admin.noReservations')}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">{t('admin.customer')}</th>
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">{t('admin.dateTime')}</th>
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">{t('common.status')}</th>
                  <th className="text-right px-5 py-3 text-muted-foreground font-medium">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-medium text-card-foreground">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-card-foreground">{r.reservation_date}</div>
                      <div className="text-xs text-muted-foreground">{r.reservation_time}</div>
                    </td>
                    <td className="px-5 py-3">{statusBadge(r.status)}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setViewItem(r)}><Eye className="h-4 w-4" /></Button>
                        {r.status === 'Pending' && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => updateStatus.mutate({ id: r.id, status: 'Confirmed' })} className="text-green-600 hover:text-green-700">
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => updateStatus.mutate({ id: r.id, status: 'Cancelled' })} className="text-muted-foreground hover:text-destructive">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {r.status !== 'Pending' && (
                          <Button variant="ghost" size="icon" onClick={() => updateStatus.mutate({ id: r.id, status: 'Pending' })} className="text-muted-foreground hover:text-yellow-600">
                            <Clock className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(r.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('admin.reservationDetails')}</DialogTitle></DialogHeader>
            {viewItem && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-xs text-muted-foreground block">{t('common.name')}</span><span className="font-medium text-foreground">{viewItem.name}</span></div>
                  <div><span className="text-xs text-muted-foreground block">{t('common.email')}</span><span className="text-foreground">{viewItem.email}</span></div>
                  <div><span className="text-xs text-muted-foreground block">{t('common.phone')}</span><span className="text-foreground">{viewItem.phone || '—'}</span></div>
                  <div><span className="text-xs text-muted-foreground block">{t('common.status')}</span>{statusBadge(viewItem.status)}</div>
                  <div><span className="text-xs text-muted-foreground block">{t('common.date')}</span><span className="text-foreground">{viewItem.reservation_date}</span></div>
                  <div><span className="text-xs text-muted-foreground block">{t('common.time')}</span><span className="text-foreground">{viewItem.reservation_time}</span></div>
                </div>
                {viewItem.notes && (
                  <div><span className="text-xs text-muted-foreground block mb-1">{t('common.notes')}</span><p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">{viewItem.notes}</p></div>
                )}
                <div className="text-xs text-muted-foreground">{t('admin.created')}: {new Date(viewItem.created_at).toLocaleString()}</div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('admin.deleteReservation')}</AlertDialogTitle>
              <AlertDialogDescription>{t('admin.deleteConfirm')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteId && remove.mutate(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t('common.delete')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminReservations;