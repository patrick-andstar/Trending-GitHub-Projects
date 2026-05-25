// ── Rank badge gradient colors (Gold / Silver / Bronze) ──
export const RANK_COLORS: Record<number, string> = {
  1: 'from-amber-400 to-orange-500 text-amber-100',
  2: 'from-slate-400 to-slate-500 text-slate-100',
  3: 'from-orange-600 to-orange-700 text-orange-100',
};

export const DEFAULT_RANK_COLOR = 'from-zinc-700 to-zinc-800 text-zinc-300';

// ── Rank badge colors for table view ──
export const RANK_BADGE_COLORS: Record<number, string> = {
  1: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  2: 'bg-slate-400/15 text-slate-300 border-slate-400/30',
  3: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
};

// ── Programming language colors ──
const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  PHP: '#4F5D95',
  Vue: '#41b883',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Lua: '#000080',
  Scala: '#c22d40',
  Elixir: '#6e4a7e',
  Haskell: '#5e5086',
  Clojure: '#db5855',
  Erlang: '#B83998',
  R: '#198CE7',
  Zig: '#ec915c',
  Svelte: '#ff3e00',
};

export function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] || '#858585';
}
