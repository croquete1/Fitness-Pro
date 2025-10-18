export type AuditLogRecord = {
  id: string;
  createdAt: string | null;
  kind: string | null;
  category: string | null;
  action: string | null;
  targetType: string | null;
  targetId: string | null;
  target: string | null;
  actorId: string | null;
  actor: string | null;
  note: string | null;
  details: Record<string, unknown> | null;
  meta: Record<string, unknown> | null;
  payload: Record<string, unknown> | null;
  ip: string | null;
};

type MetricTone = 'neutral' | 'positive' | 'warning' | 'critical' | 'info';

export type AuditLogHeroMetric = {
  key: string;
  label: string;
  value: string;
  hint?: string;
  trend?: string;
  tone?: MetricTone;
};

export type AuditLogHighlight = {
  id: string;
  title: string;
  description: string;
  value: string;
  tone: MetricTone;
  meta?: string | null;
};

export type AuditLogTimelinePoint = {
  iso: string;
  label: string;
  total: number;
  security: number;
  operations: number;
  content: number;
  logins: number;
  failures: number;
};

export type AuditLogDistributionSegment = {
  key: string;
  label: string;
  value: number;
  percentage: number;
  tone?: MetricTone;
};

export type AuditLogActivityRow = {
  id: string;
  createdAt: string;
  category: string | null;
  action: string | null;
  actor: string | null;
  target: string | null;
  description: string | null;
  ip: string | null;
};

export type AuditLogDashboardData = {
  rangeDays: number;
  generatedAt: string;
  hero: AuditLogHeroMetric[];
  timeline: AuditLogTimelinePoint[];
  distribution: AuditLogDistributionSegment[];
  highlights: AuditLogHighlight[];
  activity: AuditLogActivityRow[];
  summary: {
    totalEvents: number;
    uniqueActors: number;
    loginSuccess: number;
    loginFailures: number;
    criticalEvents: number;
    lastEventAt: string | null;
  };
};

export type AuditLogDashboardResponse = AuditLogDashboardData & {
  ok: true;
  source: 'supabase' | 'fallback';
};

export type BuildAuditLogOptions = {
  rangeDays?: number;
  now?: Date;
};
