import { buildTrainerReschedulesDashboard } from '@/lib/trainer/reschedules/dashboard';
import type {
  TrainerAgendaSessionRecord,
  TrainerRescheduleRequestRecord,
  TrainerReschedulesDashboardData,
} from '@/lib/trainer/reschedules/types';

export function getTrainerReschedulesFallback(
  _trainerId: string,
): TrainerReschedulesDashboardData {
  return buildTrainerReschedulesDashboard([], [], { supabase: false });
}

export function getTrainerRescheduleRequestsFallback(
  _trainerId: string,
): TrainerRescheduleRequestRecord[] {
  return [];
}

export function getTrainerAgendaFallback(_trainerId: string): TrainerAgendaSessionRecord[] {
  return [];
}
