import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/logo.png';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
  { code: 'fa', label: 'فا' },
];

const Header = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const isRtl = i18n.language === 'fa';

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/about', label: t('nav.about') },
    { path: '/services', label: t('nav.services') },
    { path: '/blog', label: t('nav.blog') },
    { path: '/products', label: t('nav.products') },
    { path: '/contact', label: t('nav.contact') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header dir={isRtl ? 'rtl' : 'ltr'} className="fixed top-0 left-0 right-0 z-50 bg-accent/95 backdrop-blur-md border-b border-border/10">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Paradaim" className="h-9 w-9" />
          <span className="text-xl font-heading font-bold text-accent-foreground">Paradaim</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'text-primary'
                  : 'text-accent-foreground/70 hover:text-accent-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-accent-foreground/70 hover:text-accent-foreground transition-colors"
            >
              <Globe className="h-4 w-4" />
              {languages.find(l => l.code === i18n.language)?.label || 'EN'}
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full mt-1 right-0 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        i18n.changeLanguage(lang.code);
                        document.documentElement.dir = lang.code === 'fa' ? 'rtl' : 'ltr';
                        setLangOpen(false);
                      }}
                      className={`block w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors ${
                        i18n.language === lang.code ? 'text-primary font-medium' : 'text-foreground'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/reservation"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {t('nav.reservation')}
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 border border-accent-foreground/20 text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent-foreground/10 transition-colors"
          >
            {t('nav.login')}
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden text-accent-foreground"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-accent border-t border-border/10 overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(item.path) ? 'text-primary' : 'text-accent-foreground/70'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex gap-2 pt-2 border-t border-border/10">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      i18n.changeLanguage(lang.code);
                      document.documentElement.dir = lang.code === 'fa' ? 'rtl' : 'ltr';
                    }}
                    className={`px-3 py-1.5 rounded text-sm ${
                      i18n.language === lang.code
                        ? 'bg-primary text-primary-foreground'
                        : 'text-accent-foreground/70'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
              <Link
                to="/reservation"
                onClick={() => setMobileOpen(false)}
                className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium text-center"
              >
                {t('nav.reservation')}
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-2 border border-accent-foreground/20 text-accent-foreground rounded-lg text-sm font-medium text-center"
              >
                {t('nav.login')}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
