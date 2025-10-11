// src/app/api/me/settings/credentials/route.ts
import { NextResponse } from 'next/server';
import { isGuardErr, requireUserGuard } from '@/lib/api-guards';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

type Body = {
  email?: unknown;
  newPassword?: unknown;
  currentPassword?: unknown;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

  const updates: { email?: string; password?: string } = {};

  if (body.email !== undefined) {
    const email = String(body.email).trim();
    if (!isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: 'INVALID_EMAIL' }, { status: 400 });
    }
    updates.email = email;
  }

  let newPassword: string | undefined;
  if (body.newPassword !== undefined) {
    newPassword = String(body.newPassword);
    if (newPassword.length < 8) {
      return NextResponse.json({ ok: false, error: 'WEAK_PASSWORD' }, { status: 400 });
    }
    const currentPassword = body.currentPassword ? String(body.currentPassword) : '';
    if (!currentPassword.length) {
      return NextResponse.json({ ok: false, error: 'MISSING_CURRENT_PASSWORD' }, { status: 400 });
    }
    updates.password = newPassword;
  }

  if (!updates.email && !updates.password) {
    return NextResponse.json({ ok: true });
  }

  const sb = createServerClient();

  const session = await getSessionUserSafe();
  const fallbackEmail = session?.email ?? session?.user?.email ?? null;

  const { data: userRow } = await sb
    .from('users')
    .select('email')
    .eq('id', guard.me.id)
    .maybeSingle();

  const currentEmail = userRow?.email ?? fallbackEmail;

  if (updates.password && (!currentEmail || !body.currentPassword)) {
    return NextResponse.json({ ok: false, error: 'INVALID_CURRENT_PASSWORD' }, { status: 403 });
  }

  if (updates.password && currentEmail) {
    const { error: verifyError } = await sb.auth.signInWithPassword({
      email: currentEmail,
      password: String(body.currentPassword),
    });
    if (verifyError) {
      return NextResponse.json({ ok: false, error: 'INVALID_CURRENT_PASSWORD' }, { status: 403 });
    }
  }

  const { error } = await sb.auth.admin.updateUserById(guard.me.id, updates);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message ?? 'UPDATE_FAILED' }, { status: 400 });
  }

  if (updates.email) {
    await sb.from('users').update({ email: updates.email }).eq('id', guard.me.id);
  }

  return NextResponse.json({ ok: true });
}
