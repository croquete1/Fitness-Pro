import { randomUUID } from 'node:crypto';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { toAppRole, type AppRole } from '@/lib/roles';
import {
  defaultNotificationPreferences,
  defaultRoleSettings,
} from '@/lib/settings/defaults';
import type { AdminSettings, ClientSettings, TrainerSettings } from '@/lib/settings/defaults';
import {
  buildSettingsDashboard,
  type BuildSettingsDashboardOptions,
} from '@/lib/settings/dashboard';
import {
  type SettingsAccountSnapshot,
  type SettingsContext,
  type SettingsDashboardData,
  type SettingsNotificationSnapshot,
  type SettingsSecurityEvent,
  type SettingsSecurityEventType,
} from '@/lib/settings/types';
import { getSettingsDashboardFallback } from '@/lib/fallback/settings';

const DAY_MS = 86_400_000;

type SessionLike = {
  name?: string | null;
  email?: string | null;
  role?: AppRole | string | null;
};

type StoredSettings = {
  language?: string | null;
  theme?: string | null;
  notifications?: Partial<ReturnType<typeof defaultNotificationPreferences>> & {
    updated_at?: string | null;
    delivered_30d?: number | null;
    failed_30d?: number | null;
  };
  role?: Record<string, unknown>;
  security?: {
    mfa_enabled?: boolean;
    password_updated_at?: string | null;
    recovery_codes_remaining?: number | null;
    trusted_devices?: number | null;
  };
};

function parseStoredSettings(value: unknown): StoredSettings | null {
  if (!value) return null;
  if (typeof value === 'object' && value) return value as StoredSettings;
  if (typeof value !== 'string') return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed && typeof parsed === 'object') {
      return parsed as StoredSettings;
    }
  } catch (error) {
    console.warn('[settings-server] parseStoredSettings falhou', error);
  }
  return null;
}

function resolveRoleSettings(role: 'ADMIN', stored: StoredSettings | null): AdminSettings;
function resolveRoleSettings(role: 'PT', stored: StoredSettings | null): TrainerSettings;
function resolveRoleSettings(role: 'CLIENT', stored: StoredSettings | null): ClientSettings;
function resolveRoleSettings(role: AppRole, stored: StoredSettings | null) {
  const base = defaultRoleSettings(role);
  if (!stored?.role) return base;
  const key = role === 'ADMIN' ? 'admin' : role === 'PT' ? 'trainer' : 'client';
  const record = stored.role[key];
  if (record && typeof record === 'object') {
    return { ...base, ...(record as Record<string, unknown>) };
  }
  return base;
}

function toNotificationSnapshot(
  stored: StoredSettings | null,
  defaults: ReturnType<typeof defaultNotificationPreferences>,
): SettingsNotificationSnapshot {
  const payload = stored?.notifications ?? {};
  const summary = typeof payload.summary === 'string' ? payload.summary : defaults.summary;
  const snapshot: SettingsNotificationSnapshot = {
    email: payload.email ?? defaults.email,
    push: payload.push ?? defaults.push,
    sms: payload.sms ?? defaults.sms,
    summary,
    updatedAt: payload.updated_at ?? null,
    totalDeliveries30d: payload.delivered_30d ?? null,
    failedDeliveries30d: payload.failed_30d ?? null,
  };
  return snapshot;
}

function toAccountSnapshot(
  role: AppRole,
  user: any,
  stored: StoredSettings | null,
): SettingsAccountSnapshot {
  const security = stored?.security ?? {};
  const mfaCandidates = [security.mfa_enabled, user?.factor_enabled_at, user?.mfa_enabled];
  const mfaEnabled = mfaCandidates.some((value) => value === true || value === 'true');
  const recoveryCodes = security.recovery_codes_remaining;
  const trustedDevices = security.trusted_devices;
  return {
    createdAt: user?.created_at ?? null,
    lastLoginAt: user?.last_login_at ?? user?.last_sign_in ?? null,
    lastPasswordChangeAt: security.password_updated_at ?? null,
    emailConfirmedAt: user?.email_confirmed_at ?? null,
    mfaEnabled,
    recoveryCodesRemaining:
      typeof recoveryCodes === 'number' ? recoveryCodes : Number.isFinite(recoveryCodes) ? Number(recoveryCodes) : null,
    trustedDevices:
      typeof trustedDevices === 'number'
        ? trustedDevices
        : Number.isFinite(trustedDevices)
          ? Number(trustedDevices)
          : null,
  } satisfies SettingsAccountSnapshot;
}

