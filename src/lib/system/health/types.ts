export type SystemHealthStatus = 'ok' | 'warn' | 'down';

export type SystemHealthServiceRecord = {
  id: string;
  name: string;
  summary: string | null;
  state: SystemHealthStatus;
  latencyMs: number | null;
  uptimePercent: number | null;
  trendLabel: string | null;
  incidents30d: number | null;
  updatedAt: string | null;
};

export type SystemHealthMonitorRecord = {
  id: string;
  title: string;
  detail: string | null;
  status: SystemHealthStatus;
  updatedAt: string | null;
};

export type SystemHealthResilienceRecord = {
  id: string;
  title: string;
  detail: string | null;
  status: SystemHealthStatus;
  updatedAt: string | null;
};

export type SystemHealthDashboardInput = {
  services: SystemHealthServiceRecord[];
  monitors: SystemHealthMonitorRecord[];
  resilience: SystemHealthResilienceRecord[];
};

export type SystemHealthHeroMetric = {
  key: string;
  label: string;
  value: string;
  hint?: string | null;
  trend?: string | null;
  tone?: 'positive' | 'warning' | 'critical' | 'info' | 'neutral';
};

export type SystemHealthService = {
  id: string;
  name: string;
  summary: string;
  state: SystemHealthStatus;
  latency: string;
  uptime: string;
  trend: string;
  updatedRelative: string;
  updatedAt: string | null;
};

export type SystemHealthMonitor = {
  id: string;
  title: string;
  detail: string;
  status: SystemHealthStatus;
  updatedRelative: string;
  updatedAt: string | null;
};

export type SystemHealthResilience = {
  id: string;
  title: string;
  detail: string;
  status: SystemHealthStatus;
  updatedRelative: string;
  updatedAt: string | null;
};

export type SystemHealthSummary = {
  overallState: SystemHealthStatus;
  lastUpdatedAt: string | null;
  lastUpdatedRelative: string | null;
  serviceTotals: { total: number; ok: number; warn: number; down: number };
  monitorTotals: { total: number; warn: number; down: number };
  resilienceTotals: { total: number; warn: number; down: number };
};

export type SystemHealthDashboardData = {
  generatedAt: string;
  hero: SystemHealthHeroMetric[];
  services: SystemHealthService[];
  monitors: SystemHealthMonitor[];
  resilience: SystemHealthResilience[];
  summary: SystemHealthSummary;
};

export type SystemHealthDashboardResponse = SystemHealthDashboardData & {
  ok: true;
  source: 'supabase' | 'fallback';
};

export type BuildSystemHealthOptions = {
  now?: Date;
};
