// src/app/api/username/check/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

const RE = /^[a-z0-9._-]{3,20}$/i;
const RESERVED = new Set(['admin','root','support','fitness','user']);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const u = (searchParams.get('u') || '').trim();

  if (!RE.test(u) || RESERVED.has(u.toLowerCase())) {
    return NextResponse.json({ ok: true, available: false, reason: 'INVALID_OR_RESERVED' });
  }

  const sb = createServerClient();
  const uname = u.toLowerCase();

  // tentar em users.username (case-insensitive)
  const { count: cu } = await sb
    .from('users')
    .select('*', { count: 'exact', head: true })
    .ilike('username', uname);

  if ((cu ?? 0) > 0) {
    return NextResponse.json({ ok: true, available: false });
  }

  // fallback profiles.username
  const { count: cp } = await sb
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .ilike('username', uname);

  return NextResponse.json({ ok: true, available: (cp ?? 0) === 0 });
}
