// src/app/api/pt/scheduler/meta/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

/**
 * GET /api/pt/scheduler/meta
 * Devolve meta-informação para o agendador do PT:
 * - locais do PT (pt_locations)
 * - folgas/bloqueios (pt_days_off)
 * Aceita ?trainerId=... se o caller for ADMIN.
 */
export async function GET(req: Request): Promise<Response> {
  // 1) Auth
  const me = await getSessionUserSafe();
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole(me.role);
  if (role !== 'PT' && role !== 'ADMIN') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 2) Se ADMIN, pode consultar meta de outro treinador via query param
  const url = new URL(req.url);
  const trainerIdParam = url.searchParams.get('trainerId');
  const trainerId = role === 'ADMIN' && trainerIdParam ? trainerIdParam : me.id;

  const sb = createServerClient();

  try {
    // 3) Locais do PT
    const { data: locations, error: locErr } = await sb
      .from('pt_locations' as any)
      .select('id, trainer_id, name, address, city, created_at')
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false });

    if (locErr) {
      return NextResponse.json({ ok: false, error: locErr.message }, { status: 500 });
    }

    // 4) Folgas / bloqueios do PT
    const { data: daysOff, error: offErr } = await sb
      .from('pt_days_off' as any)
      .select('id, trainer_id, date, start_time, end_time, reason, created_at')
      .eq('trainer_id', trainerId)
      .order('date', { ascending: true });

    if (offErr) {
      return NextResponse.json({ ok: false, error: offErr.message }, { status: 500 });
    }

    // 5) Payload final
    return NextResponse.json({
      ok: true,
      trainerId,
      locations: locations ?? [],
      days_off: daysOff ?? [],
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'unexpected_error' }, { status: 500 });
  }
}
