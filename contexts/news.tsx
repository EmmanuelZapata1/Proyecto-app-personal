import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { apiRequest } from '@/lib/api';
import type { Article } from '@/lib/news';

export const feedNames = ['Lobsters', 'Hacker News', 'The Verge'];

type NewsContextValue = {
  articles: Article[];
  /** Artículos publicados en las últimas 24 h. */
  recentCount: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

function fetchArticles() {
  return apiRequest<{ articles: Article[] }>('/api/news', { auth: false });
}

function errorMessage(exception: unknown) {
  return exception instanceof Error ? exception.message : 'No pudimos cargar las noticias.';
}

const NewsContext = createContext<NewsContextValue | undefined>(undefined);

export function NewsProvider({ children }: PropsWithChildren) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [recentCount, setRecentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyResult = useCallback((result: { articles: Article[] }) => {
    const dayAgo = Date.now() - 86400000;
    setArticles(result.articles);
    setRecentCount(result.articles.filter((article) => article.publishedAt && new Date(article.publishedAt).getTime() >= dayAgo).length);
    setError(result.articles.length ? null : 'No pudimos leer las fuentes. Inténtalo otra vez.');
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      applyResult(await fetchArticles());
    } catch (exception) {
      setError(errorMessage(exception));
    } finally {
      setIsLoading(false);
    }
  }, [applyResult]);

  useEffect(() => {
    let active = true;
    fetchArticles()
      .then((result) => active && applyResult(result))
      .catch((exception: unknown) => active && setError(errorMessage(exception)))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [applyResult]);

  const value = useMemo(() => ({ articles, recentCount, isLoading, error, refresh }), [articles, recentCount, isLoading, error, refresh]);
  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
}

export function useNews() {
  const context = useContext(NewsContext);
  if (!context) throw new Error('useNews debe usarse dentro de NewsProvider.');
  return context;
}
