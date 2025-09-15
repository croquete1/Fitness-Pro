// src/app/api/pt/sessions/check/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

/**
 * GET /api/pt/sessions/check?start=...&end=...&trainerId=...&excludeSessionId=...
 * Verifica disponibilidade do treinador entre start e end.
 * - start/end: ISO string
 * - trainerId (opcional): apenas permitido para ADMIN; caso contrário usa o próprio PT
 * - excludeSessionId (opcional): ignora uma sessão específica (edição)
 */
export async function GET(req: Request): Promise<Response> {
  // Auth
  const me = await getSessionUserSafe();
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole(me.role);
  if (role !== 'PT' && role !== 'ADMIN') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const url = new URL(req.url);
  const startStr = url.searchParams.get('start');
  const endStr = url.searchParams.get('end');
  const trainerIdParam = url.searchParams.get('trainerId');
  const excludeSessionId = url.searchParams.get('excludeSessionId') ?? null;

  if (!startStr || !endStr) {
    return NextResponse.json(
      { ok: false, error: 'Missing start or end ISO parameters' },
      { status: 400 }
    );
  }

  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
    return NextResponse.json(
      { ok: false, error: 'Invalid start/end range' },
      { status: 400 }
    );
  }

  // ADMIN pode consultar outro trainer; PT só o seu
  const trainerId = role === 'ADMIN' && trainerIdParam ? trainerIdParam : me.id;

  const sb = createServerClient();

  // Janela diária para otimizar query
  const dayStart = new Date(start); dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(start); dayEnd.setHours(23, 59, 59, 999);

  try {
    // 1) Sessões marcadas do treinador no dia
    const { data: sessions, error: sessErr } = await sb
      .from('sessions' as any)
      .select('id, trainer_id, client_id, scheduled_at, duration_min')
      .eq('trainer_id', trainerId)
      .gte('scheduled_at', dayStart.toISOString())
      .lte('scheduled_at', dayEnd.toISOString());

    if (sessErr) {
      return NextResponse.json({ ok: false, error: sessErr.message }, { status: 500 });
    }

    // 2) Folgas do treinador nesse dia
    const yyyy = String(start.getFullYear()).padStart(4, '0');
    const mm = String(start.getMonth() + 1).padStart(2, '0');
    const dd = String(start.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const { data: daysOff, error: offErr } = await sb
      .from('pt_days_off' as any)
      .select('id, date, start_time, end_time, reason')
      .eq('trainer_id', trainerId)
      .eq('date', dateStr);

    if (offErr) {
      return NextResponse.json({ ok: false, error: offErr.message }, { status: 500 });
    }

    // Helpers
    const overlaps = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) =>
      aStart < bEnd && bStart < aEnd;

    // Conflitos com sessões
    const sessionConflicts =
      (sessions ?? [])
        .filter((s: any) => (excludeSessionId ? s.id !== excludeSessionId : true))
        .filter((s: any) => {
          const sStart = new Date(s.scheduled_at);
          const dur = Number(s.duration_min ?? 60);
          const sEnd = new Date(sStart.getTime() + dur * 60 * 1000);
          return overlaps(start, end, sStart, sEnd);
        });

    // Conflitos com folgas (usa hora local do PT/servidor)
    const dayOffConflicts =
      (daysOff ?? []).filter((d: any) => {
        // d.start_time e d.end_time no formato 'HH:MM' (assumido)
        const [sh, sm] = String(d.start_time ?? '00:00').split(':').map(Number);
        const [eh, em] = String(d.end_time ?? '23:59').split(':').map(Number);
        const offStart = new Date(dayStart); offStart.setHours(sh || 0, sm || 0, 0, 0);
        const offEnd = new Date(dayStart); offEnd.setHours(eh || 23, em || 59, 59, 999);
        return overlaps(start, end, offStart, offEnd);
      });

    const available = sessionConflicts.length === 0 && dayOffConflicts.length === 0;

    return NextResponse.json({
      ok: true,
      trainerId,
      start: start.toISOString(),
      end: end.toISOString(),
      available,
      conflicts: {
        sessions: sessionConflicts,
        days_off: dayOffConflicts,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'unexpected_error' }, { status: 500 });
  }
}
