import { buildTrainerWorkoutsDashboard } from '@/lib/trainer/workouts/dashboard';
import type { TrainerWorkoutRecord, TrainerWorkoutsDashboardData } from '@/lib/trainer/workouts/types';

export function getTrainerWorkoutsFallback(_trainerId: string): TrainerWorkoutsDashboardData {
  return buildTrainerWorkoutsDashboard([], { supabase: false });
}

export function getTrainerWorkoutRecordsFallback(
  _trainerId: string,
): TrainerWorkoutRecord[] {
  return [];
}
