export type TrainerWorkoutRecord = {
  id: string;
  title: string | null;
  trainerId: string | null;
  clientId: string | null;
  clientName: string | null;
  clientEmail: string | null;
  startAt: string | null;
  endAt: string | null;
  durationMinutes: number | null;
  status: string | null;
  attendanceStatus: string | null;
  location: string | null;
  planId: string | null;
  planTitle: string | null;
  focusArea: string | null;
  intensity: string | null;
  notes: string | null;
};

export type TrainerWorkoutAttendanceKey =
  | 'upcoming'
  | 'completed'
  | 'confirmed'
  | 'pending'
  | 'cancelled'
  | 'no_show'
  | 'unknown';

export type TrainerWorkoutHeroMetric = {
  id: string;
  label: string;
  value: string;
  hint?: string | null;
  trend?: string | null;
  tone?: 'positive' | 'warning' | 'critical' | 'neutral';
};

export type TrainerWorkoutDistributionStat = {
  id: TrainerWorkoutAttendanceKey;
  label: string;
  tone: 'positive' | 'warning' | 'critical' | 'neutral';
  count: number;
  percentage: number;
};

export type TrainerWorkoutTimelinePoint = {
  date: string;
  label: string;
  scheduled: number;
  completed: number;
  cancelled: number;
};

export type TrainerWorkoutHighlight = {
  id: string;
  title: string;
  description: string;
  tone: 'positive' | 'warning' | 'critical' | 'neutral';
  meta?: string | null;
};

export type TrainerWorkoutClientSnapshot = {
  id: string;
  name: string;
  email: string | null;
  upcoming: number;
  completed: number;
  completionRate: number;
  nextSessionAt: string | null;
  nextSessionLabel: string;
  tone: 'positive' | 'warning' | 'critical' | 'neutral';
};

export type TrainerWorkoutTableRow = {
  id: string;
  title: string;
  startAt: string | null;
  startLabel: string;
  durationLabel: string;
  clientName: string;
  clientEmail: string | null;
  attendance: TrainerWorkoutAttendanceKey;
  attendanceLabel: string;
  attendanceTone: 'positive' | 'warning' | 'critical' | 'neutral';
  location: string | null;
  planTitle: string | null;
  notes?: string | null;
};

export type TrainerWorkoutsDashboardData = {
  updatedAt: string;
  supabase: boolean;
  hero: TrainerWorkoutHeroMetric[];
  distribution: TrainerWorkoutDistributionStat[];
  timeline: TrainerWorkoutTimelinePoint[];
  highlights: TrainerWorkoutHighlight[];
  clients: TrainerWorkoutClientSnapshot[];
  rows: TrainerWorkoutTableRow[];
};
