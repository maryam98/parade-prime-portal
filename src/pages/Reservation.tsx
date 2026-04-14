import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar';
import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { format, addMinutes, parse, isAfter, isBefore, isEqual } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Reservation = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'fa';
  const { user, profile } = useAuth();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });

  // Pre-fill form for logged in users
  useState(() => {
    if (user && profile) {
      setForm(f => ({
        ...f,
        name: profile.display_name || '',
        email: user.email || '',
        phone: profile.phone || '',
      }));
    }
  });

  // Fetch schedules
  const { data: schedules = [] } = useQuery({
    queryKey: ['availability_schedules_public'],
    queryFn: async () => {
      const { data, error } = await supabase.from('availability_schedules').select('*').eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  // Fetch holidays
  const { data: holidays = [] } = useQuery({
    queryKey: ['holidays_public'],
    queryFn: async () => {
      const { data, error } = await supabase.from('holidays').select('holiday_date');
      if (error) throw error;
      return data.map((h: any) => h.holiday_date);
    },
  });

  // Fetch booked appointments for selected date
  const dateStr = date ? format(date, 'yyyy-MM-dd') : '';
  const { data: bookedSlots = [], isLoading: loadingSlots } = useQuery({
    queryKey: ['booked_slots', dateStr],
    queryFn: async () => {
      if (!dateStr) return [];
      const { data, error } = await supabase.from('appointments').select('appointment_time, duration').eq('appointment_date', dateStr).neq('status', 'Cancelled');
      if (error) throw error;
      return data;
    },
    enabled: !!dateStr,
  });

  // Calculate which dates are available
  const availableDateCheck = (d: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d < today) return false;

    const ds = format(d, 'yyyy-MM-dd');
    if (holidays.includes(ds)) return false;

    const dayOfWeek = d.getDay();
    return schedules.some((s: any) => {
      const start = new Date(s.start_date);
      const end = new Date(s.end_date);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      const dClean = new Date(d);
      dClean.setHours(0, 0, 0, 0);
      return dClean >= start && dClean <= end && (s.days_of_week || []).includes(dayOfWeek);
    });
  };

  // Generate time slots for selected date
  const timeSlots = useMemo(() => {
    if (!date) return [];
    const dayOfWeek = date.getDay();
    const slots: { time: string; duration: number }[] = [];

    for (const s of schedules as any[]) {
      const start = new Date(s.start_date);
      const end = new Date(s.end_date);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      const dClean = new Date(date);
      dClean.setHours(0, 0, 0, 0);

      if (dClean >= start && dClean <= end && (s.days_of_week || []).includes(dayOfWeek)) {
        const startTime = parse(s.start_time.slice(0, 5), 'HH:mm', new Date());
        const endTime = parse(s.end_time.slice(0, 5), 'HH:mm', new Date());
        let current = startTime;

        while (isBefore(current, endTime) || isEqual(current, endTime)) {
          const slotEnd = addMinutes(current, s.slot_duration);
          if (isAfter(slotEnd, endTime)) break;
          slots.push({ time: format(current, 'HH:mm'), duration: s.slot_duration });
          current = slotEnd;
        }
      }
    }

    // Remove duplicates and sort
    const unique = Array.from(new Map(slots.map(s => [s.time, s])).values());
    unique.sort((a, b) => a.time.localeCompare(b.time));
    return unique;
  }, [date, schedules]);

  // Filter out booked slots
  const availableSlots = useMemo(() => {
    const bookedTimes = bookedSlots.map((b: any) => b.appointment_time?.slice(0, 5));
    return timeSlots.filter(s => !bookedTimes.includes(s.time));
  }, [timeSlots, bookedSlots]);

  const selectedSlot = timeSlots.find(s => s.time === selectedTime);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !selectedTime || !selectedSlot) {
      toast.error(t('reservation.selectDateTime', 'لطفاً تاریخ و ساعت را انتخاب کنید'));
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('appointments').insert({
      user_id: user?.id || null,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      notes: form.notes.trim() || null,
      appointment_date: format(date, 'yyyy-MM-dd'),
      appointment_time: selectedTime,
      duration: selectedSlot.duration,
    });
    setLoading(false);
    if (error) {
      if (error.message?.includes('idx_appointments_unique_slot')) {
        toast.error(t('reservation.alreadyBooked', 'این زمان قبلاً رزرو شده. لطفاً زمان دیگری انتخاب کنید.'));
      } else {
        toast.error(t('reservation.error', 'خطا در ثبت نوبت'));
      }
    } else {
      toast.success(t('reservation.success', 'نوبت شما با موفقیت ثبت شد'));
      setForm({ name: user ? (profile?.display_name || '') : '', email: user?.email || '', phone: user ? (profile?.phone || '') : '', notes: '' });
      setDate(undefined);
      setSelectedTime('');
    }
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-heading font-bold text-surface-dark-foreground"
          >
            {t('reservation.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-surface-dark-foreground/60"
          >
            {t('reservation.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          {schedules.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground">{t('reservation.noAvailability', 'در حال حاضر امکان رزرو وجود ندارد')}</p>
            </div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid lg:grid-cols-2 gap-10"
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">{t('reservation.date')}</label>
                  <div className="border border-border rounded-xl p-4 bg-card">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => { setDate(d); setSelectedTime(''); }}
                      disabled={(d) => !availableDateCheck(d)}
                      className="mx-auto"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">{t('reservation.time')}</label>
                  {!date ? (
                    <p className="text-sm text-muted-foreground">{t('reservation.selectDateFirst', 'ابتدا تاریخ را انتخاب کنید')}</p>
                  ) : loadingSlots ? (
                    <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t('reservation.noSlots', 'تمام نوبت‌های این روز پر شده')}</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots.map((slot) => (
                        <button key={slot.time} type="button" onClick={() => setSelectedTime(slot.time)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            selectedTime === slot.time
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-border text-foreground hover:border-primary/30'
                          }`}>
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t('reservation.name')}</label>
                  <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t('reservation.email')}</label>
                  <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t('reservation.phone')}</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t('reservation.notes')}</label>
                  <textarea rows={4} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : t('reservation.submit')}
                </button>
              </div>
            </motion.form>
          )}
        </div>
      </section>
    </div>
  );
};

export default Reservation;
