import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { apiRequest } from '@/lib/api';
import type { Article } from '@/lib/news';

export const feedNames = ['Lobsters', 'Hacker News', 'The Verge'];

type NewsContextValue = {
  articles: Article[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const NewsContext = createContext<NewsContextValue | undefined>(undefined);

export function NewsProvider({ children }: PropsWithChildren) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiRequest<{ articles: Article[] }>('/api/news', { auth: false });
      setArticles(result.articles);
      if (!result.articles.length) setError('No pudimos leer las fuentes. Inténtalo otra vez.');
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'No pudimos cargar las noticias.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(() => ({ articles, isLoading, error, refresh }), [articles, isLoading, error, refresh]);
  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
}

export function useNews() {
  const context = useContext(NewsContext);
  if (!context) throw new Error('useNews debe usarse dentro de NewsProvider.');
  return context;
}
