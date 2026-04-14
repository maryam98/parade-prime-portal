import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, FileText, ShoppingBag, Wrench, HelpCircle, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'product' | 'service' | 'article' | 'faq';
  path: string;
}

const typeIcons = {
  product: ShoppingBag,
  service: Wrench,
  article: FileText,
  faq: HelpCircle,
};

const GlobalSearch = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language === 'fa';
  const [query, setQuery] = useState('');

  const labels = {
    placeholder: isRtl ? 'جستجو در سایت...' : i18n.language === 'de' ? 'Auf der Seite suchen...' : 'Search the site...',
    noResults: isRtl ? 'نتیجه‌ای یافت نشد' : i18n.language === 'de' ? 'Keine Ergebnisse' : 'No results found',
    typeHint: isRtl ? 'عبارتی تایپ کنید...' : i18n.language === 'de' ? 'Suchbegriff eingeben...' : 'Type to search...',
    product: isRtl ? 'محصول' : i18n.language === 'de' ? 'Produkt' : 'Product',
    service: isRtl ? 'خدمت' : i18n.language === 'de' ? 'Dienst' : 'Service',
    article: isRtl ? 'مقاله' : i18n.language === 'de' ? 'Artikel' : 'Article',
    faq: isRtl ? 'سوال متداول' : 'FAQ',
  };

  const typeLabels: Record<string, string> = {
    product: labels.product,
    service: labels.service,
    article: labels.article,
    faq: labels.faq,
  };

  // Fetch all searchable data
  const { data: products = [] } = useQuery({
    queryKey: ['global-search-products'],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('id, name, description').eq('status', 'Active');
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: services = [] } = useQuery({
    queryKey: ['global-search-services'],
    queryFn: async () => {
      const { data } = await supabase.from('services').select('id, title, description').eq('status', 'Active');
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: articles = [] } = useQuery({
    queryKey: ['global-search-articles'],
    queryFn: async () => {
      const { data } = await supabase.from('articles').select('id, title, excerpt').eq('status', 'Published');
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: faqs = [] } = useQuery({
    queryKey: ['global-search-faqs'],
    queryFn: async () => {
      const { data } = await supabase.from('faqs').select('id, question, answer').eq('status', 'Active');
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Build unified search index
  const allItems: SearchResult[] = useMemo(() => [
    ...products.map(p => ({ id: p.id, title: p.name, description: p.description || '', type: 'product' as const, path: '/products' })),
    ...services.map(s => ({ id: s.id, title: s.title, description: s.description || '', type: 'service' as const, path: '/services' })),
    ...articles.map(a => ({ id: a.id, title: a.title, description: a.excerpt || '', type: 'article' as const, path: `/blog/${a.id}` })),
    ...faqs.map(f => ({ id: f.id, title: f.question, description: f.answer || '', type: 'faq' as const, path: '/faq' })),
  ], [products, services, articles, faqs]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allItems.filter(item =>
      item.title.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [allItems, query]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    onOpenChange(false);
    setQuery('');
  };

  // Keyboard shortcut Cmd/Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  // Reset query when closing
  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={isRtl ? 'rtl' : 'ltr'}
        className="sm:max-w-lg p-0 gap-0 overflow-hidden bg-card border-border [&>button]:hidden"
      >
        {/* Search input */}
        <div className="flex items-center border-b border-border px-4">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.placeholder}
            autoFocus
            className="flex-1 px-3 py-4 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex ms-2 h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto p-2">
          {!query.trim() ? (
            <p className="text-center text-sm text-muted-foreground py-8">{labels.typeHint}</p>
          ) : results.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">{labels.noResults}</p>
          ) : (
            results.map((result) => {
              const Icon = typeIcons[result.type];
              return (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-start hover:bg-muted transition-colors"
                >
                  <div className="mt-0.5 rounded-md bg-primary/10 p-1.5">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                    {result.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{result.description}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5 mt-0.5 shrink-0">
                    {typeLabels[result.type]}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSearch;
