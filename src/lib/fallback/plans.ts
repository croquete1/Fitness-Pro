import { buildClientPlansDashboard } from '@/lib/plans/dashboard';
import type { ClientPlan, PlansDashboardData } from '@/lib/plans/types';

export function getClientPlansFallback(): PlansDashboardData {
  return buildClientPlansDashboard([], { supabase: false });
}

export function getClientPlansRowsFallback(): ClientPlan[] {
  return [];
}
