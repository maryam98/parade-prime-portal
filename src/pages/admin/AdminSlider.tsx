import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';
import { Edit, Trash2 } from 'lucide-react';

const AdminSlider = () => {
  const { t } = useTranslation();

  const slides = [
    { id: 1, title: 'Building Digital Solutions', status: 'Active', order: 1 },
    { id: 2, title: 'Innovation in Technology', status: 'Active', order: 2 },
    { id: 3, title: 'Your Growth Partner', status: 'Draft', order: 3 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.slider')}</h1>

        <div className="grid gap-4">
          {slides.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-5 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                  {s.order}
                </span>
                <div>
                  <h3 className="font-medium text-card-foreground">{s.title}</h3>
                  <span className={`text-xs ${s.status === 'Active' ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {s.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Edit className="h-4 w-4" /></button>
                <button className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSlider;
