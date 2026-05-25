import { useEffect, useState } from 'react';
import { Github, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTimeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  loading: boolean;
  lastUpdated: number | null;
  onRefresh: () => void;
}

export function Header({ loading, lastUpdated, onRefresh }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-background/80 glass border-b border-border/50 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <Github className="w-5 h-5 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-background animate-pulse-soft" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-semibold tracking-tight">
                GitHub Trending
              </h1>
              <p className="text-xs text-muted-foreground">Weekly Top Projects</p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <Badge variant="secondary" className="hidden md:inline-flex gap-1.5">
                <Zap className="w-3 h-3" />
                {formatTimeAgo(lastUpdated)} 更新
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">刷新</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
