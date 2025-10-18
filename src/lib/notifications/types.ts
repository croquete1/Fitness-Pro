export type NotificationRow = {
  id: string;
  title: string | null;
  body?: string | null;
  href?: string | null;
  read: boolean;
  type: string | null;
  created_at: string | null;
};

export type NotificationSnapshot = {
  read: boolean;
  type: string | null;
  created_at: string | null;
};

export type NotificationTimelinePoint = {
  date: string;
  sent: number;
  read: number;
};

export type NotificationCategoryStat = {
  type: string;
  label: string;
  total: number;
  unread: number;
  percentage: number;
  readRate: number;
  tone: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
};

export type NotificationDashboardMetrics = {
  supabase: boolean;
  total: number;
  unread: number;
  delivered7d: number;
  delivered7dDelta: number | null;
  readRate7d: number;
  averagePerDay14d: number;
  lastDeliveryAt: string | null;
  busiestHourLabel: string | null;
  timeline: NotificationTimelinePoint[];
  categories: NotificationCategoryStat[];
};

export type NotificationDashboardData = {
  initialRows: NotificationRow[];
  initialTotal: number;
  metrics: NotificationDashboardMetrics;
};
