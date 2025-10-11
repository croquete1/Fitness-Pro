// src/app/api/me/settings/preferences/route.ts
import { NextResponse } from 'next/server';
import { isGuardErr, requireUserGuard } from '@/lib/api-guards';
import { createServerClient } from '@/lib/supabaseServer';
import { saveProfilePrivate } from '@/lib/profilePrivate';
import type { AppRole } from '@/lib/roles';
import {
  normalizeAdminSettings,
  normalizeClientSettings,
  normalizeTrainerSettings,
} from '@/app/(app)/dashboard/settings/settings.defaults';

type Body = {
  language?: unknown;
  theme?: unknown;
  notifications?: {
    email?: unknown;
    push?: unknown;
    sms?: unknown;
    summary?: unknown;
  };
  roleSettings?: Record<string, unknown> | null;
};

const THEMES = new Set(['system', 'light', 'dark']);
const SUMMARIES = new Set(['daily', 'weekly', 'monthly', 'never']);

function roleKey(role: AppRole) {
  if (role === 'ADMIN') return 'admin';
  if (role === 'PT') return 'trainer';
  return 'client';
}

function ensureObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export async function PATCH(req: Request) {
  const guard = await requireUserGuard();
  if (isGuardErr(guard)) return guard.response;

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
  }

  const sb = createServerClient();

  const { data } = await sb
    .from('profile_private' as any)
    .select('settings')
    .eq('user_id', guard.me.id)
    .maybeSingle();

  const currentSettings = ensureObject(data?.settings);
  const nextSettings = { ...currentSettings } as Record<string, unknown> & {
    language?: string;
    theme?: string;
    notifications?: Record<string, unknown>;
    role?: Record<string, unknown>;
  };

  if (body.language !== undefined) {
    const language = String(body.language).trim();
    if (language.length) {
      nextSettings.language = language;
    }
  }

  if (body.theme !== undefined) {
    const theme = String(body.theme);
    if (!THEMES.has(theme)) {
      return NextResponse.json({ ok: false, error: 'INVALID_THEME' }, { status: 400 });
    }
    nextSettings.theme = theme;
  }

  if (body.notifications) {
    const currentNotifications = ensureObject(nextSettings.notifications);
    const nextNotifications = { ...currentNotifications };
    if (body.notifications.email !== undefined) {
      nextNotifications.email = Boolean(body.notifications.email);
    }
    if (body.notifications.push !== undefined) {
      nextNotifications.push = Boolean(body.notifications.push);
    }
    if (body.notifications.sms !== undefined) {
      nextNotifications.sms = Boolean(body.notifications.sms);
    }
    if (body.notifications.summary !== undefined) {
      const summary = String(body.notifications.summary);
      if (!SUMMARIES.has(summary)) {
        return NextResponse.json({ ok: false, error: 'INVALID_SUMMARY' }, { status: 400 });
      }
      nextNotifications.summary = summary;
    }
    nextSettings.notifications = nextNotifications;
  }

  if (body.roleSettings) {
    const roleSettings = ensureObject(nextSettings.role);
    const key = roleKey(guard.me.role);
    const currentRoleSettings = roleSettings[key];

    if (guard.me.role === 'ADMIN') {
      const previous = normalizeAdminSettings(currentRoleSettings);
      roleSettings[key] = normalizeAdminSettings(body.roleSettings, previous);
    } else if (guard.me.role === 'PT') {
      const previous = normalizeTrainerSettings(currentRoleSettings);
      roleSettings[key] = normalizeTrainerSettings(body.roleSettings, previous);
    } else {
      const previous = normalizeClientSettings(currentRoleSettings);
      roleSettings[key] = normalizeClientSettings(body.roleSettings, previous);
    }

    nextSettings.role = roleSettings;
  }

  const result = await saveProfilePrivate(sb, guard.me.id, { settings: nextSettings });
  if (result.ok === false) {
    const { error, status } = result;
    return NextResponse.json({ ok: false, error }, { status });
  }

  return NextResponse.json({ ok: true, settings: nextSettings });
}
