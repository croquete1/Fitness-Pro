import { addMinutes, subDays, subHours } from 'date-fns';
import {
  defaultAdminSettings,
  defaultClientSettings,
  defaultNotificationPreferences,
  defaultTrainerSettings,
} from '@/lib/settings/defaults';
import {
  type SettingsContext,
  type SettingsDashboardData,
  type SettingsModel,
  type SettingsNotificationSnapshot,
  type SettingsSecurityEvent,
} from '@/lib/settings/types';
import { buildSettingsDashboard } from '@/lib/settings/dashboard';
import type { AppRole } from '@/lib/roles';

function iso(date: Date): string {
  return date.toISOString();
}

function baseName(role: AppRole): string {
  switch (role) {
    case 'ADMIN':
      return 'Gestor Demo';
    case 'PT':
      return 'Treinador Demo';
    default:
      return 'Cliente Demo';
  }
}

export type SettingsFallbackOptions = {
  userId?: string;
  role?: AppRole;
  name?: string | null;
  email?: string | null;
  now?: Date;
  rangeDays?: number;
};

export function getSettingsDashboardFallback(
  options: SettingsFallbackOptions = {},
): { context: SettingsContext; dashboard: SettingsDashboardData } {
  const now = options.now ?? new Date();
  const role = options.role ?? 'CLIENT';
  const userId = options.userId ?? 'user-fallback-settings';
  const name = options.name ?? baseName(role);
  const email = options.email ?? 'neo-demo@fitnesspro.pt';

  const preferences = defaultNotificationPreferences();
  const notifications: SettingsNotificationSnapshot = {
    ...preferences,
    email: true,
    push: true,
    sms: role !== 'CLIENT',
    updatedAt: iso(subDays(now, 2)),
    totalDeliveries30d: role === 'ADMIN' ? 58 : 24,
    failedDeliveries30d: role === 'ADMIN' ? 3 : 1,
  };

  const model: SettingsModel = {
    id: userId,
    role,
    name,
    phone: '+351 910 000 000',
    email,
    language: 'pt-PT',
    theme: 'system',
    notifications,
    ...(role === 'ADMIN'
      ? { adminPreferences: defaultAdminSettings() }
      : role === 'PT'
        ? { trainerPreferences: defaultTrainerSettings() }
        : { clientPreferences: defaultClientSettings() }),
  };

  const accountSnapshot = {
    createdAt: iso(subDays(now, 180)),
    lastLoginAt: iso(subHours(now, 5)),
    lastPasswordChangeAt: iso(subDays(now, 42)),
    emailConfirmedAt: iso(subDays(now, 170)),
    mfaEnabled: role !== 'CLIENT',
    recoveryCodesRemaining: role === 'ADMIN' ? 8 : 5,
    trustedDevices: 4,
  } satisfies SettingsContext['account'];

  const events: SettingsSecurityEvent[] = [
    {
      id: 'settings-fallback-login-1',
      type: 'login',
      status: 'success',
      createdAt: iso(subHours(now, 3)),
      device: 'MacBook Pro · Safari',
      location: 'Lisboa, PT',
      ip: '188.250.10.22',
      note: 'Sessão iniciada via app web.',
    },
    {
      id: 'settings-fallback-mfa',
      type: 'mfa_challenge',
      status: 'success',
      createdAt: iso(addMinutes(subHours(now, 3), 2)),
      device: 'MacBook Pro · Safari',
      location: 'Lisboa, PT',
      note: 'Código TOTP validado.',
    },
  ];

  const loginYesterday: SettingsSecurityEvent = {
    id: 'settings-fallback-login-2',
    type: 'login',
    status: 'success',
    createdAt: iso(subDays(now, 1)),
    device: 'iPhone 15 · App Neo',
    location: 'Porto, PT',
    note: 'Sessão móvel sincronizada.',
  };

  events.push(loginYesterday);

  events.push(
    {
      id: 'settings-fallback-password',
      type: 'password_change',
      status: 'success',
      createdAt: iso(subDays(now, 12)),
      device: 'MacBook Pro · Safari',
      note: 'Password actualizada após sugestão do sistema.',
    },
    {
      id: 'settings-fallback-login-failure',
      type: 'login_failed',
      status: 'failed',
      createdAt: iso(subDays(now, 7)),
      device: 'Firefox · Windows',
      location: 'Madrid, ES',
      ip: '82.190.45.18',
      note: 'Password incorrecta (tentativa bloqueada).',
    },
    {
      id: 'settings-fallback-digest',
      type: 'notification_update',
      status: 'success',
      createdAt: iso(subDays(now, 2)),
      device: 'MacBook Pro · Safari',
      note: 'Resumo semanal activado.',
    },
    {
      id: 'settings-fallback-recovery',
      type: 'recovery',
      status: 'success',
      createdAt: iso(subDays(now, 20)),
      device: 'Painel Neo',
      note: 'Novos códigos de recuperação gerados.',
    },
  );

  events.push(
    {
      id: 'settings-fallback-device-revoked',
      type: 'device_revoked',
      status: 'success',
      createdAt: iso(subDays(now, 4)),
      device: 'Pixel 7 · Chrome',
      note: 'Sessão antiga removida remotamente.',
    },
  );

  const context: SettingsContext = {
    model,
    account: accountSnapshot,
    notifications,
  };

  const dashboard = buildSettingsDashboard(
    {
      account: context.account,
      notifications: context.notifications,
      events,
    },
    { now, rangeDays: options.rangeDays ?? 30 },
  );

  return { context, dashboard };
}
