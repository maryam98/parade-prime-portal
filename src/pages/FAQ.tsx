import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

const FAQ = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'fa';
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const faqs = i18n.language === 'fa' ? [
    { q: 'خدمات شما شامل چه مواردی می‌شود؟', a: 'ما خدمات طراحی وب، توسعه نرم‌افزار، مشاوره دیجیتال و پشتیبانی فنی ارائه می‌دهیم.' },
    { q: 'چگونه می‌توانم رزرو کنم؟', a: 'از طریق صفحه رزرو در سایت می‌توانید تاریخ و ساعت مورد نظر خود را انتخاب کنید.' },
    { q: 'هزینه خدمات چقدر است؟', a: 'هزینه‌ها بسته به نوع پروژه متفاوت است. برای دریافت قیمت دقیق با ما تماس بگیرید.' },
    { q: 'آیا پشتیبانی پس از تحویل پروژه ارائه می‌دهید؟', a: 'بله، ما پشتیبانی فنی و نگهداری را پس از تحویل پروژه ارائه می‌دهیم.' },
    { q: 'مدت زمان تحویل پروژه چقدر است؟', a: 'زمان تحویل بسته به پیچیدگی پروژه بین ۲ تا ۸ هفته متغیر است.' },
    { q: 'آیا امکان لغو رزرو وجود دارد؟', a: 'بله، شما می‌توانید تا ۲۴ ساعت قبل از زمان رزرو آن را لغو کنید.' },
  ] : i18n.language === 'de' ? [
    { q: 'Welche Dienstleistungen bieten Sie an?', a: 'Wir bieten Webdesign, Softwareentwicklung, digitale Beratung und technischen Support an.' },
    { q: 'Wie kann ich eine Reservierung vornehmen?', a: 'Über unsere Reservierungsseite können Sie Ihr gewünschtes Datum und Uhrzeit auswählen.' },
    { q: 'Wie viel kosten Ihre Dienstleistungen?', a: 'Die Kosten variieren je nach Projekttyp. Kontaktieren Sie uns für ein genaues Angebot.' },
    { q: 'Bieten Sie Support nach der Projektübergabe?', a: 'Ja, wir bieten technischen Support und Wartung nach der Projektübergabe an.' },
    { q: 'Wie lange dauert die Projektlieferung?', a: 'Die Lieferzeit variiert je nach Projektkomplexität zwischen 2 und 8 Wochen.' },
    { q: 'Kann ich eine Reservierung stornieren?', a: 'Ja, Sie können bis zu 24 Stunden vor dem Reservierungstermin stornieren.' },
  ] : [
    { q: 'What services do you offer?', a: 'We offer web design, software development, digital consulting, and technical support.' },
    { q: 'How can I make a reservation?', a: 'You can select your preferred date and time through our reservation page.' },
    { q: 'How much do your services cost?', a: 'Costs vary depending on the project type. Contact us for an accurate quote.' },
    { q: 'Do you provide post-delivery support?', a: 'Yes, we provide technical support and maintenance after project delivery.' },
    { q: 'How long does project delivery take?', a: 'Delivery time varies between 2 to 8 weeks depending on project complexity.' },
    { q: 'Can I cancel a reservation?', a: 'Yes, you can cancel up to 24 hours before the scheduled reservation time.' },
  ];

  const labels = {
    title: isRtl ? 'سوالات متداول' : i18n.language === 'de' ? 'Häufig gestellte Fragen' : 'Frequently Asked Questions',
    subtitle: isRtl ? 'پاسخ سوالات رایج شما' : i18n.language === 'de' ? 'Antworten auf Ihre häufigsten Fragen' : 'Answers to your most common questions',
    search: isRtl ? 'جستجو در سوالات...' : i18n.language === 'de' ? 'Fragen durchsuchen...' : 'Search questions...',
    noResults: isRtl ? 'سوالی یافت نشد' : i18n.language === 'de' ? 'Keine Fragen gefunden' : 'No questions found',
    contact: isRtl ? 'سوال دیگری دارید؟' : i18n.language === 'de' ? 'Haben Sie weitere Fragen?' : 'Still have questions?',
    contactBtn: isRtl ? 'تماس با ما' : i18n.language === 'de' ? 'Kontaktieren Sie uns' : 'Contact Us',
  };

  const filtered = search.trim()
    ? faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
    : faqs;

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-heading font-bold text-surface-dark-foreground">
            {labels.title}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="mt-4 text-surface-dark-foreground/60">
            {labels.subtitle}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mt-8 max-w-lg mx-auto relative">
            <Search className="absolute top-3.5 left-4 h-5 w-5 text-muted-foreground pointer-events-none" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={labels.search}
              className="w-full pl-12 pr-10 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-lg" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute top-3.5 right-4 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">{labels.noResults}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((faq, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-border bg-card overflow-hidden">
                  <button onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left">
                    <span className="font-medium text-card-foreground pr-4">{faq.q}</span>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} />
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: openIndex === i ? 'auto' : 0, opacity: openIndex === i ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden">
                    <p className="px-6 pb-5 text-muted-foreground leading-relaxed">{faq.a}</p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-16 text-center p-10 rounded-2xl border border-border bg-card">
            <h3 className="text-xl font-heading font-semibold text-card-foreground">{labels.contact}</h3>
            <a href="/contact"
              className="mt-4 inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
              {labels.contactBtn}
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
