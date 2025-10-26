import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';
import { loadAdminPtsScheduleDashboard } from '@/lib/admin/pts-schedule/dashboard';
import type { AdminPtsScheduleSessionView } from '@/lib/admin/pts-schedule/types';
import { getAdminPtsScheduleFallback } from '@/lib/fallback/admin-pts-schedule';
import { supabaseConfigErrorResponse, supabaseFallbackJson } from '@/lib/supabase/responses';
import { tryCreateServerClient } from '@/lib/supabaseServer';

const CreateBody = z.object({
  trainer_id: z.string().min(1),
  client_id: z.string().min(1),
  start_time: z.string().min(1),
  end_time: z.string().min(1),
  status: z.enum(['scheduled', 'done', 'cancelled', 'confirmed']).default('scheduled'),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

function matchesQuery(row: AdminPtsScheduleSessionView, query: string): boolean {
  if (!query) return true;
  const haystack = [
    row.trainerName,
    row.clientName,
    row.statusLabel,
    row.location ?? '',
    row.notes ?? '',
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

export async function GET(req: Request) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const now = new Date();
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status') ?? 'all';
  const query = (searchParams.get('q') ?? '').trim().toLowerCase();

  const sb = tryCreateServerClient();
  const dataset = sb
    ? await loadAdminPtsScheduleDashboard(sb, { now }).catch((error) => {
        console.error('[admin/pts-schedule] GET fallback', error);
        return null;
      })
    : null;

  if (!dataset) {
    const fallback = getAdminPtsScheduleFallback(now);
    const rows = fallback.sessions
      .filter((session) => (statusFilter === 'all' ? true : session.status === statusFilter))
      .filter((session) => matchesQuery(session, query))
      .map((session) => ({
        id: session.id,
        start_time: session.start,
        end_time: session.end,
        status: session.status,
        trainer_id: session.trainerId,
        trainer_name: session.trainerName,
        client_id: session.clientId,
        client_name: session.clientName,
        location: session.location,
        notes: session.notes,
      }));
    return supabaseFallbackJson({ ok: true, source: 'fallback', rows, count: rows.length, generatedAt: fallback.generatedAt });
  }

  const rows = dataset.sessions
    .filter((session) => (statusFilter === 'all' ? true : session.status === statusFilter))
    .filter((session) => matchesQuery(session, query))
    .map((session) => ({
      id: session.id,
      start_time: session.start,
      end_time: session.end,
      status: session.status,
      trainer_id: session.trainerId,
      trainer_name: session.trainerName,
      client_id: session.clientId,
      client_name: session.clientName,
      location: session.location,
      notes: session.notes,
    }));

  return NextResponse.json(
    {
      ok: true,
      source: 'supabase' as const,
      rows,
      count: rows.length,
      generatedAt: dataset.generatedAt,
      updatedAt: dataset.updatedAt,
    },
    { headers: { 'cache-control': 'no-store' } },
  );
}

export async function POST(req: Request) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  try {
    const sb = tryCreateServerClient();
    if (!sb) {
      return supabaseFallbackJson(
        { ok: false, message: 'Servidor não está configurado.' },
        { status: 503 },
      );
    }

    const payload = CreateBody.parse(await req.json());

    const { data, error } = await sb
      .from('sessions')
      .insert({
        trainer_id: payload.trainer_id,
        client_id: payload.client_id,
        start_time: payload.start_time,
        end_time: payload.end_time,
        status: payload.status,
        location: payload.location ?? null,
        notes: payload.notes ?? null,
      })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, id: data?.id }, { headers: { 'cache-control': 'no-store' } });
  } catch (error: any) {
    const config = supabaseConfigErrorResponse(error);
    if (config) return config;
    const message = typeof error?.message === 'string' ? error.message : 'Não foi possível criar a sessão.';
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
