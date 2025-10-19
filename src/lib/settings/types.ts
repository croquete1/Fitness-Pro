import type { AppRole } from '@/lib/roles';
import type {
  AdminSettings,
  ClientSettings,
  NotificationFrequency,
  NotificationPreferences,
  ThemePreference,
  TrainerSettings,
} from './defaults';

export type SettingsModel = {
  id: string;
  role: AppRole;
  name: string;
  phone: string | null;
  email: string;
  language: string;
  theme: ThemePreference;
  notifications: NotificationPreferences;
  adminPreferences?: AdminSettings;
  trainerPreferences?: TrainerSettings;
  clientPreferences?: ClientSettings;
};

export type SettingsAccountSnapshot = {
  createdAt: string | null;
  lastLoginAt: string | null;
  lastPasswordChangeAt: string | null;
  emailConfirmedAt: string | null;
  mfaEnabled: boolean;
  recoveryCodesRemaining: number | null;
  trustedDevices: number | null;
};

export type SettingsNotificationSnapshot = NotificationPreferences & {
  updatedAt: string | null;
  totalDeliveries30d?: number | null;
  failedDeliveries30d?: number | null;
};

export type SettingsSecurityEventType =
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'password_change'
  | 'mfa_challenge'
  | 'recovery'
  | 'profile_update'
  | 'notification_update'
  | 'device_revoked';

export type SettingsSecurityEventStatus = 'success' | 'failed';

export type SettingsSecurityEvent = {
  id: string;
  type: SettingsSecurityEventType;
  status: SettingsSecurityEventStatus;
  createdAt: string;
  note?: string | null;
  ip?: string | null;
  location?: string | null;
  device?: string | null;
  channel?: string | null;
};

export type SettingsDashboardHeroMetric = {
  id: string;
  label: string;
  value: string;
  helper?: string | null;
  trend?: { direction: 'up' | 'down' | 'neutral'; label: string } | null;
};

export type SettingsDashboardTimelinePoint = {
  iso: string;
  label: string;
  logins: number;
  failures: number;
  recoveries: number;
  mfa: number;
  devices: number;
};

export type SettingsDashboardHighlight = {
  id: string;
  title: string;
  description: string;
  tone: 'info' | 'warning' | 'success';
};

export type SettingsNotificationChannel = {
  id: string;
  label: string;
  enabled: boolean;
  description?: string | null;
  updatedAt: string | null;
};

export type SettingsDevice = {
  id: string;
  label: string;
  location: string;
  lastSeen: string;
  relative: string;
  status: 'active' | 'expired';
  risk: 'low' | 'medium' | 'high';
  channel?: string | null;
};

export type SettingsActivity = {
  id: string;
  title: string;
  description: string;
  when: string;
  relative: string;
  type: SettingsSecurityEventType;
  tone: 'info' | 'warning' | 'success';
};

export type SettingsDashboardData = {
  generatedAt: string;
  rangeDays: number;
  rangeLabel: string;
  hero: SettingsDashboardHeroMetric[];
  highlights: SettingsDashboardHighlight[];
  timeline: SettingsDashboardTimelinePoint[];
  notifications: {
    summary: string;
    digest: { label: string; schedule: string; helper?: string | null };
    channels: SettingsNotificationChannel[];
    deliverability: { successRate: number; label: string };
  };
  devices: SettingsDevice[];
  activity: SettingsActivity[];
};

export type SettingsDashboardResponse = SettingsDashboardData & {
  ok: true;
  source: 'supabase' | 'fallback';
};

export type SettingsDashboardError = {
  ok: false;
  message: string;
};

export type SettingsContext = {
  model: SettingsModel;
  account: SettingsAccountSnapshot;
  notifications: SettingsNotificationSnapshot;
};
