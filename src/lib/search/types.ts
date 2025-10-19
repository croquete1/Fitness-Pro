export type SearchResultType = 'users' | 'plans' | 'exercises' | 'sessions';

export type SearchBadgeTone = 'neutral' | 'primary' | 'positive' | 'warning' | 'danger' | 'info';

export type SearchResultBadge = {
  label: string;
  tone?: SearchBadgeTone;
};

export type SearchResultRecord = {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string | null;
  href: string;
  keywords: string[];
  createdAt: string | null;
  updatedAt: string | null;
  badge?: SearchResultBadge | null;
  meta?: string | null;
};

export type SearchCollectionInput = {
  type: SearchResultType;
  label?: string | null;
  total: number;
  offset: number;
  limit: number;
  rows: SearchResultRecord[];
};

export type SearchTrendInput = {
  term: string;
  count: number;
  lastSearchedAt: string | null;
};

export type SearchDashboardInput = {
  query: string;
  collections: SearchCollectionInput[];
  suggestions?: string[];
  trending?: SearchTrendInput[];
  fallback?: boolean;
  now?: Date | string | number;
};

export type SearchHeroMetric = {
  id: string;
  label: string;
  value: string;
  helper?: string | null;
  tone?: 'primary' | 'positive' | 'warning' | 'neutral';
};

export type SearchHighlight = {
  id: string;
  title: string;
  description: string;
  href: string;
  tone: 'neutral' | 'positive' | 'warning';
  meta?: string | null;
};

export type SearchInsight = {
  id: string;
  title: string;
  description: string;
  icon?: string | null;
  tone?: 'neutral' | 'positive' | 'warning';
};

export type SearchTimelinePoint = {
  iso: string;
  label: string;
  matches: number;
  newItems: number;
};

export type SearchCollectionItem = SearchResultRecord & {
  score: number;
  relevance: string | null;
  activityLabel: string | null;
};

export type SearchCollection = {
  type: SearchResultType;
  label: string;
  total: number;
  nextOffset: number | null;
  items: SearchCollectionItem[];
};

export type SearchTrend = {
  term: string;
  count: number;
  lastSearchedAt: string | null;
};

export type SearchDashboardData = {
  query: string;
  normalizedQuery: string;
  generatedAt: string;
  hero: SearchHeroMetric[];
  highlights: SearchHighlight[];
  insights: SearchInsight[];
  timeline: SearchTimelinePoint[];
  collections: SearchCollection[];
  suggestions: string[];
  trends: SearchTrend[];
  totals: {
    matches: number;
    recent: number;
    firstMatchAt: string | null;
    lastMatchAt: string | null;
  };
  filters: {
    types: Array<{ id: SearchResultType; label: string; total: number }>;
  };
  fallback: boolean;
};
