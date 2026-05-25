import { memo } from 'react';
import { ExternalLink, Star, GitFork, TrendingUp, Bookmark } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';
import { RANK_COLORS, DEFAULT_RANK_COLOR, getLanguageColor } from '@/lib/constants';
import type { TrendingProject } from '@/types';

interface ProjectCardProps {
  project: TrendingProject;
  index: number;
  isBookmarked?: boolean;
  onToggleBookmark?: (fullName: string) => void;
}

export const ProjectCard = memo(function ProjectCard({ project, index, isBookmarked, onToggleBookmark }: ProjectCardProps) {
  const rankColor = RANK_COLORS[project.rank] || DEFAULT_RANK_COLOR;

  return (
    <a href={project.url} target="_blank" rel="noopener noreferrer" className="block group">
      <Card
        className="animate-fade-in border-border/30 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 cursor-pointer overflow-hidden relative"
        style={{
          animationDelay: `${index * 60}ms`,
          animationFillMode: 'backwards',
        }}
      >
        {/* Rank badge - top left */}
        <div className="absolute top-0 left-0">
          <div
            className={`w-10 h-10 rounded-br-xl bg-gradient-to-br ${rankColor} flex items-center justify-center text-xs font-bold shadow-lg`}
          >
            #{project.rank}
          </div>
        </div>

        {/* Bookmark button - top right */}
        {onToggleBookmark && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleBookmark(project.fullName);
            }}
            className="absolute top-2 right-2 z-10 p-1.5 rounded-full hover:bg-secondary/80 transition-all duration-200"
            title={isBookmarked ? '取消收藏' : '收藏'}
          >
            <Bookmark
              className={`w-4 h-4 transition-colors duration-200 ${
                isBookmarked
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-muted-foreground hover:text-amber-400'
              }`}
            />
          </button>
        )}

        <div className="p-5 pl-12 sm:p-6 sm:pl-14">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-semibold truncate group-hover:text-primary transition-colors duration-300">
                <span className="text-muted-foreground font-normal">
                  {project.owner}/
                </span>
                {project.name}
              </h3>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary shrink-0 mt-0.5 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>

          {/* Description */}
          {project.description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
              {project.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Language */}
            {project.language !== 'Unknown' && (
              <Badge variant="secondary" className="gap-1.5 text-xs">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getLanguageColor(project.language) }}
                />
                {project.language}
              </Badge>
            )}

            {/* Stars total */}
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="w-3.5 h-3.5" />
              {formatNumber(project.totalStars)}
            </span>

            {/* Stars this period */}
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              +{formatNumber(project.starsThisPeriod)} this week
            </span>

            {/* Forks */}
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <GitFork className="w-3.5 h-3.5" />
              {formatNumber(project.forks)}
            </span>
          </div>

          {/* Contributors */}
          {project.contributors.length > 0 && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
              <span className="text-xs text-muted-foreground">Built by</span>
              <div className="flex -space-x-1.5">
                {project.contributors.slice(0, 5).map((name) => (
                  <div
                    key={name}
                    className="w-5 h-5 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-[8px] font-medium text-muted-foreground"
                    title={name}
                  >
                    {name.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </a>
  );
});
