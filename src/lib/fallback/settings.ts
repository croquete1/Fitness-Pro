import {
  defaultAdminSettings,
  defaultClientSettings,
  defaultNotificationPreferences,
  defaultTrainerSettings,
} from '@/lib/settings/defaults';
import { buildSettingsDashboard } from '@/lib/settings/dashboard';
import type { AppRole } from '@/lib/roles';
import {
  type SettingsAccountSnapshot,
  type SettingsContext,
  type SettingsDashboardData,
  type SettingsModel,
  type SettingsNotificationSnapshot,
} from '@/lib/settings/types';

export type SettingsFallbackOptions = {
  userId?: string;
  role?: AppRole;
  name?: string | null;
  email?: string | null;
  now?: Date;
  rangeDays?: number;
};

function resolveName(role: AppRole, provided?: string | null): string {
  if (provided?.trim()) return provided.trim();
  switch (role) {
    case 'ADMIN':
      return 'Gestor';
    case 'PT':
      return 'Treinador';
    default:
      return 'Cliente';
  }
}

function buildNotificationSnapshot(role: AppRole): SettingsNotificationSnapshot {
  const base = defaultNotificationPreferences();
  return {
    email: base.email,
    push: base.push,
    sms: role === 'ADMIN' ? base.sms : false,
    summary: base.summary,
    updatedAt: null,
    totalDeliveries30d: null,
    failedDeliveries30d: null,
  } satisfies SettingsNotificationSnapshot;
}

function buildAccountSnapshot(): SettingsAccountSnapshot {
  return {
    createdAt: null,
    lastLoginAt: null,
    lastPasswordChangeAt: null,
    emailConfirmedAt: null,
    mfaEnabled: false,
    recoveryCodesRemaining: null,
    trustedDevices: null,
  } satisfies SettingsAccountSnapshot;
}

export function getSettingsDashboardFallback(
  options: SettingsFallbackOptions = {},
): { context: SettingsContext; dashboard: SettingsDashboardData } {
  const now = options.now ?? new Date();
  const rangeDays = Math.max(7, Math.round(options.rangeDays ?? 30));
  const role = options.role ?? 'CLIENT';
  const userId = options.userId ?? 'settings-fallback';
  const name = resolveName(role, options.name);
  const email = options.email?.trim() ?? '';

  const notificationSnapshot = buildNotificationSnapshot(role);
  const account = buildAccountSnapshot();

  const model: SettingsModel = {
    id: userId,
    role,
    name,
    phone: null,
    email,
    language: 'pt-PT',
    theme: 'system',
    notifications: {
      email: notificationSnapshot.email,
      push: notificationSnapshot.push,
      sms: notificationSnapshot.sms,
      summary: notificationSnapshot.summary,
    },
  };

  if (role === 'ADMIN') {
    model.adminPreferences = defaultAdminSettings();
  } else if (role === 'PT') {
    model.trainerPreferences = defaultTrainerSettings();
  } else {
    model.clientPreferences = defaultClientSettings();
  }

  const context: SettingsContext = {
    model,
    account,
    notifications: notificationSnapshot,
  };

  const dashboard = buildSettingsDashboard(
    {
      account,
      notifications: notificationSnapshot,
      events: [],
    },
    { now, rangeDays },
  );

  return { context, dashboard };
}
