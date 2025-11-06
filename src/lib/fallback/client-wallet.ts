import type { ClientWalletDashboardData } from '@/lib/client/wallet/types';
import { buildClientWalletDashboard } from '@/lib/client/wallet/dashboard';

export function getClientWalletFallback(_userId: string, rangeDays = 30): ClientWalletDashboardData {
  const now = new Date();

  return buildClientWalletDashboard({
    now,
    rangeDays,
    wallet: null,
    entries: [],
  });
}
