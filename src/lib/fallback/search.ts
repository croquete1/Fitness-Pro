import { buildSearchDashboard } from '@/lib/search/dashboard';
import type {
  SearchDashboardData,
  SearchResultType,
  SearchCollectionInput,
} from '@/lib/search/types';

const LABEL_BY_TYPE: Record<SearchResultType, string> = {
  users: 'Utilizadores',
  plans: 'Planos',
  exercises: 'Exercícios',
  sessions: 'Sessões',
};

export function getSearchDashboardFallback(opts: {
  query?: string;
  types?: SearchResultType[];
} = {}): SearchDashboardData {
  const query = opts.query?.trim() ?? '';
  const activeTypes: SearchResultType[] = opts.types?.length
    ? opts.types
    : ['users', 'plans', 'exercises', 'sessions'];

  const collections: SearchCollectionInput[] = activeTypes.map((type) => ({
    type,
    label: LABEL_BY_TYPE[type],
    total: 0,
    offset: 0,
    limit: 0,
    rows: [],
  }));

  return buildSearchDashboard({
    query,
    collections,
    fallback: true,
    now: new Date(),
    suggestions: [],
    trending: [],
  });
}
