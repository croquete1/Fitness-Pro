// src/app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { syncUserProfile } from '@/lib/profileSync';
import { isGuardErr, requireUserGuard } from '@/lib/api-guards';
import { checkUsernameAvailability, validateUsernameCandidate } from '@/lib/username';

type Body = {
  name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  username?: string | null;
  phone?: string | null;
};

export async function PATCH(req: Request) {
  const guard = await requireUserGuard();
  if (isGuardErr(guard)) return guard.response;

  const sb = createServerClient();

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
  }

  const patch: Record<string, any> = {};
  const privatePatch: Record<string, any> = {};

  if (body.name !== undefined) {
    const value = body.name == null ? null : String(body.name).trim();
    patch.name = value;
  }

  if (body.bio !== undefined) {
    const value = body.bio == null ? null : String(body.bio).trim();
    patch.bio = value;
  }

  if (body.avatar_url !== undefined) {
    const value = body.avatar_url == null ? null : String(body.avatar_url).trim();
    patch.avatar_url = value && value.length ? value : null;
  }

  if (body.phone !== undefined) {
    const value = body.phone == null ? null : String(body.phone).trim();
    privatePatch.phone = value && value.length ? value : null;
  }

  if (body.username !== undefined) {
    const raw = body.username;
    if (raw == null || String(raw).trim() === '') {
      patch.username = null;
    } else {
      const validationResult = validateUsernameCandidate(String(raw));
      if (!validationResult.ok) {
        const reason = 'reason' in validationResult ? validationResult.reason : 'invalid';
        return NextResponse.json(
          { ok: false, error: 'INVALID_USERNAME', reason },
          { status: 400 },
        );
      }

      const normalized = validationResult.normalized;
      const availability = await checkUsernameAvailability(sb, normalized, {
        excludeUserId: guard.me.id,
      });

      if (!availability.ok) {
        const reason = 'reason' in availability ? availability.reason : 'ERROR';
        const status = 'status' in availability ? availability.status : undefined;
        return NextResponse.json(
          { ok: false, error: reason },
          { status: status ?? 500 },
        );
      }

      if (!availability.available) {
        return NextResponse.json({ ok: false, error: 'USERNAME_TAKEN' }, { status: 409 });
      }

      patch.username = normalized;
    }
  }

  if (!Object.keys(patch).length && !Object.keys(privatePatch).length) {
    return NextResponse.json({ ok: true });
  }

  if (Object.keys(patch).length) {
    const result = await syncUserProfile(sb, guard.me.id, patch);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }
  }

  if (Object.keys(privatePatch).length) {
    const { error } = await sb
      .from('profile_private')
      .upsert({ user_id: guard.me.id, ...privatePatch }, { onConflict: 'user_id' });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}
