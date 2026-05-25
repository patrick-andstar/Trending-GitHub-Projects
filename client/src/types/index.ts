export interface TrendingProject {
  rank: number;
  owner: string;
  name: string;
  fullName: string;
  url: string;
  description: string;
  language: string;
  totalStars: number;
  forks: number;
  starsThisPeriod: number;
  contributors: string[];
}

export interface TrendingResponse {
  success: boolean;
  data: TrendingProject[];
  stats?: TrendingStats;
  cached: boolean;
  timestamp: number;
  source: string;
  age: number;
  stale?: boolean;
  fallback?: boolean;
  error?: string;
}

export interface StatsResponse {
  success: boolean;
  stats: TrendingStats;
}

export interface TrendingStats {
  totalProjects: number;
  totalStarsThisWeek: number;
  avgStarsPerProject: number;
  topLanguage: string;
  topLanguageCount: number;
  languageDistribution: Record<string, number>;
  lastUpdated: number;
}

export interface LanguageData {
  name: string;
  count: number;
}
