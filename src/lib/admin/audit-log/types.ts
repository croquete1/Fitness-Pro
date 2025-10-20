export type AuditLogRow = {
  id: string;
  created_at: string | null;
  kind: string | null;
  category: string | null;
  action: string | null;
  target_type: string | null;
  target_id: string | null;
  target: string | null;
  actor_id: string | null;
  actor: string | null;
  note: string | null;
  details: Record<string, unknown> | null;
  payload: Record<string, unknown> | null;
  meta: Record<string, unknown> | null;
  ip: string | null;
  user_agent: string | null;
};

export type AuditLogMeta = {
  kinds: string[];
  targetTypes: string[];
  actors: { id: string | null; label: string | null }[];
};

export type AuditLogHeroMetric = {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: 'primary' | 'warning' | 'teal' | 'danger' | 'neutral';
};

export type AuditLogTimelinePoint = {
  date: string;
  total: number;
  security: number;
  plans: number;
  users: number;
};

export type AuditLogKindShare = {
  kind: string;
  count: number;
};

export type AuditLogActorShare = {
  id: string | null;
  label: string;
  count: number;
};

export type AuditLogHighlight = {
  id: string;
  label: string;
  description: string;
  createdAt: string;
  tone: 'info' | 'warning' | 'danger' | 'success';
};

export type AdminAuditDashboardData = {
  generatedAt: string;
  heroMetrics: AuditLogHeroMetric[];
  timeline: AuditLogTimelinePoint[];
  kindShares: AuditLogKindShare[];
  actorShares: AuditLogActorShare[];
  highlights: AuditLogHighlight[];
};
