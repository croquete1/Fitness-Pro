import { redirect } from 'next/navigation';
import { startOfWeek, addDays } from 'date-fns';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

import TrainerReschedulesClient, {
  type TrainerRequest,
  type TrainerAgendaSession,
} from './TrainerReschedulesClient';

export const dynamic = 'force-dynamic';

export default async function TrainerReschedulesPage() {
  const session = await getSessionUserSafe();
  const me = session?.user;
  if (!me?.id) redirect('/login');
  const role = toAppRole(me.role);
  if (role !== 'PT' && role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();

  const { data: requestRows } = await sb
    .from('session_requests' as any)
    .select(
      'id, status, session_id, requested_start, requested_end, proposed_start, proposed_end, message, trainer_note, reschedule_note, created_at, updated_at, responded_at, proposed_at, client:users!session_requests_client_id_fkey(id,name,email)'
    )
    .eq('trainer_id', me.id)
    .order('created_at', { ascending: false })
    .limit(100);

  const requests: TrainerRequest[] = (requestRows ?? []).map((row: any) => ({
    id: row.id,
    sessionId: row.session_id ?? null,
    status: row.status ?? 'pending',
    requestedStart: row.requested_start ?? null,
    requestedEnd: row.requested_end ?? null,
    proposedStart: row.proposed_start ?? null,
    proposedEnd: row.proposed_end ?? null,
    message: row.message ?? null,
    trainerNote: row.trainer_note ?? null,
    rescheduleNote: row.reschedule_note ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
    respondedAt: row.responded_at ?? null,
    proposedAt: row.proposed_at ?? null,
    client: row.client
      ? {
          id: row.client.id ?? '',
          name: row.client.name ?? null,
          email: row.client.email ?? null,
        }
      : null,
  }));

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 7);

  const { data: agendaRows } = await sb
    .from('sessions' as any)
    .select(
      'id, scheduled_at, duration_min, location, status, client:users!sessions_client_id_fkey(id,name)'
    )
    .eq('trainer_id', me.id)
    .gte('scheduled_at', weekStart.toISOString())
    .lt('scheduled_at', weekEnd.toISOString())
    .order('scheduled_at', { ascending: true });

  const weeklySessions: TrainerAgendaSession[] = (agendaRows ?? []).map((row: any) => {
    const start = row.scheduled_at ?? null;
    const duration = typeof row.duration_min === 'number' ? row.duration_min : 60;
    const end = start ? new Date(new Date(start).getTime() + duration * 60000).toISOString() : null;
    return {
      id: row.id,
      start,
      end,
      durationMin: duration,
      location: row.location ?? null,
      status: row.status ?? null,
      client: row.client
        ? {
            id: row.client.id ?? '',
            name: row.client.name ?? null,
          }
        : null,
    };
  });

  return (
    <TrainerReschedulesClient
      initialRequests={requests}
      weeklySessions={weeklySessions}
    />
  );
}
