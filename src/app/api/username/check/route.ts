// src/app/api/username/check/route.ts
import { NextResponse } from 'next/server';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { isReservedUsername, normalizeUsername, validateUsernameCandidate } from '@/lib/username';

const MAX_LENGTH = 20;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get('u') || '').trim();

  const validation = validateUsernameCandidate(raw);
  if (!validation.ok || validation.normalized.length > MAX_LENGTH) {
    return NextResponse.json({ ok: true, available: false, reason: 'INVALID_OR_RESERVED', source: 'supabase' });
  }

  if (isReservedUsername(validation.normalized)) {
    return NextResponse.json({ ok: true, available: false, reason: 'INVALID_OR_RESERVED', source: 'supabase' });
  }

  const client = tryCreateServerClient();
  const normalized = normalizeUsername(raw);

  if (!client) {
    return NextResponse.json({ ok: true, available: true, source: 'fallback', normalized });
  }

  const uname = normalized;

  const [usersResponse, profilesResponse] = await Promise.all([
    client.from('users').select('*', { count: 'exact', head: true }).ilike('username', uname),
    client.from('profiles').select('*', { count: 'exact', head: true }).ilike('username', uname),
  ]);

  if (usersResponse.error || profilesResponse.error) {
    const error = usersResponse.error ?? profilesResponse.error;
    return NextResponse.json(
      { ok: false, available: false, source: 'supabase', reason: error?.message ?? 'UNKNOWN' },
      { status: 500 },
    );
  }

  const taken = (usersResponse.count ?? 0) > 0 || (profilesResponse.count ?? 0) > 0;

  return NextResponse.json({ ok: true, available: !taken, source: 'supabase', normalized });
}