function mapAuditLogToEvent(row: any): SettingsSecurityEvent {
  const id = String(row.id ?? randomUUID());
  const createdAt = typeof row.created_at === 'string' ? row.created_at : new Date().toISOString();
  const kind = typeof row.kind === 'string' ? row.kind.toUpperCase() : '';
  const action = typeof row.action === 'string' ? row.action.toLowerCase() : '';
  const category = typeof row.category === 'string' ? row.category.toLowerCase() : '';
  const note = row.note ?? null;
  const detailsRaw = row.details ?? row.meta;
  const details = typeof detailsRaw === 'object' && detailsRaw ? (detailsRaw as Record<string, unknown>) : null;

  let type: SettingsSecurityEventType = 'profile_update';
  if (kind.includes('LOGIN_FAILED') || action.includes('login_failed')) {
    type = 'login_failed';
  } else if (kind === 'LOGIN' || action === 'login') {
    type = 'login';
  } else if (kind === 'LOGOUT' || action === 'logout') {
    type = 'logout';
  } else if (kind.includes('PASSWORD') || action.includes('password')) {
    type = 'password_change';
  } else if (kind.includes('MFA') || category.includes('mfa')) {
    type = kind.includes('CHALLENGE') || action.includes('challenge') ? 'mfa_challenge' : 'recovery';
  } else if (category.includes('notification')) {
    type = 'notification_update';
  } else if (category.includes('device')) {
    type = 'device_revoked';
  }

  const status = kind.includes('FAILED') || action.includes('failed') ? 'failed' : 'success';
  const deviceCandidate =
    (details?.device as string | undefined) ||
    (details?.device_name as string | undefined) ||
    (details?.user_agent as string | undefined) ||
    row.user_agent ||
    null;
  const channelCandidate =
    (details?.channel as string | undefined) ||
    (details?.method as string | undefined) ||
    (details?.delivery_channel as string | undefined) ||
    null;
  const locationCandidate =
    (details?.location as string | undefined) ||
    (details?.city && details?.country ? `${details.city}, ${details.country}` : undefined) ||
    null;

  return {
    id,
    type,
    status,
    createdAt,
    note,
    ip: typeof row.ip === 'string' ? row.ip : null,
    device: typeof deviceCandidate === 'string' ? deviceCandidate : null,
    channel: typeof channelCandidate === 'string' ? channelCandidate : null,
    location: typeof locationCandidate === 'string' ? locationCandidate : null,
  } satisfies SettingsSecurityEvent;
}

