import { buildMessagesDashboard } from '@/lib/messages/dashboard';
import type { MessagesDashboardData } from '@/lib/messages/types';

/**
 * Fallback neutro para o dashboard de mensagens quando não há dados reais.
 */
export function getMessagesDashboardFallback(
  viewerId: string,
  rangeDays = 14,
): MessagesDashboardData {
  return buildMessagesDashboard([], { viewerId, rangeDays });
}

export const fallbackMessagesDashboard = getMessagesDashboardFallback('viewer-demo');
