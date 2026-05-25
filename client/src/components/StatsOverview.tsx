import { useMemo } from 'react';
import { Star, TrendingUp, Code2, GitFork } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import type { TrendingStats } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#6366f1', '#14b8a6', '#f97316',
];

interface StatsOverviewProps {
  stats: TrendingStats | null;
  loading: boolean;
}

export function StatsOverview({ stats, loading }: StatsOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse-soft">
            <CardContent className="p-5">
              <div className="h-4 w-20 bg-muted rounded mb-3" />
              <div className="h-8 w-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = useMemo(() => [
    {
      label: '热门项目',
      value: stats.totalProjects,
      icon: Code2,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: '本周总 Star',
      value: formatNumber(stats.totalStarsThisWeek),
      icon: Star,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
    {
      label: '平均 Star',
      value: formatNumber(stats.avgStarsPerProject),
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
    },
    {
      label: '最热语言',
      value: stats.topLanguage,
      icon: GitFork,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
  ], [stats.totalProjects, stats.totalStarsThisWeek, stats.avgStarsPerProject, stats.topLanguage]);

  const chartData = useMemo(() =>
    Object.entries(stats.languageDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count })),
    [stats.languageDistribution]
  );

  return (
    <div className="space-y-8 mb-10">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((item, i) => (
          <Card
            key={item.label}
            className="border-border/40 hover:border-border/80 transition-all duration-300 animate-scale-in"
            style={{ animationDelay: `${i * 75}ms`, animationFillMode: 'backwards' }}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {item.label}
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Language Distribution Chart */}
      {chartData.length > 0 && (
        <Card className="border-border/40 animate-scale-in" style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-5 uppercase tracking-widest">
              语言分布
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                  cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={22}>
                  {chartData.map((_, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={COLORS[idx % COLORS.length]}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
