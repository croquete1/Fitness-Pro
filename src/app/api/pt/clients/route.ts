// src/app/api/pt/clients/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const sb = createServerClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user?.id) return NextResponse.json({ ok:false, error:'UNAUTHENTICATED' }, { status:401 });
  const role = toAppRole((auth.user as any)?.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') return NextResponse.json({ ok:false, error:'FORBIDDEN' }, { status:403 });

  const url = new URL(req.url);
  const search = (url.searchParams.get('q') || '').trim().toLowerCase();

  const ids = new Set<string>();
  try {
    const { data: p } = await sb.from('training_plans').select('client_id').eq('trainer_id', auth.user.id);
    (p ?? []).forEach((r:any)=>r?.client_id && ids.add(r.client_id));
  } catch {}
  try {
    const { data: s } = await sb.from('sessions').select('client_id').eq('trainer_id', auth.user.id);
    (s ?? []).forEach((r:any)=>r?.client_id && ids.add(r.client_id));
  } catch {}

  let rows:any[] = [];
  if (ids.size) {
    const { data } = await sb.from('users').select('id,name,email').in('id', Array.from(ids));
    rows = data ?? [];
  }

  // filtrar no servidor (leve)
  if (search) {
    rows = rows.filter((u:any) => String(u.name||'').toLowerCase().includes(search) || String(u.email||'').toLowerCase().includes(search));
  }

  return NextResponse.json({ ok:true, items: rows.map((u:any)=>({ id:u.id, label: u.name ?? u.email ?? u.id, email: u.email ?? '' })) });
}
