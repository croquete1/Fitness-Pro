export type SystemUserRole = 'admin' | 'trainer' | 'client' | 'staff' | 'guest' | 'unknown';
export type SystemUserStatus = 'active' | 'pending' | 'suspended' | 'invited' | 'archived' | 'unknown';

export type SystemUserRecord = {
  id: string;
  role: SystemUserRole;
  status: SystemUserStatus;
  createdAt: string | null;
  lastSeenAt: string | null;
};

export type SystemSessionStatus =
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'missed'
  | 'rescheduled'
  | 'pending'
  | 'draft'
  | 'unknown';

export type SystemSessionRecord = {
  id: string;
  status: SystemSessionStatus;
  scheduledAt: string | null;
  durationMinutes: number | null;
  trainerName: string | null;
  clientName: string | null;
  location: string | null;
};

export type SystemNotificationStatus = 'delivered' | 'failed' | 'pending' | 'scheduled' | 'draft' | 'unknown';

export type SystemNotificationChannel = 'push' | 'email' | 'sms' | 'in-app' | 'webhook' | 'unknown';

export type SystemNotificationRecord = {
  id: string;
  status: SystemNotificationStatus;
  channel: SystemNotificationChannel;
  createdAt: string | null;
  deliveredAt: string | null;
  title: string | null;
  targetName: string | null;
};

export type SystemInvoiceStatus = 'paid' | 'pending' | 'refunded' | 'cancelled' | 'unknown';

export type SystemInvoiceRecord = {
  id: string;
  status: SystemInvoiceStatus;
  amount: number;
  issuedAt: string | null;
  paidAt: string | null;
  clientName: string | null;
};

export type SystemDashboardInput = {
  now: Date;
  rangeDays: number;
  users: SystemUserRecord[];
  sessions: SystemSessionRecord[];
  notifications: SystemNotificationRecord[];
  invoices: SystemInvoiceRecord[];
};

export type SystemHeroMetric = {
  key: string;
  label: string;
  value: string;
  hint?: string;
  trend?: string | null;
  tone?: 'positive' | 'warning' | 'critical' | 'info' | 'neutral';
};

export type SystemTimelinePoint = {
  iso: string;
  label: string;
  signups: number;
  sessions: number;
  completedSessions: number;
  notifications: number;
  revenue: number;
};

export type SystemDistributionSegment = {
  key: string;
  label: string;
  value: number;
  percentage: number;
  tone?: 'positive' | 'warning' | 'critical' | 'info' | 'neutral';
};

export type SystemHighlight = {
  id: string;
  title: string;
  description: string;
  tone: 'positive' | 'warning' | 'critical' | 'info' | 'neutral';
  value: string;
  meta?: string;
};

export type SystemActivityRow = {
  id: string;
  type: 'signup' | 'session' | 'notification' | 'billing';
  title: string;
  detail: string | null;
  when: string | null;
  relative: string | null;
  tone: 'positive' | 'warning' | 'critical' | 'info' | 'neutral';
};

export type SystemDashboardData = {
  generatedAt: string;
  range: {
    label: string;
    days: number;
    since: string;
    until: string;
  };
  totals: {
    users: number;
    activeUsers: number;
    sessions: number;
    notifications: number;
    revenue: number;
  };
  hero: SystemHeroMetric[];
  timeline: SystemTimelinePoint[];
  distribution: SystemDistributionSegment[];
  highlights: SystemHighlight[];
  activity: SystemActivityRow[];
};
