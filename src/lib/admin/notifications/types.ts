export type AdminNotificationRow = {
  id: string;
  userId: string | null;
  title: string | null;
  body: string | null;
  type: string | null;
  channel: string | null;
  audience: string | null;
  read: boolean;
  createdAt: string | null;
  sentAt: string | null;
  metadata?: Record<string, unknown> | null;
};

export type AdminNotificationHeroMetric = {
  id: string;
  label: string;
  value: string;
  helper?: string | null;
  tone: 'primary' | 'positive' | 'warning' | 'danger' | 'info';
};

export type AdminNotificationHighlight = {
  id: string;
  title: string;
  description: string;
  tone: 'positive' | 'warning' | 'info' | 'danger';
};

export type AdminNotificationTimelinePoint = {
  date: string;
  sent: number;
  read: number;
  unread: number;
};

export type AdminNotificationDistributionSegment = {
  id: string;
  label: string;
  count: number;
  tone: 'primary' | 'positive' | 'warning' | 'danger' | 'neutral';
};

export type AdminNotificationChannelShare = {
  id: string;
  label: string;
  count: number;
};

export type AdminNotificationCampaignStat = {
  id: string;
  title: string;
  sent: number;
  read: number;
  openRate: number | null;
};

export type AdminNotificationBacklogRow = {
  id: string;
  title: string | null;
  userId: string | null;
  createdAt: string | null;
  waitingHours: number;
};

export type AdminNotificationsDashboardData = {
  ok: true;
  source: 'supabase' | 'fallback';
  generatedAt: string;
  sampleSize: number;
  datasetSize: number;
  hero: AdminNotificationHeroMetric[];
  highlights: AdminNotificationHighlight[];
  timeline: AdminNotificationTimelinePoint[];
  types: AdminNotificationDistributionSegment[];
  channels: AdminNotificationChannelShare[];
  campaigns: AdminNotificationCampaignStat[];
  backlog: AdminNotificationBacklogRow[];
  _supabaseConfigured?: boolean;
};

export type AdminNotificationListRow = {
  id: string;
  user_id: string | null;
  title: string | null;
  body: string | null;
  type: string | null;
  read: boolean;
  created_at: string | null;
};

