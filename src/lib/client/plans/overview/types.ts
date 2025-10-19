import type { PlanStatusKey } from '@/lib/plans/types';

export type ClientPlanAgendaItem = {
  planId: string;
  planTitle: string;
  status: PlanStatusKey;
  statusLabel: string;
  statusTone: 'positive' | 'warning' | 'critical' | 'neutral';
  exercises: number;
  trainerName: string | null;
  trainerEmail: string | null;
};

export type ClientPlanAgendaDay = {
  offset: number;
  dayIndex: number;
  label: string;
  dateLabel: string;
  isToday: boolean;
  totalExercises: number;
  items: ClientPlanAgendaItem[];
};

export type ClientPlanOverviewMetric = {
  id: string;
  label: string;
  value: string;
  hint?: string | null;
  tone?: 'positive' | 'warning' | 'critical' | 'neutral';
};

export type ClientPlanOverviewHighlight = {
  id: string;
  title: string;
  description: string;
  tone: 'positive' | 'warning' | 'critical' | 'neutral';
  icon?: string | null;
};

export type ClientPlanOverviewStatus = {
  key: 'all' | PlanStatusKey;
  label: string;
  tone: 'positive' | 'warning' | 'critical' | 'neutral';
  count: number;
};

export type ClientPlanOverviewRow = {
  id: string;
  title: string;
  status: PlanStatusKey;
  statusLabel: string;
  statusTone: 'positive' | 'warning' | 'critical' | 'neutral';
  trainerName: string | null;
  trainerEmail: string | null;
  startDateLabel: string;
  endDateLabel: string;
  updatedAtLabel: string;
  updatedRelative: string;
  exercisesPerWeek: number;
  trainingDays: number;
  link: string;
  search: string;
};

export type ClientPlanOverviewData = {
  hero: ClientPlanOverviewMetric[];
  highlights: ClientPlanOverviewHighlight[];
  agenda: ClientPlanAgendaDay[];
  plans: ClientPlanOverviewRow[];
  statuses: ClientPlanOverviewStatus[];
  updatedAt: string;
  fallback: boolean;
  rangeDays: number;
};

export type ClientPlanOverviewResponse = ClientPlanOverviewData & {
  ok: true;
  source: 'supabase' | 'fallback';
};

export type ClientPlanDayItem = {
  planId: string;
  dayIndex: number;
  exerciseId?: string | null;
  id?: string | null;
};
