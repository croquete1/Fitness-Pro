import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

export async function GET(req: NextRequest) {
  const sb = createServerClient();
  const one = req.nextUrl.searchParams.get('one') === '1';
  const active = req.nextUrl.searchParams.get('active') === '1';

  try {
    let q = sb.from('motivation_quotes').select('id,text,author,active,created_at').order('created_at', { ascending: false }).limit(one ? 50 : 200);
    if (active) q = q.eq('active', true);
    const { data } = await q;
    const items = data ?? [];
    if (one) {
      const actives = items.filter((i: any) => i.active);
      const pool = actives.length ? actives : items;
      const idx = pool.length ? Math.floor(Math.random() * pool.length) : -1;
      return NextResponse.json({ item: idx >= 0 ? pool[idx] : null });
    }
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionUserSafe();
  const role = toAppRole(session?.user?.role) ?? 'CLIENT';
  if (role !== 'ADMIN') return NextResponse.json({ ok: false }, { status: 403 });

  const { text, author, active = true } = await req.json().catch(() => ({}));
  if (!text) return NextResponse.json({ ok: false }, { status: 400 });

  const sb = createServerClient();
  try {
    await sb.from('motivation_quotes').insert({ text, author: author ?? null, active });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
