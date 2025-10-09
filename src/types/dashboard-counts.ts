import type { HeaderCounts } from '@/components/header/HeaderCountsContext';
import type { AdminCounts, ClientCounts } from '@/lib/hooks/useCounts';
import type { PtsCounts } from '@/lib/hooks/usePtsCounts';

export type DashboardCountsSnapshot = {
  header?: Partial<HeaderCounts>;
  admin?: AdminCounts;
  client?: ClientCounts;
  trainer?: PtsCounts;
};
