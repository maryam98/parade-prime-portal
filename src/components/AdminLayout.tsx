import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Settings as SettingsIcon, FileText, Package, Image, MessageSquare,
  CalendarDays, Users, Layers, Menu, HelpCircle, LogOut, ExternalLink, ChevronRight, Bell
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
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
    { path: '/admin/faq', label: 'FAQ', icon: HelpCircle },
    { path: '/admin/settings', label: t('admin.settings'), icon: SettingsIcon },
  ];

  const isActive = (path: string) => location.pathname === path;
  const currentPage = menuItems.find(m => isActive(m.path));

  // Unread messages count for badge
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['admin-unread-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('read', false);
      if (error) throw error;
      return count ?? 0;
    },
    refetchInterval: 30000,
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = profile?.display_name || user?.email || 'Admin';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-40 w-64 bg-card border-r border-border flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-border shrink-0">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">P</span>
            </div>
            <span className="text-lg font-heading font-bold text-card-foreground">
              Paradaim <span className="text-primary text-sm font-normal">Admin</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
                isActive(item.path)
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted/50'
              }`}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" style={{ width: 18, height: 18 }} />
              <span className="flex-1">{item.label}</span>
              {item.path === '/admin/messages' && unreadCount > 0 && (
                <span className={`min-w-[20px] h-5 flex items-center justify-center rounded-full text-[11px] font-semibold px-1.5 ${
                  isActive(item.path) ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary text-primary-foreground'
                }`}>
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom: Back to site */}
        <div className="p-3 border-t border-border shrink-0">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-card-foreground hover:bg-muted/50 transition-colors"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            <span>Back to Website</span>
          </Link>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Content */}
      <div className={`flex-1 flex flex-col min-h-screen ${isRtl ? 'mr-0 lg:mr-64' : 'ml-0 lg:ml-64'}`}>
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground">
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb */}
            <nav className="hidden sm:flex items-center gap-1.5 text-sm">
              <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">Admin</Link>
              {currentPage && currentPage.path !== '/admin' && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <span className="text-foreground font-medium">{currentPage.label}</span>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Link
              to="/admin/messages"
              className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
              )}
            </Link>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 p-1.5 pr-3 rounded-lg hover:bg-muted transition-colors outline-none">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                    {initials}
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">{displayName}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <Users className="h-4 w-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/')}>
                  <ExternalLink className="h-4 w-4 mr-2" /> View Site
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
