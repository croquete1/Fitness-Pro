export type TrainerClientRecord = {
  id: string;
  name: string | null;
  email: string | null;
  status: string | null;
  linkedAt: string | null;
  activePlanStatus: string | null;
  lastSessionAt: string | null;
  nextSessionAt: string | null;
};

export type TrainerSessionRecord = {
  id: string;
  clientId: string | null;
  clientName: string | null;
  startAt: string | null;
  endAt: string | null;
  durationMinutes: number | null;
  status: string | null;
  attendanceStatus: string | null;
  location: string | null;
};

export type TrainerPlanRecord = {
  id: string;
  clientId: string | null;
  status: string | null;
  startDate: string | null;
  endDate: string | null;
  updatedAt: string | null;
  title: string | null;
};

export type TrainerApprovalRecord = {
  id: string;
  clientId: string | null;
  clientName: string | null;
  requestedAt: string | null;
  status: string | null;
  type: string | null;
  notes: string | null;
};

export type TrainerDashboardSource = {
  trainerId: string | null;
  now: Date;
  trainerName?: string | null;
  clients: TrainerClientRecord[];
  sessions: TrainerSessionRecord[];
  plans: TrainerPlanRecord[];
  approvals: TrainerApprovalRecord[];
};

export type TrainerHeroMetric = {
  id: string;
  label: string;
  value: string;
  hint?: string | null;
  trend?: string | null;
  tone: 'positive' | 'warning' | 'critical' | 'neutral';
  href?: string | null;
};

export type TrainerTimelinePoint = {
  date: string;
  label: string;
  scheduled: number;
  completed: number;
  cancelled: number;
};

export type TrainerHighlight = {
  id: string;
  title: string;
  description: string;
  tone: 'positive' | 'warning' | 'critical' | 'info';
};

export type TrainerAgendaSession = {
  id: string;
  startAt: string | null;
  timeLabel: string;
  clientName: string;
  location: string | null;
  status: string;
  tone: 'positive' | 'warning' | 'critical';
};

export type TrainerAgendaDay = {
  date: string;
  label: string;
  total: number;
  sessions: TrainerAgendaSession[];
};

export type TrainerUpcomingSession = {
  id: string;
  startAt: string | null;
  dateLabel: string;
  timeLabel: string;
  clientName: string;
  location: string | null;
  status: string;
  tone: 'positive' | 'warning' | 'critical';
};

export type TrainerClientSnapshot = {
  id: string;
  name: string;
  email: string | null;
  upcoming: number;
  completed: number;
  lastSessionLabel: string;
  nextSessionLabel: string;
  lastSessionAt: string | null;
  nextSessionAt: string | null;
  tone: 'positive' | 'warning' | 'critical' | 'neutral';
};

export type TrainerApprovalItem = {
  id: string;
  clientName: string;
  type: string | null;
  requestedAt: string | null;
  requestedLabel: string;
  status: string;
  tone: 'positive' | 'warning' | 'critical' | 'neutral';
};

export type TrainerApprovalSummary = {
  pending: number;
  recent: TrainerApprovalItem[];
};

export type TrainerDashboardData = {
  trainerId: string | null;
  trainerName: string | null;
  updatedAt: string;
  supabase: boolean;
  hero: TrainerHeroMetric[];
  timeline: TrainerTimelinePoint[];
  highlights: TrainerHighlight[];
  agenda: TrainerAgendaDay[];
  upcoming: TrainerUpcomingSession[];
  clients: TrainerClientSnapshot[];
  approvals: TrainerApprovalSummary;
};

export type TrainerDashboardResponse = TrainerDashboardData & {
  source: 'supabase' | 'fallback';
};
