// src/app/(app)/dashboard/settings/settings.defaults.ts
import type { AppRole } from "@/lib/roles";

export type ThemePreference = "system" | "light" | "dark";
export type NotificationFrequency = "daily" | "weekly" | "monthly" | "never";

export type NotificationPreferences = {
  email: boolean;
  push: boolean;
  sms: boolean;
  summary: NotificationFrequency;
};

export type AdminSettings = {
  digestFrequency: "daily" | "weekly" | "monthly";
  autoAssignTrainers: boolean;
  shareInsights: boolean;
};

export type TrainerSettings = {
  sessionReminders: boolean;
  newClientAlerts: boolean;
  calendarVisibility: "private" | "clients";
  allowClientReschedule: boolean;
};

export type ClientSettings = {
  planReminders: boolean;
  trainerMessages: boolean;
  shareProgress: "trainer" | "private";
  smsReminders: boolean;
};

export function defaultNotificationPreferences(): NotificationPreferences {
  return {
    email: true,
    push: true,
    sms: false,
    summary: "weekly",
  };
}

export function defaultAdminSettings(): AdminSettings {
  return {
    digestFrequency: "weekly",
    autoAssignTrainers: false,
    shareInsights: true,
  };
}

export function defaultTrainerSettings(): TrainerSettings {
  return {
    sessionReminders: true,
    newClientAlerts: true,
    calendarVisibility: "clients",
    allowClientReschedule: true,
  };
}

export function defaultClientSettings(): ClientSettings {
  return {
    planReminders: true,
    trainerMessages: true,
    shareProgress: "trainer",
    smsReminders: false,
  };
}

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

export function normalizeAdminSettings(
  value: unknown,
  fallback?: AdminSettings,
): AdminSettings {
  const base = fallback ?? defaultAdminSettings();
  const input = asRecord(value);

  const normalized: AdminSettings = { ...base };

  const digest = input.digestFrequency;
  if (digest === "daily" || digest === "weekly" || digest === "monthly") {
    normalized.digestFrequency = digest;
  }

  if (Object.prototype.hasOwnProperty.call(input, "autoAssignTrainers")) {
    normalized.autoAssignTrainers = Boolean(input.autoAssignTrainers);
  }

  if (Object.prototype.hasOwnProperty.call(input, "shareInsights")) {
    normalized.shareInsights = Boolean(input.shareInsights);
  }

  return normalized;
}

export function normalizeTrainerSettings(
  value: unknown,
  fallback?: TrainerSettings,
): TrainerSettings {
  const base = fallback ?? defaultTrainerSettings();
  const input = asRecord(value);

  const normalized: TrainerSettings = { ...base };

  if (Object.prototype.hasOwnProperty.call(input, "sessionReminders")) {
    normalized.sessionReminders = Boolean(input.sessionReminders);
  }

  if (Object.prototype.hasOwnProperty.call(input, "newClientAlerts")) {
    normalized.newClientAlerts = Boolean(input.newClientAlerts);
  }

  const visibility = input.calendarVisibility;
  if (visibility === "private" || visibility === "clients") {
    normalized.calendarVisibility = visibility;
  }

  if (Object.prototype.hasOwnProperty.call(input, "allowClientReschedule")) {
    normalized.allowClientReschedule = Boolean(input.allowClientReschedule);
  }

  return normalized;
}

export function normalizeClientSettings(
  value: unknown,
  fallback?: ClientSettings,
): ClientSettings {
  const base = fallback ?? defaultClientSettings();
  const input = asRecord(value);

  const normalized: ClientSettings = { ...base };

  if (Object.prototype.hasOwnProperty.call(input, "planReminders")) {
    normalized.planReminders = Boolean(input.planReminders);
  }

  if (Object.prototype.hasOwnProperty.call(input, "trainerMessages")) {
    normalized.trainerMessages = Boolean(input.trainerMessages);
  }

  const shareProgress = input.shareProgress;
  if (shareProgress === "trainer" || shareProgress === "private") {
    normalized.shareProgress = shareProgress;
  }

  if (Object.prototype.hasOwnProperty.call(input, "smsReminders")) {
    normalized.smsReminders = Boolean(input.smsReminders);
  }

  return normalized;
}

export function defaultRoleSettings(role: AppRole) {
  if (role === "ADMIN") return defaultAdminSettings();
  if (role === "PT") return defaultTrainerSettings();
  return defaultClientSettings();
}
