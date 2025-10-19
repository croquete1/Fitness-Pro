export type ClientHeroMetricTone = 'info' | 'success' | 'warning' | 'danger' | 'accent' | 'neutral';

export type ClientHeroMetric = {
  key: string;
  label: string;
  value: string;
  hint?: string;
  trend?: string | null;
  tone?: ClientHeroMetricTone;
};

export type ClientHighlightTone = 'info' | 'success' | 'warning' | 'danger' | 'accent' | 'neutral';

export type ClientHighlight = {
  id: string;
  title: string;
  description: string;
  tone: ClientHighlightTone;
  icon?: string;
  meta?: string;
};

export type ClientTimelinePoint = {
  day: string;
  label: string;
  scheduled: number;
  completed: number;
  cancelled: number;
};

export type ClientPlanSummary = {
  id: string;
  title: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  trainerName: string | null;
  progressPct: number | null;
  daysRemaining: number | null;
  sessionsCompleted: number | null;
  sessionsTotal: number | null;
  summary?: string;
};

export type ClientMeasurementPoint = {
  measuredAt: string | null;
  label: string;
  weightKg: number | null;
  bodyFatPct: number | null;
  bmi: number | null;
};

export type ClientMeasurementTrend = {
  weight: string | null;
  bodyFat: string | null;
  bmi: string | null;
  tone: 'neutral' | 'up' | 'down';
};

export type ClientMeasurementSnapshot = {
  current: ClientMeasurementPoint | null;
  previous: ClientMeasurementPoint | null;
  timeline: ClientMeasurementPoint[];
  trend: ClientMeasurementTrend | null;
};

export type ClientSessionRow = {
  id: string;
  scheduledAt: string | null;
  dayLabel: string;
  timeLabel: string;
  relative: string;
  location: string | null;
  trainerName: string | null;
  status: string | null;
};

export type ClientWalletEntry = {
  id: string;
  amount: number;
  description: string | null;
  createdAt: string | null;
  relative: string;
};

export type ClientWalletSnapshot = {
  balance: number;
  currency: string;
  updatedAt: string | null;
  entries: ClientWalletEntry[];
};

export type ClientNotificationItem = {
  id: string;
  title: string;
  createdAt: string | null;
  relative: string;
  type: string | null;
  read: boolean;
};

export type ClientRecommendation = {
  id: string;
  message: string;
  tone: ClientHighlightTone;
  icon?: string;
};

export type ClientDashboardData = {
  generatedAt: string;
  range: {
    days: number;
    since: string;
    until: string;
    label: string;
  };
  hero: ClientHeroMetric[];
  timeline: ClientTimelinePoint[];
  highlights: ClientHighlight[];
  plan: ClientPlanSummary | null;
  measurements: ClientMeasurementSnapshot;
  sessions: ClientSessionRow[];
  wallet: ClientWalletSnapshot | null;
  notifications: {
    unread: number;
    items: ClientNotificationItem[];
  };
  recommendations: ClientRecommendation[];
};

export type ClientDashboardResponse = ClientDashboardData & {
  ok: true;
  source: 'supabase' | 'fallback';
};

export type ClientDashboardError = {
  ok: false;
  message: string;
};

export type ClientPlanRow = {
  id: string;
  title: string | null;
  status: string | null;
  client_id?: string | null;
  start_date: string | null;
  end_date: string | null;
  trainer_id: string | null;
  updated_at: string | null;
  notes?: string | null;
};

export type ClientSessionRowRaw = {
  id: string;
  trainer_id: string | null;
  scheduled_at: string | null;
  duration_min: number | null;
  location: string | null;
  client_attendance_status: string | null;
};

export type ClientNotificationRow = {
  id: string;
  title: string | null;
  type: string | null;
  read: boolean | null;
  created_at: string | null;
};

export type ClientMeasurementRow = {
  measured_at: string | null;
  weight_kg: number | null;
  body_fat_pct: number | null;
  bmi: number | null;
};

export type ClientWalletRow = {
  balance: number | null;
  currency: string | null;
  updated_at: string | null;
};

export type ClientWalletEntryRow = {
  id: string;
  amount: number;
  desc: string | null;
  created_at: string | null;
};

export type ClientDashboardSource = {
  now: Date;
  rangeDays: number;
  plans: ClientPlanRow[];
  sessions: ClientSessionRowRaw[];
  notifications: ClientNotificationRow[];
  measurements: ClientMeasurementRow[];
  wallet: ClientWalletRow | null;
  walletEntries: ClientWalletEntryRow[];
  trainerNames: Record<string, string>;
};
