import { buildTrainerLibraryDashboard } from '@/lib/trainer/library/dashboard';
import type {
  TrainerLibraryDashboardData,
  TrainerLibraryExerciseRecord,
} from '@/lib/trainer/library/types';

export function getTrainerLibraryRecordsFallback(
  _trainerId: string,
): TrainerLibraryExerciseRecord[] {
  return [];
}

export function getTrainerLibraryGlobalFallback(): TrainerLibraryExerciseRecord[] {
  return [];
}

export function getTrainerLibraryDashboardFallback(
  trainerId: string,
): TrainerLibraryDashboardData {
  const records = getTrainerLibraryRecordsFallback(trainerId);
  return buildTrainerLibraryDashboard(records, { supabase: false });
}
