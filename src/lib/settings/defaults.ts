import type { AppRole } from '@/lib/roles';

export type ThemePreference = 'system' | 'light' | 'dark';
export type NotificationFrequency = 'daily' | 'weekly' | 'monthly' | 'never';

export type NotificationPreferences = {
  email: boolean;
  push: boolean;
  sms: boolean;
  summary: NotificationFrequency;
};

export type AdminSettings = {
  digestFrequency: 'daily' | 'weekly' | 'monthly';
  autoAssignTrainers: boolean;
  shareInsights: boolean;
};

export type TrainerSettings = {
  sessionReminders: boolean;
  newClientAlerts: boolean;
  calendarVisibility: 'private' | 'clients';
  allowClientReschedule: boolean;
};

export type ClientSettings = {
  planReminders: boolean;
  trainerMessages: boolean;
  shareProgress: 'trainer' | 'private';
  smsReminders: boolean;
};

export function defaultNotificationPreferences(): NotificationPreferences {
  return {
    email: true,
    push: true,
    sms: false,
    summary: 'weekly',
  } satisfies NotificationPreferences;
}

export function defaultAdminSettings(): AdminSettings {
  return {
    digestFrequency: 'weekly',
    autoAssignTrainers: false,
    shareInsights: true,
  } satisfies AdminSettings;
}

export function defaultTrainerSettings(): TrainerSettings {
  return {
    sessionReminders: true,
    newClientAlerts: true,
    calendarVisibility: 'clients',
    allowClientReschedule: true,
  } satisfies TrainerSettings;
}

export function defaultClientSettings(): ClientSettings {
  return {
    planReminders: true,
    trainerMessages: true,
    shareProgress: 'trainer',
    smsReminders: false,
  } satisfies ClientSettings;
}

export function defaultRoleSettings(role: AppRole) {
  if (role === 'ADMIN') return defaultAdminSettings();
  if (role === 'PT') return defaultTrainerSettings();
  return defaultClientSettings();
}
