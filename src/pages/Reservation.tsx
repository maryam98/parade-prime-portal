import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';

const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

const Reservation = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'fa';
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
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
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-2 gap-10"
          >
            {/* Calendar & Time */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">{t('reservation.date')}</label>
                <div className="border border-border rounded-xl p-4 bg-card">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d < new Date() || d.getDay() === 0}
                    className="mx-auto"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">{t('reservation.time')}</label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        selectedTime === time
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-foreground hover:border-primary/30'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t('reservation.name')}</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t('reservation.email')}</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t('reservation.phone')}</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t('reservation.notes')}</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                {submitted ? t('reservation.success') : t('reservation.submit')}
              </button>
            </div>
          </motion.form>
        </div>
      </section>
    </div>
  );
};

export default Reservation;
