export type SessionAttendanceStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | null;

export type ClientSession = {
  id: string;
  startISO: string | null;
  endISO: string | null;
  durationMin: number | null;
  location: string | null;
  notes: string | null;
  trainerId?: string | null;
  trainerName: string | null;
  trainerEmail: string | null;
  status: string | null;
  attendanceStatus: SessionAttendanceStatus;
  attendanceAt: string | null;
};

export type SessionRequestStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'cancelled'
  | 'reschedule_pending'
  | 'reschedule_declined';

export type SessionRequestTrainer = {
  id: string;
  name: string | null;
  email: string | null;
};

export type SessionRequest = {
  id: string;
  sessionId: string | null;
  status: SessionRequestStatus;
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
  trainer: SessionRequestTrainer | null;
};

export type SessionTimelinePoint = {
  date: string;
  scheduled: number;
  confirmed: number;
  cancelled: number;
};

export type SessionAttendanceStat = {
  key: string;
  label: string;
  count: number;
  percentage: number;
  tone: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
};

export type SessionTrainerStat = {
  trainerId: string;
  trainerName: string | null;
  trainerEmail: string | null;
  total: number;
  upcoming: number;
  completed: number;
};

export type SessionRequestStat = {
  key: string;
  label: string;
  count: number;
  tone: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
};

export type SessionActivity = {
  id: string;
  category: 'session' | 'request';
  title: string;
  description: string;
  at: string | null;
  tone: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
};

export type SessionDashboardMetrics = {
  supabase: boolean;
  totalSessions: number;
  upcomingCount: number;
  nextSessionAt: string | null;
  attendanceRate: number;
  cancellationRate: number;
  hoursBooked7d: number;
  hoursBookedDelta: number;
  lastCompletedAt: string | null;
  busiestDayLabel: string | null;
  openRequests: number;
};

export type SessionDashboardData = {
  metrics: SessionDashboardMetrics;
  timeline: SessionTimelinePoint[];
  attendance: SessionAttendanceStat[];
  trainers: SessionTrainerStat[];
  requestStats: SessionRequestStat[];
  activities: SessionActivity[];
};
