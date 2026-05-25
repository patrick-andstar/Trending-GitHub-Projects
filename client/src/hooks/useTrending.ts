import { useState, useEffect, useCallback, useRef } from 'react';
import type { TrendingProject, TrendingStats, TrendingResponse, LanguageData } from '@/types';

const API_BASE = 'https://github-trending-api-261916-9-1436658920.sh.run.tcloudbase.com/api';

export function useTrending() {
  const [projects, setProjects] = useState<TrendingProject[]>([]);
  const [stats, setStats] = useState<TrendingStats | null>(null);
  const [languages, setLanguages] = useState<LanguageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [period, setPeriod] = useState<string>('weekly');
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(
    async (options: {
      period?: string;
      force?: boolean;
    } = {}) => {
      const p = options.period ?? period;
      const force = options.force ?? false;

      // Update period state if changing
      if (options.period && options.period !== period) {
        setPeriod(options.period);
      }

      // Cancel previous request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        // Trending data now includes inline stats for atomic consistency
        const url = new URL(`${API_BASE}/trending`);
        url.searchParams.set('period', p);
        if (force) {
          url.searchParams.set('force', 'true');
        }

        const [trendingRes, languagesRes] = await Promise.all([
          fetch(url.toString(), { signal: abortRef.current.signal }),
          fetch(`${API_BASE}/trending/languages?period=${p}`, {
            signal: abortRef.current.signal,
          }),
        ]);

        if (!trendingRes.ok) throw new Error('Failed to fetch trending data');

        const trendingData: TrendingResponse = await trendingRes.json();
        const languagesData: { success: boolean; languages: LanguageData[] } =
          await languagesRes.json();

        if (trendingData.success) {
          setProjects(trendingData.data);
          setLastUpdated(trendingData.timestamp || Date.now());
          if (trendingData.stats) {
            setStats(trendingData.stats);
          }
        }

        if (languagesData.success) {
          setLanguages(languagesData.languages);
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    },
    [period]
  );

  // Initial fetch on mount
  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Dedicated refresh always forces a fresh scrape
  const forceRefresh = useCallback(() => {
    fetchData({ period, force: true });
  }, [fetchData, period]);

  // Period change — uses cache for that period (falls back if expired)
  const changePeriod = useCallback(
    (newPeriod: string) => {
      fetchData({ period: newPeriod, force: false });
    },
    [fetchData]
  );

  return {
    projects,
    stats,
    languages,
    loading,
    error,
    lastUpdated,
    period,
    forceRefresh,
    changePeriod,
  };
}
