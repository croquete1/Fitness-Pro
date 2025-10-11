import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { syncUserProfile } from '@/lib/profileSync';
import { checkUsernameAvailability, validateUsernameCandidate } from '@/lib/username';

type SessionUser = { id?: string; email?: string | null; role?: string | null };
type SessionLike =
  | ({
      id?: string;
      email?: string | null;
      name?: string | null;
      role?: string | null;
      user?: SessionUser;
    } & Record<string, unknown>)
  | null;

type Body = {
  name?: unknown;
  phone?: unknown;
  birth_date?: unknown;
  avatar_url?: unknown;
  bio?: unknown;
  username?: unknown;
};

function ensureDate(value: unknown) {
  if (value == null) return null;
  const date = String(value).trim();
  if (!date) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;
}

function ensureString(value: unknown) {
  if (value == null) return null;
  const str = String(value).trim();
  return str.length ? str : null;
}

async function ensureAuth() {
  const session = (await getSessionUserSafe()) as SessionLike;
  const user = session?.user;
  if (!user?.id) {
    return { error: new NextResponse('Unauthorized', { status: 401 }) } as const;
  }
  return { session, userId: user.id } as const;
}

export async function GET() {
  const auth = await ensureAuth();
  if ('error' in auth) return auth.error;

  const sb = createServerClient();
  const { session, userId } = auth;

  const [userRow, profileRow, privateRow] = await Promise.all([
    sb
      .from('users')
      .select('email,name,username,avatar_url,role')
      .eq('id', userId)
      .maybeSingle(),
    sb
      .from('profiles')
      .select('name,username,bio,avatar_url,birthdate')
      .eq('id', userId)
      .maybeSingle(),
    sb
      .from('profile_private')
      .select('phone')
      .eq('user_id', userId)
      .maybeSingle(),
  ]);

  const firstError = userRow.error ?? profileRow.error ?? privateRow.error;
  if (firstError) {
    if (String(firstError.code) !== 'PGRST116') {
      return NextResponse.json({ ok: false, error: firstError.message ?? 'UNEXPECTED_ERROR' }, { status: 500 });
    }
  }

  const profile = profileRow.data ?? null;
  const user = userRow.data ?? null;
  const priv = (privateRow.data ?? null) as { phone?: string | null } | null;

  const payload = {
    id: userId,
    email: user?.email ?? session?.email ?? null,
    role: user?.role ?? session?.role ?? session?.user?.role ?? null,
    name: profile?.name ?? user?.name ?? session?.name ?? null,
    username: profile?.username ?? user?.username ?? null,
    bio: profile?.bio ?? null,
    avatar_url: profile?.avatar_url ?? user?.avatar_url ?? null,
    birth_date: profile?.birthdate ?? null,
    phone: priv?.phone ?? null,
  };

  return NextResponse.json({ ok: true, profile: payload });
}

async function handleUpdate(req: Request) {
  const auth = await ensureAuth();
  if ('error' in auth) return auth.error;

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
  }

  const sb = createServerClient();
  const { userId } = auth;

  const patch: Record<string, unknown> = {};
  const privatePatch: Record<string, unknown> = {};
  const responsePatch: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const value = ensureString(body.name);
    patch.name = value;
    responsePatch.name = value ?? null;
  }

  if (body.bio !== undefined) {
    const value = ensureString(body.bio);
    patch.bio = value;
    responsePatch.bio = value ?? null;
  }

  if (body.avatar_url !== undefined) {
    const value = ensureString(body.avatar_url);
    patch.avatar_url = value;
    responsePatch.avatar_url = value ?? null;
  }

  if (body.birth_date !== undefined) {
    const value = ensureDate(body.birth_date);
    if (value === undefined) {
      return NextResponse.json({ ok: false, error: 'INVALID_DATE' }, { status: 400 });
    }
    patch.birth_date = value;
    responsePatch.birth_date = value ?? null;
  }

  if (body.phone !== undefined) {
    const raw = body.phone == null ? null : String(body.phone).trim();
    const value = raw && raw.length ? raw : null;
    privatePatch.phone = value;
    responsePatch.phone = value;
  }

  if (body.username !== undefined) {
    const raw = body.username;
    if (raw == null || String(raw).trim() === '') {
      patch.username = null;
      responsePatch.username = null;
    } else {
      const validationResult = validateUsernameCandidate(String(raw));
      if (!validationResult.ok) {
        const reason = 'reason' in validationResult ? validationResult.reason : 'invalid';
        return NextResponse.json({ ok: false, error: 'INVALID_USERNAME', reason }, { status: 400 });
      }

      const normalized = validationResult.normalized;
      const availability = await checkUsernameAvailability(sb, normalized, { excludeUserId: userId });
      if (!availability.ok) {
        const reason = 'reason' in availability ? availability.reason : 'ERROR';
        const status = 'status' in availability ? availability.status : undefined;
        return NextResponse.json({ ok: false, error: reason }, { status: status ?? 500 });
      }

      if (!availability.available) {
        return NextResponse.json({ ok: false, error: 'USERNAME_TAKEN' }, { status: 409 });
      }

      patch.username = normalized;
      responsePatch.username = normalized;
    }
  }

  if (!Object.keys(patch).length && !Object.keys(privatePatch).length) {
    return NextResponse.json({ ok: true, profile: { id: userId } });
  }

  if (Object.keys(patch).length) {
    const result = await syncUserProfile(sb, userId, patch);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error ?? 'UPDATE_FAILED' }, { status: 400 });
    }
  }

  if (Object.keys(privatePatch).length) {
    const { error } = await sb
      .from('profile_private')
      .upsert({ user_id: userId, ...privatePatch }, { onConflict: 'user_id' });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message ?? 'UPDATE_FAILED' }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true, profile: { id: userId, ...responsePatch } });
}

export async function PUT(req: Request) {
  return handleUpdate(req);
}

export async function PATCH(req: Request) {
  return handleUpdate(req);
}
