export type TrainerPlanRecord = {
  id: string;
  title: string | null;
  status: string | null;
  clientId: string | null;
  clientName: string | null;
  clientEmail: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type TrainerPlanStatusKey = 'draft' | 'active' | 'archived' | 'deleted' | 'unknown';

export type TrainerPlansHeroMetric = {
  id: string;
  label: string;
  value: string;
  hint?: string | null;
  trend?: string | null;
  tone?: 'positive' | 'warning' | 'critical' | 'neutral';
};

export type TrainerPlanStatusSummary = {
  id: TrainerPlanStatusKey;
  label: string;
  tone: 'positive' | 'warning' | 'critical' | 'neutral';
  count: number;
  percentage: number;
};

export type TrainerPlanTimelinePoint = {
  week: string;
  label: string;
  created: number;
  updated: number;
  archived: number;
};

export type TrainerPlanHighlight = {
  id: string;
  title: string;
  description: string;
  tone: 'positive' | 'warning' | 'critical' | 'neutral';
  value?: string | null;
  meta?: string | null;
};

export type TrainerPlanClientSnapshot = {
  id: string;
  name: string;
  email: string | null;
  activePlans: number;
  totalPlans: number;
  lastUpdate: string | null;
  lastUpdateLabel: string;
  tone: 'positive' | 'warning' | 'critical' | 'neutral';
};

export type TrainerPlanTableRow = {
  id: string;
  title: string;
  status: TrainerPlanStatusKey;
  statusLabel: string;
  statusTone: 'positive' | 'warning' | 'critical' | 'neutral';
  clientId: string | null;
  clientName: string;
  clientEmail: string | null;
  startLabel: string;
  endLabel: string;
  updatedLabel: string;
  updatedAt: string | null;
  createdAt: string | null;
};

export type TrainerPlansDashboardData = {
  updatedAt: string;
  supabase: boolean;
  hero: TrainerPlansHeroMetric[];
  statuses: TrainerPlanStatusSummary[];
  timeline: TrainerPlanTimelinePoint[];
  highlights: TrainerPlanHighlight[];
  clients: TrainerPlanClientSnapshot[];
  rows: TrainerPlanTableRow[];
};
