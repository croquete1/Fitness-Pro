import { buildClientDashboard } from '@/lib/client/dashboard/dashboard';
import type { ClientDashboardData, ClientDashboardSource } from '@/lib/client/dashboard/types';

export function getClientDashboardFallback(_clientId: string, rangeDays = 30): ClientDashboardData {
  const now = new Date();

  const source: ClientDashboardSource = {
    now,
    rangeDays,
    plans: [],
    sessions: [],
    measurements: [],
    notifications: [],
    wallet: null,
    walletEntries: [],
    trainerNames: {},
  };

  return buildClientDashboard(source);
}
