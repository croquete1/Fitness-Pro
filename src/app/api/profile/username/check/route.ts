import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { isGuardErr, requireUserGuard } from '@/lib/api-guards';
import { checkUsernameAvailability, validateUsernameCandidate } from '@/lib/username';

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

  const sb = createServerClient();
  const normalized = validationResult.normalized;
  const availability = await checkUsernameAvailability(sb, normalized, {
    excludeUserId: guard.me.id,
  });

  if (!availability.ok) {
    const reason = 'reason' in availability ? availability.reason : 'ERROR';
    const status = 'status' in availability ? availability.status : undefined;
    return NextResponse.json({ available: false, reason }, { status: status ?? 500 });
  }

  return NextResponse.json({
    available: availability.available,
    normalized,
    reason: availability.available ? undefined : 'taken',
  });
}
