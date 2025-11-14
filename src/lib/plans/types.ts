export type PlanStatusKey = 'draft' | 'active' | 'archived' | 'deleted' | 'unknown';

export type ClientPlan = {
  id: string;
  title: string | null;
  status: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  startDate: string | null;
  endDate: string | null;
  trainerId: string | null;
  trainerName: string | null;
  trainerEmail: string | null;
};

export type PlansHeroMetric = {
  key: string;
  label: string;
  value: string;
  hint?: string | null;
  trend?: string | null;
  tone?: 'positive' | 'warning' | 'critical' | 'neutral';
};

export type PlanStatusSummary = {
  key: PlanStatusKey;
  label: string;
  tone: 'positive' | 'warning' | 'critical' | 'neutral';
  count: number;
  percentage: number;
};

export type PlanTimelinePoint = {
  week: string;
  label: string;
  created: number;
  updated: number;
  archived: number;
};

export type PlanTrainerStat = {
  trainerId: string;
  trainerName: string | null;
  trainerEmail: string | null;
  active: number;
  total: number;
};

export type PlanInsight = {
  id: string;
  title: string;
  description: string;
  tone: 'positive' | 'warning' | 'critical' | 'neutral';
};

export type PlansDashboardData = {
  rows: ClientPlan[];
  hero: PlansHeroMetric[];
  statuses: PlanStatusSummary[];
  timeline: PlanTimelinePoint[];
  trainers: PlanTrainerStat[];
  insights: PlanInsight[];
  updatedAt: string;
  fallback: boolean;
};

export type PlansDashboardPayload = PlansDashboardData & {
  ok: boolean;
  source: 'supabase' | 'fallback';
  message?: string;
};
