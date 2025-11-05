import { buildNotificationDashboardMetrics } from '@/lib/notifications/dashboard';
import type { NotificationDashboardData } from '@/lib/notifications/types';

type ListFallbackParams = {
  status: 'all' | 'unread' | 'read';
  type?: string | null;
  search?: string | null;
  page: number;
  pageSize: number;
};

export function getNotificationsDashboardFallback(): NotificationDashboardData {
  const metrics = buildNotificationDashboardMetrics([], {
    total: 0,
    unread: 0,
    lastDeliveryAt: null,
    supabase: false,
  });

  return {
    initialRows: [],
    initialTotal: 0,
    metrics,
  };
}

export function getNotificationsListFallback(_params: ListFallbackParams) {
  return {
    items: [],
    total: 0,
    counts: { all: 0, unread: 0, read: 0 },
    generatedAt: new Date().toISOString(),
    types: [],
  };
}
