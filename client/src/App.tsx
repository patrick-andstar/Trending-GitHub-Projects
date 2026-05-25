import { useState, useMemo, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, Sun, Moon, Search, X, Download, BookmarkCheck } from 'lucide-react';
import { Header } from '@/components/Header';
import { StatsOverview } from '@/components/StatsOverview';
import { ProjectCard } from '@/components/ProjectCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { Footer } from '@/components/Footer';
import { LeaderboardTable } from '@/components/Leaderboard';
import { ScrollToTop } from '@/components/ScrollToTop';
import { useTrending } from '@/hooks/useTrending';
import { useBookmarks } from '@/hooks/useBookmarks';

type Period = 'daily' | 'weekly' | 'monthly';

export default function App() {
  const { projects, stats, languages, loading, error, lastUpdated, forceRefresh, changePeriod } = useTrending();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activePeriod, setActivePeriod] = useState<Period>('weekly');
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showBookmarked, setShowBookmarked] = useState(false);

  // ── Bookmarks ─────────────────────────────────────────────
  const { isBookmarked, toggleBookmark, getBookmarkedProjects } = useBookmarks();

  // ── Theme toggle ──────────────────────────────────────────
  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('light', next === 'light');
  }, [theme]);

  // ── Period labels ─────────────────────────────────────────
  const periodLabel: Record<Period, string> = {
    daily: '今日热门',
    weekly: '本周热门',
    monthly: '本月热门',
  };

  // ── Available languages from server ──────────────────────
  const languageOptions = useMemo(
    () => ['all', ...languages.map((l) => l.name)],
    [languages]
  );

  // ── Filter + search ──────────────────────────────────────
  const filteredProjects = useMemo(() => {
    let result = projects;
    if (selectedLang !== 'all') {
      result = result.filter((p) => p.language === selectedLang);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.owner.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [projects, selectedLang, searchQuery]);

  // ── Final display list (filtered or bookmarked) ───────────
  const displayProjects = useMemo(() => {
    return showBookmarked ? getBookmarkedProjects(filteredProjects) : filteredProjects;
  }, [filteredProjects, showBookmarked, getBookmarkedProjects]);

  // ── Export CSV ────────────────────────────────────────────
  const exportCSV = useCallback(() => {
    const headers = ['Rank', 'Project', 'Description', 'Language', 'Stars', 'Forks', 'Weekly Stars', 'URL'];
    const rows = displayProjects.map((p) => [
      p.rank,
      p.fullName,
      `"${(p.description || '').replace(/"/g, '""')}"`,
      p.language,
      p.totalStars,
      p.forks,
      p.starsThisPeriod,
      p.url,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `github-trending-${activePeriod}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [displayProjects, activePeriod]);

  // ── Handle period change ──────────────────────────────────
  const handlePeriodChange = useCallback((v: string) => {
    setActivePeriod(v as Period);
    changePeriod(v);
  }, [changePeriod]);

  // Refresh forces a fresh scrape from GitHub
  const handleRefresh = useCallback(() => {
    forceRefresh();
  }, [forceRefresh]);

  return (
    <div className={`min-h-screen bg-background ${theme === 'light' ? 'light' : ''}`}>
      <Header loading={loading} lastUpdated={lastUpdated} onRefresh={handleRefresh} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Hero Section */}
        <section className="mb-8 mt-4">
          <div className="animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs sm:text-sm font-medium text-primary/70 uppercase tracking-[0.2em] mb-3">
                  Discover Open Source
                </p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                  {periodLabel[activePeriod]}
                  <span className="gradient-text ml-2">开源项目</span>
                </h2>
              </div>

              {/* Theme Toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="shrink-0 rounded-full w-10 h-10"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
            </div>

            <p className="mt-3 text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
              GitHub Trending 精选。发现全球开发者中最受关注的开源项目，
              追踪技术趋势，探索值得贡献的优秀代码库。
            </p>
          </div>
        </section>

        {/* Period Tabs */}
        <section className="mb-6">
          <Tabs value={activePeriod} onValueChange={handlePeriodChange}>
            <TabsList>
              <TabsTrigger value="daily">📅 今日</TabsTrigger>
              <TabsTrigger value="weekly">🔥 本周</TabsTrigger>
              <TabsTrigger value="monthly">🚀 本月</TabsTrigger>
            </TabsList>
          </Tabs>
        </section>

        {/* Stats Overview */}
        <StatsOverview stats={stats} loading={loading} />

        {/* Toolbar: Search + Language Filter + View Toggle */}
        <section>
          <div className="flex flex-wrap items-center gap-3 mb-5">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索项目..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-8 rounded-lg border border-border/50 bg-secondary text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Language Filter */}
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="h-10 px-3 rounded-lg border border-border/50 bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer"
            >
              <option value="all">🌐 全部语言</option>
              {languageOptions.filter((l) => l !== 'all').map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>

            {/* View Toggle */}
            <Tabs
              value={viewMode}
              onValueChange={(v: string) => setViewMode(v as 'grid' | 'table')}
            >
              <TabsList className="h-8">
                <TabsTrigger value="grid" className="h-7 px-2.5">
                  <LayoutGrid className="w-3.5 h-3.5" />
                </TabsTrigger>
                <TabsTrigger value="table" className="h-7 px-2.5">
                  <List className="w-3.5 h-3.5" />
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Bookmark Toggle */}
            <Button
              variant={showBookmarked ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowBookmarked(!showBookmarked)}
              className="h-8 gap-1.5"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span className="text-xs">{showBookmarked ? '全部' : '收藏'}</span>
            </Button>

            {/* Export CSV */}
            <Button
              variant="outline"
              size="sm"
              onClick={exportCSV}
              className="h-8 gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="text-xs">导出</span>
            </Button>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <h3 className="text-base font-semibold tracking-tight">
              {showBookmarked ? '我的收藏' : '项目排行'}
              {!loading && (
                <span className="text-muted-foreground font-normal ml-2">
                  {displayProjects.length} 个项目
                  {showBookmarked && ' · 已收藏'}
                  {selectedLang !== 'all' && ` · ${selectedLang}`}
                  {searchQuery && ` · "${searchQuery}"`}
                </span>
              )}
            </h3>
          </div>

          {/* Content */}
          <Tabs value={viewMode} className="w-full">
            {error && !loading ? (
              <ErrorState message={error} onRetry={handleRefresh} />
            ) : loading ? (
              <LoadingSkeleton />
            ) : displayProjects.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">
                  {showBookmarked ? '暂无收藏项目' : '未找到匹配的项目'}
                </p>
                <p className="text-sm mt-1">
                  {showBookmarked ? '点击卡片右上角的书签图标收藏项目' : '尝试调整搜索条件或清除筛选'}
                </p>
              </div>
            ) : (
              <>
                <TabsContent value="grid" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayProjects.map((project, index) => (
                      <ProjectCard
                        key={project.fullName}
                        project={project}
                        index={index}
                        isBookmarked={isBookmarked(project.fullName)}
                        onToggleBookmark={toggleBookmark}
                      />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="table" className="mt-0">
                  <LeaderboardTable projects={displayProjects} />
                </TabsContent>
              </>
            )}
          </Tabs>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
