// src/app/api/pt/folgas/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';

/** GET /api/pt/folgas
 *  - PT: devolve as próprias folgas
 *  - ADMIN: pode filtrar por ?trainerId, senão devolve as suas (se também tiver login “normal”)
 */
export async function GET(req: Request): Promise<Response> {
  const me = await getSessionUserSafe();
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole(me.role);
  if (role !== 'PT' && role !== 'ADMIN') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const url = new URL(req.url);
  const trainerIdParam = url.searchParams.get('trainerId');
  const trainerId = role === 'ADMIN' && trainerIdParam ? trainerIdParam : me.id;

  const sb = createServerClient();

  try {
    const { data, error } = await sb
      .from('pt_days_off' as any)
      .select('id, trainer_id, date, start_time, end_time, reason, created_at')
      .eq('trainer_id', trainerId)
      .order('date', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ ok: true, items: data ?? [] });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'fetch_failed' },
      { status: 500 }
    );
  }
}

/** POST /api/pt/folgas
 *  Body: { date: string(YYYY-MM-DD), start_time?: string(HH:MM), end_time?: string(HH:MM), reason?: string, trainerId?: string(ADMIN) }
 *  - PT: cria folga para si próprio
 *  - ADMIN: pode criar para qualquer trainerId (ou para si se omitir)
 */
export async function POST(req: Request): Promise<Response> {
  const me = await getSessionUserSafe();
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole(me.role);
  if (role !== 'PT' && role !== 'ADMIN') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const sb = createServerClient();

  type Body = {
    date?: string;
    start_time?: string | null;
    end_time?: string | null;
    reason?: string | null;
    trainerId?: string; // só considerado para ADMIN
  };

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 });
  }

  if (!body?.date) {
    return NextResponse.json({ ok: false, error: 'date_required' }, { status: 400 });
  }

  const targetTrainerId = role === 'ADMIN' && body.trainerId ? body.trainerId : me.id;

  try {
    const { data, error } = await sb
      .from('pt_days_off' as any)
      .insert({
        trainer_id: targetTrainerId,
        date: body.date,
        start_time: body.start_time ?? null,
        end_time: body.end_time ?? null,
        reason: body.reason ?? null,
      })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'insert_failed' },
      { status: 500 }
    );
  }
}
