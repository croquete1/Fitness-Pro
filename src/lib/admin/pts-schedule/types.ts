export type AdminPtsScheduleRecord = {
  id: string;
  start: string | null;
  end: string | null;
  status: string | null;
  location: string | null;
  notes: string | null;
  durationMinutes: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  trainer: {
    id: string | null;
    name: string | null;
    email: string | null;
  } | null;
  client: {
    id: string | null;
    name: string | null;
    email: string | null;
  } | null;
};

export type AdminPtsScheduleHeroMetric = {
  id: string;
  label: string;
  value: string;
  hint: string;
  tone: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
};

export type AdminPtsScheduleStatusSummary = {
  id: string;
  label: string;
  count: number;
  tone: 'ok' | 'warn' | 'down' | 'neutral';
};

export type AdminPtsScheduleTrainerSummary = {
  id: string;
  name: string;
  sessions: number;
  uniqueClients: number;
  nextSessionLabel: string | null;
};

export type AdminPtsScheduleSessionView = {
  id: string;
  start: string | null;
  end: string | null;
  startLabel: string;
  rangeLabel: string;
  trainerId: string | null;
  trainerName: string;
  clientId: string | null;
  clientName: string;
  status: string;
  statusLabel: string;
  statusTone: 'ok' | 'warn' | 'down' | 'neutral';
  location: string | null;
  notes: string | null;
  durationLabel: string | null;
};

export type AdminPtsScheduleDashboardData = {
  generatedAt: string;
  updatedAt: string | null;
  supabaseConfigured: boolean;
  rangeStart: string;
  rangeEnd: string;
  rangeLabel: string;
  hero: AdminPtsScheduleHeroMetric[];
  statuses: AdminPtsScheduleStatusSummary[];
  trainers: AdminPtsScheduleTrainerSummary[];
  sessions: AdminPtsScheduleSessionView[];
};