export async function loadSettingsContext(
  userId: string,
  session?: SessionLike,
): Promise<{ context: SettingsContext; source: 'supabase' | 'fallback' }> {
  const fallback = getSettingsDashboardFallback({
    userId,
    name: session?.name ?? null,
    email: session?.email ?? null,
    role: toAppRole(session?.role) ?? 'CLIENT',
  });

  const sb = tryCreateServerClient();
  if (!sb) {
    return { context: fallback.context, source: 'fallback' };
  }

  try {
    const [userRow, profileRow, privateRow] = await Promise.all([
      sb
        .from('users')
        .select('id,email,name,role,created_at,last_login_at,last_seen_at,email_confirmed_at,raw_app_meta_data,factor_enabled_at')
        .eq('id', userId)
        .maybeSingle(),
      sb
        .from('profiles')
        .select('full_name,name')
        .eq('id', userId)
        .maybeSingle(),
      sb
        .from('profile_private' as any)
        .select('phone,settings,updated_at')
        .eq('user_id', userId)
        .maybeSingle(),
    ]);

    if (userRow.error) throw userRow.error;
    if (profileRow.error) throw profileRow.error;
    if (privateRow.error) throw privateRow.error;

    const stored = parseStoredSettings(privateRow.data?.settings);
    const defaults = defaultNotificationPreferences();
    const notifications = toNotificationSnapshot(stored, defaults);
    if (!notifications.updatedAt && privateRow.data?.updated_at) {
      notifications.updatedAt = privateRow.data.updated_at;
    }

    const role = toAppRole(session?.role ?? userRow.data?.role) ?? 'CLIENT';
    const name = profileRow.data?.full_name ?? profileRow.data?.name ?? userRow.data?.name ?? session?.name ?? undefined;
    const phone = (privateRow.data as any)?.phone ?? null;
    const email = userRow.data?.email ?? session?.email ?? fallback.context.model.email;
    const language = stored?.language ?? 'pt-PT';
    const theme = stored?.theme === 'light' || stored?.theme === 'dark' || stored?.theme === 'system' ? stored.theme : 'system';

    const model: SettingsContext['model'] = {
      id: userId,
      role,
      name: name ?? fallback.context.model.name,
      phone: typeof phone === 'string' ? phone : null,
      email,
      language,
      theme,
      notifications,
    };

    if (role === 'ADMIN') {
      model.adminPreferences = resolveRoleSettings('ADMIN', stored);
    } else if (role === 'PT') {
      model.trainerPreferences = resolveRoleSettings('PT', stored);
    } else {
      model.clientPreferences = resolveRoleSettings('CLIENT', stored);
    }

    const account = toAccountSnapshot(role, userRow.data, stored);

    const context: SettingsContext = {
      model,
      account,
      notifications,
    };

    return { context, source: 'supabase' };
  } catch (error) {
    console.error('[settings-server] falha ao carregar contexto', error);
    return { context: fallback.context, source: 'fallback' };
  }
}

export async function loadSettingsDashboard(
  userId: string,
  options: (BuildSettingsDashboardOptions & { session?: SessionLike; context?: SettingsContext }) | undefined = {},
): Promise<{ data: SettingsDashboardData; context: SettingsContext; source: 'supabase' | 'fallback' }> {
  const rangeDays = Math.max(7, options.rangeDays ?? 30);
  const now = options.now ?? new Date();

  const fallback = getSettingsDashboardFallback({
    userId,
    rangeDays,
    now,
    name: options.session?.name ?? null,
    email: options.session?.email ?? null,
    role: toAppRole(options.session?.role) ?? 'CLIENT',
  });

  let context = options.context ?? null;
  let source: 'supabase' | 'fallback' = 'supabase';

  if (!context) {
    const loaded = await loadSettingsContext(userId, options.session);
    context = loaded.context;
    source = loaded.source;
  }

  const sb = tryCreateServerClient();
  if (!sb || source === 'fallback') {
    return { data: fallback.dashboard, context: context ?? fallback.context, source: 'fallback' };
  }

  try {
    const end = new Date(now.getTime());
    end.setHours(23, 59, 59, 999);
    const start = new Date(end.getTime() - rangeDays * DAY_MS);
    const previousStart = new Date(start.getTime() - rangeDays * DAY_MS);
    const previousEnd = new Date(start.getTime() - 1);

    const [currentLogs, previousLogs] = await Promise.all([
      sb
        .from('audit_log')
        .select('id,created_at,kind,category,action,note,details,meta,ip,user_agent')
        .eq('actor_id', userId)
        .gte('created_at', start.toISOString())
        .order('created_at', { ascending: false })
        .limit(400),
      sb
        .from('audit_log')
        .select('id,created_at,kind,category,action,note,details,meta,ip,user_agent')
        .eq('actor_id', userId)
        .gte('created_at', previousStart.toISOString())
        .lte('created_at', previousEnd.toISOString())
        .order('created_at', { ascending: false })
        .limit(400),
    ]);

    if (currentLogs.error) throw currentLogs.error;
    if (previousLogs.error) throw previousLogs.error;

    const events = (currentLogs.data ?? []).map(mapAuditLogToEvent);
    const previousEvents = (previousLogs.data ?? []).map(mapAuditLogToEvent);

    const dashboard = buildSettingsDashboard(
      {
        account: context.account,
        notifications: context.notifications,
        events,
      },
      { now, rangeDays, previousEvents },
    );

    return { data: dashboard, context, source: 'supabase' };
  } catch (error) {
    console.error('[settings-server] falha ao construir dashboard', error);
    return { data: fallback.dashboard, context: context ?? fallback.context, source: 'fallback' };
  }
}
