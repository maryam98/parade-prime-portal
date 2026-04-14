import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useState } from 'react';
import { Loader2, Plus, Trash2, CalendarDays, Clock, AlertTriangle, CheckCircle2, XCircle, Eye, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

const DAYS_MAP: Record<string, Record<number, string>> = {
  fa: { 0: 'یکشنبه', 1: 'دوشنبه', 2: 'سه‌شنبه', 3: 'چهارشنبه', 4: 'پنجشنبه', 5: 'جمعه', 6: 'شنبه' },
  en: { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' },
  de: { 0: 'So', 1: 'Mo', 2: 'Di', 3: 'Mi', 4: 'Do', 5: 'Fr', 6: 'Sa' },
};

const AdminAppointments = () => {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const isRtl = i18n.language === 'fa';
  const daysMap = DAYS_MAP[i18n.language] || DAYS_MAP.en;

  // State
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [holidayDialog, setHolidayDialog] = useState(false);
  const [bookDialog, setBookDialog] = useState(false);
  const [deleteScheduleId, setDeleteScheduleId] = useState<string | null>(null);
  const [deleteHolidayId, setDeleteHolidayId] = useState<string | null>(null);
  const [cancelAppointment, setCancelAppointment] = useState<any>(null);
  const [viewAppointment, setViewAppointment] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');

  // Schedule form
  const [scheduleForm, setScheduleForm] = useState({
    start_date: '', end_date: '', days_of_week: [1, 2, 3, 4, 5] as number[],
    start_time: '08:00', end_time: '16:00', slot_duration: 30,
  });

  // Holiday form
  const [holidayForm, setHolidayForm] = useState({ holiday_date: '', description: '' });

  // Manual booking form
  const [bookForm, setBookForm] = useState({
    name: '', email: '', phone: '', appointment_date: '', appointment_time: '', duration: 30, notes: '',
  });

  // Queries
  const { data: schedules = [], isLoading: loadingSchedules } = useQuery({
    queryKey: ['availability_schedules'],
    queryFn: async () => {
      const { data, error } = await supabase.from('availability_schedules').select('*').order('start_date', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: holidays = [], isLoading: loadingHolidays } = useQuery({
    queryKey: ['holidays'],
    queryFn: async () => {
      const { data, error } = await supabase.from('holidays').select('*').order('holiday_date', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: appointments = [], isLoading: loadingAppointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('appointments').select('*').order('appointment_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Mutations
  const addSchedule = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('availability_schedules').insert({
        start_date: scheduleForm.start_date,
        end_date: scheduleForm.end_date,
        days_of_week: scheduleForm.days_of_week,
        start_time: scheduleForm.start_time,
        end_time: scheduleForm.end_time,
        slot_duration: scheduleForm.slot_duration,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['availability_schedules'] });
      setScheduleDialog(false);
      setScheduleForm({ start_date: '', end_date: '', days_of_week: [1, 2, 3, 4, 5], start_time: '08:00', end_time: '16:00', slot_duration: 30 });
      toast.success(t('admin.scheduleSaved', 'برنامه ذخیره شد'));
    },
    onError: () => toast.error(t('admin.scheduleSaveFailed', 'خطا در ذخیره برنامه')),
  });

  const removeSchedule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('availability_schedules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['availability_schedules'] }); setDeleteScheduleId(null); toast.success(t('admin.scheduleDeleted', 'برنامه حذف شد')); },
  });

  const addHoliday = useMutation({
    mutationFn: async () => {
      // Check if any appointments exist on this date
      const { data: existingApps } = await supabase.from('appointments').select('id').eq('appointment_date', holidayForm.holiday_date).neq('status', 'Cancelled');
      if (existingApps && existingApps.length > 0) {
        throw new Error(`CONFLICT:${existingApps.length}`);
      }
      const { error } = await supabase.from('holidays').insert({
        holiday_date: holidayForm.holiday_date,
        description: holidayForm.description || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['holidays'] });
      setHolidayDialog(false);
      setHolidayForm({ holiday_date: '', description: '' });
      toast.success(t('admin.holidaySaved', 'تعطیلی ثبت شد'));
    },
    onError: (err: Error) => {
      if (err.message.startsWith('CONFLICT:')) {
        const count = err.message.split(':')[1];
        toast.error(t('admin.holidayConflict', `${count} نوبت فعال در این تاریخ وجود دارد. ابتدا آن‌ها را لغو کنید.`));
      } else {
        toast.error(t('admin.holidaySaveFailed', 'خطا در ثبت تعطیلی'));
      }
    },
  });

  const removeHoliday = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('holidays').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['holidays'] }); setDeleteHolidayId(null); toast.success(t('admin.holidayDeleted', 'تعطیلی حذف شد')); },
  });

  const adminBook = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('appointments').insert({
        name: bookForm.name.trim(),
        email: bookForm.email.trim(),
        phone: bookForm.phone.trim() || null,
        appointment_date: bookForm.appointment_date,
        appointment_time: bookForm.appointment_time,
        duration: bookForm.duration,
        notes: bookForm.notes.trim() || null,
        admin_booked: true,
        status: 'Confirmed',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      setBookDialog(false);
      setBookForm({ name: '', email: '', phone: '', appointment_date: '', appointment_time: '', duration: 30, notes: '' });
      toast.success(t('admin.appointmentBooked', 'نوبت ثبت شد'));
    },
    onError: () => toast.error(t('admin.appointmentBookFailed', 'خطا در ثبت نوبت')),
  });

  const updateAppointmentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      setCancelAppointment(null);
      toast.success(t('admin.appointmentUpdated', 'وضعیت نوبت بروزرسانی شد'));
    },
    onError: () => toast.error(t('admin.appointmentUpdateFailed', 'خطا')),
  });

  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success(t('admin.appointmentDeleted', 'نوبت حذف شد'));
    },
  });

  const toggleDay = (day: number) => {
    setScheduleForm(f => ({
      ...f,
      days_of_week: f.days_of_week.includes(day) ? f.days_of_week.filter(d => d !== day) : [...f.days_of_week, day].sort(),
    }));
  };

  const filteredAppointments = statusFilter ? appointments.filter((a: any) => a.status === statusFilter) : appointments;
  const counts = {
    all: appointments.length,
    Pending: appointments.filter((a: any) => a.status === 'Pending').length,
    Confirmed: appointments.filter((a: any) => a.status === 'Confirmed').length,
    Cancelled: appointments.filter((a: any) => a.status === 'Cancelled').length,
  };

  const statusBadge = (status: string) => {
    const cls = status === 'Confirmed' ? 'bg-green-500/10 text-green-600' : status === 'Pending' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-destructive/10 text-destructive';
    return <span className={`text-xs px-2 py-1 rounded-full ${cls}`}>{status}</span>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.appointmentSystem', 'سیستم نوبت‌دهی')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('admin.manageAppointments', 'مدیریت برنامه کاری، تعطیلات و نوبت‌ها')}</p>
        </div>

        <Tabs defaultValue="schedules" className="space-y-4">
          <TabsList>
            <TabsTrigger value="schedules">{t('admin.workSchedules', 'برنامه کاری')}</TabsTrigger>
            <TabsTrigger value="holidays">{t('admin.holidays', 'تعطیلات')}</TabsTrigger>
            <TabsTrigger value="appointments">
              {t('admin.appointments', 'نوبت‌ها')}
              {counts.Pending > 0 && <span className="ml-1.5 bg-yellow-500/20 text-yellow-600 text-xs px-1.5 py-0.5 rounded-full">{counts.Pending}</span>}
            </TabsTrigger>
          </TabsList>

          {/* ===== SCHEDULES TAB ===== */}
          <TabsContent value="schedules" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setScheduleDialog(true)} size="sm"><Plus className="h-4 w-4 mr-1" />{t('admin.addSchedule', 'افزودن برنامه')}</Button>
            </div>

            {loadingSchedules ? (
              <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border rounded-xl">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">{t('admin.noSchedules', 'هنوز برنامه‌ای ثبت نشده')}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {schedules.map((s: any) => (
                  <div key={s.id} className="border border-border rounded-xl p-5 bg-card flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        <span className="font-medium text-card-foreground">{s.start_date} → {s.end_date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}</span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">{s.slot_duration} {t('admin.minutes', 'دقیقه')}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(s.days_of_week || []).map((d: number) => (
                          <span key={d} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{daysMap[d]}</span>
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteScheduleId(s.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ===== HOLIDAYS TAB ===== */}
          <TabsContent value="holidays" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setHolidayDialog(true)} size="sm"><Plus className="h-4 w-4 mr-1" />{t('admin.addHoliday', 'افزودن تعطیلی')}</Button>
            </div>

            {loadingHolidays ? (
              <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : holidays.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border rounded-xl">
                <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">{t('admin.noHolidays', 'هنوز تعطیلی ثبت نشده')}</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {holidays.map((h: any) => (
                  <div key={h.id} className="flex items-center justify-between border border-border rounded-lg px-4 py-3 bg-card">
                    <div>
                      <span className="font-medium text-card-foreground">{h.holiday_date}</span>
                      {h.description && <span className="text-sm text-muted-foreground ml-3">— {h.description}</span>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteHolidayId(h.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ===== APPOINTMENTS TAB ===== */}
          <TabsContent value="appointments" className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex gap-2">
                {[
                  { key: '', label: t('common.all'), count: counts.all },
                  { key: 'Pending', label: t('common.pending', 'در انتظار'), count: counts.Pending },
                  { key: 'Confirmed', label: t('common.confirmed', 'تأیید شده'), count: counts.Confirmed },
                  { key: 'Cancelled', label: t('common.cancelled', 'لغو شده'), count: counts.Cancelled },
                ].map(tab => (
                  <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                    {tab.label} {tab.count > 0 && <span className="ml-1 opacity-70">({tab.count})</span>}
                  </button>
                ))}
              </div>
              <Button onClick={() => setBookDialog(true)} size="sm" variant="outline"><UserPlus className="h-4 w-4 mr-1" />{t('admin.manualBook', 'ثبت دستی نوبت')}</Button>
            </div>

            {loadingAppointments ? (
              <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border rounded-xl">
                <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">{t('admin.noAppointments', 'نوبتی ثبت نشده')}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-start px-5 py-3 text-muted-foreground font-medium">{t('admin.customer', 'مشتری')}</th>
                      <th className="text-start px-5 py-3 text-muted-foreground font-medium">{t('admin.dateTime', 'تاریخ و ساعت')}</th>
                      <th className="text-start px-5 py-3 text-muted-foreground font-medium">{t('common.status', 'وضعیت')}</th>
                      <th className="text-end px-5 py-3 text-muted-foreground font-medium">{t('common.actions', 'عملیات')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((a: any) => (
                      <tr key={a.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3">
                          <div className="font-medium text-card-foreground">{a.name}</div>
                          <div className="text-xs text-muted-foreground">{a.email}</div>
                          {a.admin_booked && <span className="text-xs bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded mt-0.5 inline-block">{t('admin.adminBooked', 'ثبت ادمین')}</span>}
                        </td>
                        <td className="px-5 py-3">
                          <div className="text-card-foreground">{a.appointment_date}</div>
                          <div className="text-xs text-muted-foreground">{a.appointment_time?.slice(0, 5)} ({a.duration} {t('admin.min', 'دقیقه')})</div>
                        </td>
                        <td className="px-5 py-3">{statusBadge(a.status)}</td>
                        <td className="px-5 py-3 text-end">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setViewAppointment(a)}><Eye className="h-4 w-4" /></Button>
                            {a.status === 'Pending' && (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => updateAppointmentStatus.mutate({ id: a.id, status: 'Confirmed' })} className="text-green-600 hover:text-green-700"><CheckCircle2 className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => setCancelAppointment(a)} className="text-muted-foreground hover:text-destructive"><XCircle className="h-4 w-4" /></Button>
                              </>
                            )}
                            {a.status === 'Confirmed' && (
                              <Button variant="ghost" size="icon" onClick={() => setCancelAppointment(a)} className="text-muted-foreground hover:text-destructive"><XCircle className="h-4 w-4" /></Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => deleteAppointment.mutate(a.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* ===== DIALOGS ===== */}

        {/* Add Schedule Dialog */}
        <Dialog open={scheduleDialog} onOpenChange={setScheduleDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{t('admin.addSchedule', 'افزودن برنامه کاری')}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addSchedule.mutate(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">{t('admin.startDate', 'از تاریخ')}</label>
                  <input type="date" required value={scheduleForm.start_date} onChange={e => setScheduleForm(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">{t('admin.endDate', 'تا تاریخ')}</label>
                  <input type="date" required value={scheduleForm.end_date} onChange={e => setScheduleForm(f => ({ ...f, end_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">{t('admin.startTime', 'ساعت شروع')}</label>
                  <input type="time" required value={scheduleForm.start_time} onChange={e => setScheduleForm(f => ({ ...f, start_time: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">{t('admin.endTime', 'ساعت پایان')}</label>
                  <input type="time" required value={scheduleForm.end_time} onChange={e => setScheduleForm(f => ({ ...f, end_time: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">{t('admin.slotDuration', 'مدت هر نوبت (دقیقه)')}</label>
                <select value={scheduleForm.slot_duration} onChange={e => setScheduleForm(f => ({ ...f, slot_duration: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={45}>45</option>
                  <option value={60}>60</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">{t('admin.daysOfWeek', 'روزهای هفته')}</label>
                <div className="flex flex-wrap gap-2">
                  {[6, 0, 1, 2, 3, 4, 5].map(day => (
                    <button key={day} type="button" onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        scheduleForm.days_of_week.includes(day)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-muted-foreground hover:border-primary/30'
                      }`}>
                      {daysMap[day]}
                    </button>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={addSchedule.isPending}>{addSchedule.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('common.save', 'ذخیره')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Holiday Dialog */}
        <Dialog open={holidayDialog} onOpenChange={setHolidayDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>{t('admin.addHoliday', 'افزودن تعطیلی')}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addHoliday.mutate(); }} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">{t('common.date', 'تاریخ')}</label>
                <input type="date" required value={holidayForm.holiday_date} onChange={e => setHolidayForm(f => ({ ...f, holiday_date: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">{t('admin.description', 'توضیحات')}</label>
                <input type="text" value={holidayForm.description} onChange={e => setHolidayForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={addHoliday.isPending}>{addHoliday.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('common.save', 'ذخیره')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Manual Booking Dialog */}
        <Dialog open={bookDialog} onOpenChange={setBookDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{t('admin.manualBook', 'ثبت دستی نوبت')}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); adminBook.mutate(); }} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">{t('common.name', 'نام')}</label>
                <input type="text" required value={bookForm.name} onChange={e => setBookForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">{t('common.email', 'ایمیل')}</label>
                <input type="email" required value={bookForm.email} onChange={e => setBookForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">{t('common.phone', 'تلفن')}</label>
                <input type="tel" value={bookForm.phone} onChange={e => setBookForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">{t('common.date', 'تاریخ')}</label>
                  <input type="date" required value={bookForm.appointment_date} onChange={e => setBookForm(f => ({ ...f, appointment_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">{t('common.time', 'ساعت')}</label>
                  <input type="time" required value={bookForm.appointment_time} onChange={e => setBookForm(f => ({ ...f, appointment_time: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">{t('admin.slotDuration', 'مدت (دقیقه)')}</label>
                <select value={bookForm.duration} onChange={e => setBookForm(f => ({ ...f, duration: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={45}>45</option>
                  <option value={60}>60</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">{t('common.notes', 'یادداشت')}</label>
                <textarea rows={2} value={bookForm.notes} onChange={e => setBookForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm resize-none" />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={adminBook.isPending}>{adminBook.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('admin.bookAppointment', 'ثبت نوبت')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Appointment Dialog */}
        <Dialog open={!!viewAppointment} onOpenChange={(open) => !open && setViewAppointment(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('admin.appointmentDetails', 'جزئیات نوبت')}</DialogTitle></DialogHeader>
            {viewAppointment && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-xs text-muted-foreground block">{t('common.name')}</span><span className="font-medium text-foreground">{viewAppointment.name}</span></div>
                  <div><span className="text-xs text-muted-foreground block">{t('common.email')}</span><span className="text-foreground">{viewAppointment.email}</span></div>
                  <div><span className="text-xs text-muted-foreground block">{t('common.phone')}</span><span className="text-foreground">{viewAppointment.phone || '—'}</span></div>
                  <div><span className="text-xs text-muted-foreground block">{t('common.status')}</span>{statusBadge(viewAppointment.status)}</div>
                  <div><span className="text-xs text-muted-foreground block">{t('common.date')}</span><span className="text-foreground">{viewAppointment.appointment_date}</span></div>
                  <div><span className="text-xs text-muted-foreground block">{t('common.time')}</span><span className="text-foreground">{viewAppointment.appointment_time?.slice(0, 5)} ({viewAppointment.duration} {t('admin.min', 'دقیقه')})</span></div>
                </div>
                {viewAppointment.notes && (
                  <div><span className="text-xs text-muted-foreground block mb-1">{t('common.notes')}</span><p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">{viewAppointment.notes}</p></div>
                )}
                {viewAppointment.admin_booked && <p className="text-xs text-blue-600 bg-blue-500/10 px-3 py-1.5 rounded-lg">{t('admin.adminBookedNote', 'این نوبت توسط ادمین ثبت شده است')}</p>}
                <div className="text-xs text-muted-foreground">{t('admin.created')}: {new Date(viewAppointment.created_at).toLocaleString()}</div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Cancel Appointment Confirmation */}
        <AlertDialog open={!!cancelAppointment} onOpenChange={(open) => !open && setCancelAppointment(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-500" />{t('admin.cancelAppointmentTitle', 'لغو نوبت')}</AlertDialogTitle>
              <AlertDialogDescription>
                {cancelAppointment && t('admin.cancelAppointmentDesc', `نوبت ${cancelAppointment.name} در تاریخ ${cancelAppointment.appointment_date} ساعت ${cancelAppointment.appointment_time?.slice(0, 5)} لغو خواهد شد.`)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel', 'انصراف')}</AlertDialogCancel>
              <AlertDialogAction onClick={() => cancelAppointment && updateAppointmentStatus.mutate({ id: cancelAppointment.id, status: 'Cancelled' })} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t('admin.confirmCancel', 'بله، لغو شود')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Schedule Confirmation */}
        <AlertDialog open={!!deleteScheduleId} onOpenChange={(open) => !open && setDeleteScheduleId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('admin.deleteScheduleTitle', 'حذف برنامه')}</AlertDialogTitle>
              <AlertDialogDescription>{t('admin.deleteScheduleDesc', 'آیا مطمئنید؟ این عمل غیرقابل بازگشت است.')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteScheduleId && removeSchedule.mutate(deleteScheduleId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t('common.delete', 'حذف')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Holiday Confirmation */}
        <AlertDialog open={!!deleteHolidayId} onOpenChange={(open) => !open && setDeleteHolidayId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('admin.deleteHolidayTitle', 'حذف تعطیلی')}</AlertDialogTitle>
              <AlertDialogDescription>{t('admin.deleteHolidayDesc', 'آیا مطمئنید؟')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteHolidayId && removeHoliday.mutate(deleteHolidayId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t('common.delete')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminAppointments;
