import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'fa';

  return (
    <footer dir={isRtl ? 'rtl' : 'ltr'} className="bg-accent text-accent-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Paradaim" className="h-8 w-8" />
              <span className="text-lg font-heading font-bold">Paradaim</span>
            </div>
            <p className="text-sm text-accent-foreground/60 leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold">{t('footer.quickLinks')}</h4>
            <nav className="flex flex-col gap-2">
              {[
                { path: '/about', label: t('nav.about') },
                { path: '/services', label: t('nav.services') },
                { path: '/blog', label: t('nav.blog') },
                { path: '/products', label: t('nav.products') },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-sm text-accent-foreground/60 hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold">{t('footer.contactInfo')}</h4>
            <div className="space-y-2 text-sm text-accent-foreground/60">
              <p>info@paradaim.com</p>
              <p>+49 123 456 789</p>
              <p>{t('contact.addressText')}</p>
            </div>
          </div>

          {/* Follow */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold">{t('footer.followUs')}</h4>
            <div className="flex gap-3">
              {['LinkedIn', 'GitHub', 'Twitter'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="px-3 py-1.5 text-xs rounded-md border border-accent-foreground/20 text-accent-foreground/60 hover:text-primary hover:border-primary transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-accent-foreground/10 text-center text-sm text-accent-foreground/40">
          © {new Date().getFullYear()} Paradaim. {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
