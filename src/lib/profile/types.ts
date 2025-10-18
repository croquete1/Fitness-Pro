export type ProfileAccount = {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  role: string | null;
  phone: string | null;
  birthDate: string | null;
  bio: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ProfileHeroMetric = {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
  trend?: { direction: 'up' | 'down' | 'neutral'; label: string } | null;
};

export type ProfileTimelinePoint = {
  date: string;
  label: string;
  scheduled: number;
  completed: number;
  cancelled: number;
};

export type ProfileHighlight = {
  id: string;
  title: string;
  description: string;
  tone: 'info' | 'success' | 'warning' | 'danger';
};

export type ProfileCompletionItem = {
  id: string;
  label: string;
  action: string;
};

export type ProfileCompletionState = {
  percentage: number;
  missing: ProfileCompletionItem[];
};

export type ProfileActivity = {
  id: string;
  title: string;
  description: string;
  at: string | null;
  tone: 'info' | 'success' | 'warning';
};

export type ProfileDevice = {
  id: string;
  name: string;
  platform: string;
  lastActiveAt: string | null;
  location: string | null;
  risk: 'low' | 'medium' | 'high';
};

export type ProfilePreferenceChannel = 'email' | 'push' | 'sms';

export type ProfilePreferenceSnapshot = {
  channel: ProfilePreferenceChannel;
  label: string;
  enabled: boolean;
  helper?: string | null;
  updatedAt: string | null;
};

export type ProfileNotificationSnapshot = {
  total: number;
  unread: number;
  delivered30d: number;
  lastDeliveryAt: string | null;
  nextReminderAt: string | null;
};

export type ProfileSessionSnapshot = {
  total: number;
  upcoming: number;
  attendanceRate: number;
  cancellationRate: number;
  hours7d: number;
  hoursDelta: number;
  nextSessionAt: string | null;
  lastCompletedAt: string | null;
  favouriteTrainer: string | null;
};

export type ProfileDashboardData = {
  account: ProfileAccount;
  hero: ProfileHeroMetric[];
  timeline: ProfileTimelinePoint[];
  highlights: ProfileHighlight[];
  completion: ProfileCompletionState;
  notifications: ProfileNotificationSnapshot;
  sessions: ProfileSessionSnapshot;
  devices: ProfileDevice[];
  preferences: ProfilePreferenceSnapshot[];
  activity: ProfileActivity[];
  generatedAt: string;
};

export type ProfileDashboardResponse = ProfileDashboardData & {
  ok: true;
  source: 'supabase' | 'fallback';
};

export type ProfileDashboardError = {
  ok: false;
  message: string;
};
