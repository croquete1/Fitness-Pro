import { getClientPlansRowsFallback } from '@/lib/fallback/plans';
import { buildClientPlanOverview } from '@/lib/client/plans/overview/builder';

export function getClientPlanOverviewFallback(rangeDays?: number) {
  const plans = getClientPlansRowsFallback();
  return buildClientPlanOverview(plans, [], { fallback: true, rangeDays });
}
