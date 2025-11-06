import { buildBillingDashboard } from '../billing/dashboard';
import type { BillingDashboardData } from '../billing/types';

/**
 * Fallback neutro para o dashboard de faturação. Sempre que o Supabase não
 * estiver disponível devolvemos um payload vazio para evitar métricas
 * fictícias.
 */
export function getBillingDashboardFallback(_viewerName?: string | null): BillingDashboardData {
  return buildBillingDashboard([], { now: new Date() });
}
