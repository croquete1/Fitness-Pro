export type AdminApprovalStatus = 'pending' | 'approved' | 'rejected' | 'other';

export type AdminApprovalRow = {
  id: string;
  userId: string | null;
  trainerId?: string | null;
  name?: string | null;
  email?: string | null;
  status: AdminApprovalStatus;
  requestedAt: string | null;
  decidedAt: string | null;
  reviewerId?: string | null;
  reviewerName?: string | null;
  channel?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type AdminApprovalHeroMetric = {
  id: string;
  label: string;
  value: string;
  helper?: string | null;
  tone: 'primary' | 'positive' | 'warning' | 'danger' | 'info';
};

export type AdminApprovalHighlight = {
  id: string;
  title: string;
  description: string;
  tone: 'positive' | 'warning' | 'info' | 'danger';
};

export type AdminApprovalTimelinePoint = {
  date: string;
  pending: number;
  approved: number;
  rejected: number;
};

export type AdminApprovalStatusSegment = {
  id: string;
  label: string;
  count: number;
  tone: 'primary' | 'positive' | 'warning' | 'danger' | 'neutral';
};

export type AdminApprovalBacklogRow = {
  id: string;
  name: string | null;
  email: string | null;
  waitingHours: number;
  requestedAt: string | null;
  userId: string | null;
  status: AdminApprovalStatus;
};

export type AdminApprovalReviewerStat = {
  id: string;
  name: string;
  approvals: number;
  avgSlaHours: number | null;
};

export type AdminApprovalSlaOverview = {
  averageHours: number | null;
  percentile90Hours: number | null;
  within24h: number;
  breached: number;
};

export type AdminApprovalsDashboardData = {
  ok: true;
  source: 'supabase' | 'fallback';
  generatedAt: string;
  sampleSize: number;
  datasetSize: number;
  hero: AdminApprovalHeroMetric[];
  highlights: AdminApprovalHighlight[];
  statuses: AdminApprovalStatusSegment[];
  timeline: AdminApprovalTimelinePoint[];
  backlog: AdminApprovalBacklogRow[];
  reviewers: AdminApprovalReviewerStat[];
  sla: AdminApprovalSlaOverview;
  _supabaseConfigured?: boolean;
};

export type AdminApprovalListRow = {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string | null;
  metadata?: Record<string, unknown> | null;
};

