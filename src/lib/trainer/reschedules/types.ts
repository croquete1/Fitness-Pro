export type TrainerRescheduleRequestRecord = {
  id: string;
  sessionId: string | null;
  status: string;
  requestedStart: string | null;
  requestedEnd: string | null;
  proposedStart: string | null;
  proposedEnd: string | null;
  message: string | null;
  trainerNote: string | null;
  rescheduleNote: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  respondedAt: string | null;
  proposedAt: string | null;
  clientId: string | null;
  clientName: string | null;
  clientEmail: string | null;
};

export type TrainerAgendaSessionRecord = {
  id: string;
  start: string | null;
  end: string | null;
  durationMin: number | null;
  location: string | null;
  status: string | null;
  clientId: string | null;
  clientName: string | null;
};

export type TrainerRescheduleHeroMetric = {
  id: string;
  label: string;
  value: string;
  hint?: string | null;
  tone?: 'positive' | 'warning' | 'critical' | 'neutral';
};

export type TrainerRescheduleInsight = {
  id: string;
  title: string;
  description: string;
  tone: 'positive' | 'warning' | 'critical' | 'neutral';
  value?: string | null;
};

export type TrainerRescheduleRequestView = {
  id: string;
  status: string;
  statusLabel: string;
  statusTone: 'positive' | 'warning' | 'critical' | 'neutral';
  requestedStart: string | null;
  requestedEnd: string | null;
  requestedLabel: string;
  requestedRange: string;
  proposedStart: string | null;
  proposedEnd: string | null;
  proposedLabel: string | null;
  message: string | null;
  trainerNote: string | null;
  rescheduleNote: string | null;
  respondedAt: string | null;
  respondedLabel: string | null;
  createdAt: string | null;
  clientId: string | null;
  clientLabel: string;
  awaitingClient: boolean;
  canAccept: boolean;
  canDecline: boolean;
  canPropose: boolean;
};

export type TrainerRescheduleAgendaSessionView = {
  id: string;
  clientName: string;
  rangeLabel: string;
  location: string | null;
  statusLabel: string;
  statusTone: 'ok' | 'warn' | 'down' | 'neutral';
};

export type TrainerRescheduleAgendaDay = {
  id: string;
  date: string;
  label: string;
  sessions: TrainerRescheduleAgendaSessionView[];
};

export type TrainerReschedulesDashboardData = {
  updatedAt: string;
  supabase: boolean;
  hero: TrainerRescheduleHeroMetric[];
  insights: TrainerRescheduleInsight[];
  pending: TrainerRescheduleRequestView[];
  history: TrainerRescheduleRequestView[];
  agenda: TrainerRescheduleAgendaDay[];
};
