import { memo } from 'react';
import { ExternalLink, Star, TrendingUp, GitFork } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';
import { RANK_BADGE_COLORS } from '@/lib/constants';
import type { TrendingProject } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface LeaderboardTableProps {
  projects: TrendingProject[];
}

export const LeaderboardTable = memo(function LeaderboardTable({ projects }: LeaderboardTableProps) {
  return (
    <div className="rounded-xl border border-border/40 overflow-hidden animate-scale-in">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-16 text-center">#</TableHead>
            <TableHead>项目</TableHead>
            <TableHead className="hidden md:table-cell">描述</TableHead>
            <TableHead className="hidden sm:table-cell">语言</TableHead>
            <TableHead className="text-right">
              <span className="inline-flex items-center gap-1">
                <Star className="w-3 h-3" /> Stars
              </span>
            </TableHead>
            <TableHead className="text-right">
              <span className="inline-flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> 本周
              </span>
            </TableHead>
            <TableHead className="text-right hidden sm:table-cell">
              <span className="inline-flex items-center gap-1">
                <GitFork className="w-3 h-3" /> Forks
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project, i) => (
            <TableRow
              key={project.fullName}
              className="animate-fade-in-left cursor-pointer"
              style={{
                animationDelay: `${i * 50}ms`,
                animationFillMode: 'backwards',
              }}
              onClick={() => window.open(project.url, '_blank')}
            >
              {/* Rank */}
              <TableCell className="text-center">
                <RankBadge rank={project.rank} />
              </TableCell>

              {/* Name */}
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate max-w-[160px] sm:max-w-[220px]">
                      <span className="text-muted-foreground font-normal">
                        {project.owner}/
                      </span>
                      {project.name}
                    </p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-muted-foreground/30 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </TableCell>

              {/* Description */}
              <TableCell className="hidden md:table-cell">
                <p className="text-xs text-muted-foreground line-clamp-1 max-w-[280px]">
                  {project.description || '暂无描述'}
                </p>
              </TableCell>

              {/* Language */}
              <TableCell className="hidden sm:table-cell">
                {project.language !== 'Unknown' ? (
                  <Badge variant="secondary" className="text-xs whitespace-nowrap">
                    {project.language}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </TableCell>

              {/* Total Stars */}
              <TableCell className="text-right">
                <span className="text-sm font-medium tabular-nums">
                  {formatNumber(project.totalStars)}
                </span>
              </TableCell>

              {/* Stars this week */}
              <TableCell className="text-right">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-400 tabular-nums">
                  +{formatNumber(project.starsThisPeriod)}
                </span>
              </TableCell>

              {/* Forks */}
              <TableCell className="text-right hidden sm:table-cell">
                <span className="text-sm text-muted-foreground tabular-nums">
                  {formatNumber(project.forks)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold border ${
        RANK_BADGE_COLORS[rank] || 'text-muted-foreground border-transparent bg-secondary'
      }`}
    >
      {rank}
    </span>
  );
}
