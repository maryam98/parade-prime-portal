import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

export const usePageContent = (pageSlug: string) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const { data: sections = {}, isLoading } = useQuery({
    queryKey: ['page-content', pageSlug, lang],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_contents')
        .select('section_key, content')
        .eq('page_slug', pageSlug)
        .eq('language', lang);
      if (error) throw error;
      const map: Record<string, string> = {};
      data?.forEach(row => { map[row.section_key] = row.content; });
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });

  const get = (key: string, fallback = '') => sections[key] || fallback;

  return { sections, get, isLoading };
};
