import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';

const AdminSettings = () => {
  const { t } = useTranslation();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.settings')}</h1>

        <div className="max-w-2xl space-y-6">
          <div className="p-6 rounded-xl border border-border bg-card space-y-4">
            <h2 className="font-heading font-semibold text-card-foreground">General Settings</h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Site Name</label>
              <input
                type="text"
                defaultValue="Paradaim"
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Contact Email</label>
              <input
                type="email"
                defaultValue="info@paradaim.com"
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              {t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
