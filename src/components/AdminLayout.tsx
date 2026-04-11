import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Settings as SettingsIcon, FileText, Package, Image, MessageSquare, CalendarDays, Users,
  Layers, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isRtl = i18n.language === 'fa';

  const menuItems = [
    { path: '/admin', label: t('admin.dashboard'), icon: LayoutDashboard },
    { path: '/admin/services', label: t('admin.services'), icon: Layers },
    { path: '/admin/articles', label: t('admin.articles'), icon: FileText },
    { path: '/admin/products', label: t('admin.products'), icon: Package },
    { path: '/admin/slider', label: t('admin.slider'), icon: Image },
    { path: '/admin/messages', label: t('admin.messages'), icon: MessageSquare },
    { path: '/admin/reservations', label: t('admin.reservations'), icon: CalendarDays },
    { path: '/admin/users', label: t('admin.users'), icon: Users },
    { path: '/admin/settings', label: t('admin.settings'), icon: SettingsIcon },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-40 w-64 bg-accent border-r border-border/10 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border/10">
          <Link to="/admin" className="text-lg font-heading font-bold text-accent-foreground">
            Paradaim <span className="text-primary">Admin</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-accent-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-primary/10 text-primary'
                  : 'text-accent-foreground/60 hover:text-accent-foreground hover:bg-accent-foreground/5'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-accent/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Content */}
      <div className={`flex-1 ${isRtl ? 'mr-0 lg:mr-64' : 'ml-0 lg:ml-64'}`}>
        <header className="h-16 flex items-center px-4 border-b border-border bg-background">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">
            <Menu className="h-6 w-6" />
          </button>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
