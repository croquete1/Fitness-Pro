import { buildTrainerDashboard } from '@/lib/trainer/dashboard/dashboard';
import {
  type TrainerDashboardResponse,
  type TrainerDashboardSource,
} from '@/lib/trainer/dashboard/types';

export function getTrainerDashboardFallback(
  trainerId: string,
  trainerName: string | null = 'Treinador',
): TrainerDashboardResponse {
  const now = new Date();

  const source: TrainerDashboardSource = {
    trainerId,
    trainerName,
    now,
    clients: [],
    sessions: [],
    plans: [],
    approvals: [],
  };

  const data = buildTrainerDashboard(source, { supabase: false });
  return { ...data, source: 'fallback' };
}
