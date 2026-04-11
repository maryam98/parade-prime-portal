import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Edit, Trash2 } from 'lucide-react';

const AdminArticles = () => {
  const { t } = useTranslation();

  const articles = [
    { id: 1, title: 'Building Scalable Web Applications', category: 'Development', date: '2026-03-15', status: 'Published' },
    { id: 2, title: 'The Future of AI in Software', category: 'Technology', date: '2026-03-10', status: 'Published' },
    { id: 3, title: 'Cloud Migration Strategies', category: 'Cloud', date: '2026-03-05', status: 'Draft' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.articles')}</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> Add Article
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Title</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Category</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Date</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Status</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 text-card-foreground font-medium">{a.title}</td>
                  <td className="px-5 py-3 text-muted-foreground">{a.category}</td>
                  <td className="px-5 py-3 text-muted-foreground">{a.date}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      a.status === 'Published' ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Edit className="h-4 w-4" /></button>
                      <button className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminArticles;
