import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

type ActivityItem = {
  id: string;
  when: string;          // ISO
  title: string;         // ex.: "Sessão"
  subtitle?: string;     // ex.: "Ginásio X" ou "com PT Y"
  kind?: 'session';      // reservado para futuros tipos
};

export async function GET(): Promise<Response> {
  const me = await getSessionUserSafe();
  const meId = me?.id ?? null;
  if (!meId) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole(me.role) ?? 'CLIENT';
  const sb = createServerClient();

  // Base query — sem genéricos (evita os erros "Expected 2 type arguments")
  let q = sb
    .from('sessions')
    .select('id, scheduled_at, notes, location, trainer_id, client_id')
    .order('scheduled_at', { ascending: false })
    .limit(10);

  // Escopo por role
  if (role === 'PT') {
    q = q.eq('trainer_id', meId);
  } else if (role === 'CLIENT') {
    q = q.eq('client_id', meId);
  } // ADMIN vê tudo

  const { data, error } = await q;

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const items: ActivityItem[] = (data ?? []).map((s: any) => ({
    id: s.id,
    when: s.scheduled_at ? new Date(s.scheduled_at).toISOString() : new Date().toISOString(),
    title: s.notes?.trim?.() || 'Sessão',
    subtitle: s.location || undefined,
    kind: 'session',
  }));

  return NextResponse.json({ ok: true, items });
}
