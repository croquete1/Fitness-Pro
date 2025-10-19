import { getClientPlansRowsFallback } from '@/lib/fallback/plans';
import type { ClientPlanDayItem } from '@/lib/client/plans/overview/types';
import { buildClientPlanOverview } from '@/lib/client/plans/overview/builder';

const FALLBACK_DAY_ITEMS: ClientPlanDayItem[] = [
  { planId: 'plan-neo-001', dayIndex: 0, exerciseId: 'squat' },
  { planId: 'plan-neo-001', dayIndex: 0, exerciseId: 'deadlift' },
  { planId: 'plan-neo-001', dayIndex: 2, exerciseId: 'press' },
  { planId: 'plan-neo-001', dayIndex: 4, exerciseId: 'row' },
  { planId: 'plan-neo-002', dayIndex: 1, exerciseId: 'run' },
  { planId: 'plan-neo-002', dayIndex: 3, exerciseId: 'bike' },
  { planId: 'plan-neo-002', dayIndex: 5, exerciseId: 'core' },
  { planId: 'plan-neo-003', dayIndex: 2, exerciseId: 'mobility' },
  { planId: 'plan-neo-003', dayIndex: 5, exerciseId: 'swim' },
  { planId: 'plan-neo-004', dayIndex: 1, exerciseId: 'hip-thrust' },
  { planId: 'plan-neo-004', dayIndex: 1, exerciseId: 'leg-press' },
  { planId: 'plan-neo-004', dayIndex: 1, exerciseId: 'split-squat' },
  { planId: 'plan-neo-005', dayIndex: 6, exerciseId: 'recovery-walk' },
  { planId: 'plan-neo-006', dayIndex: 0, exerciseId: 'plank' },
  { planId: 'plan-neo-006', dayIndex: 2, exerciseId: 'superman' },
  { planId: 'plan-neo-006', dayIndex: 4, exerciseId: 'bird-dog' },
  { planId: 'plan-neo-007', dayIndex: 5, exerciseId: 'trail-run' },
  { planId: 'plan-neo-007', dayIndex: 2, exerciseId: 'hill-sprints' },
  { planId: 'plan-neo-007', dayIndex: 3, exerciseId: 'strength-support' },
  { planId: 'plan-neo-008', dayIndex: 6, exerciseId: 'mobility' },
  { planId: 'plan-neo-008', dayIndex: 1, exerciseId: 'tempo-run' },
];

export function getClientPlanOverviewFallback(rangeDays?: number) {
  const plans = getClientPlansRowsFallback();
  return buildClientPlanOverview(plans, FALLBACK_DAY_ITEMS, { fallback: true, rangeDays });
}
