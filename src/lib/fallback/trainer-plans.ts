import { buildTrainerPlansDashboard } from '@/lib/trainer/plans/dashboard';
import type { TrainerPlanRecord, TrainerPlansDashboardData } from '@/lib/trainer/plans/types';

export function getTrainerPlansFallback(_trainerId: string): TrainerPlansDashboardData {
  return buildTrainerPlansDashboard([], { supabase: false });
}

export function getTrainerPlanRowsFallback(_trainerId: string): TrainerPlanRecord[] {
  return [];
}
