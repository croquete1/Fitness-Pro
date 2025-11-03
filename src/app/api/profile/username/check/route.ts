import { NextResponse } from 'next/server';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { isGuardErr, requireUserGuard } from '@/lib/api-guards';
import { checkUsernameAvailability, isReservedUsername, validateUsernameCandidate } from '@/lib/username';

export async function GET(req: Request) {
  const guard = await requireUserGuard();
  if (isGuardErr(guard)) return guard.response;

  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get('q') ?? searchParams.get('u') ?? '').trim();

  const validationResult = validateUsernameCandidate(raw);
  if (!validationResult.ok) {
    const reason = 'reason' in validationResult ? validationResult.reason : 'invalid';
    return NextResponse.json({ available: false, reason });
  }

  const sb = tryCreateServerClient();
  const normalized = validationResult.normalized;

  if (!sb) {
    const available = !isReservedUsername(normalized);
    return NextResponse.json({
      ok: true,
      available,
      normalized,
      source: 'fallback' as const,
      reason: available ? undefined : 'reserved',
    });
  }

  const availability = await checkUsernameAvailability(sb, normalized, {
    excludeUserId: guard.me.id,
  });

  if (!availability.ok) {
    const reason = 'reason' in availability ? availability.reason : 'ERROR';
    const status = 'status' in availability ? availability.status : undefined;
    return NextResponse.json({ ok: false, available: false, reason, source: 'supabase' as const }, { status: status ?? 500 });
  }

  return NextResponse.json({
    available: availability.available,
    normalized,
    ok: true,
    source: 'supabase' as const,
    reason: availability.available ? undefined : 'taken',
  });
}
