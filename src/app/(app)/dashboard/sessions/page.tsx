export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import SessionsClient from './SessionsClient';
import type { ClientSession, SessionRequest } from '@/lib/sessions/types';
import { isSkippableSchemaError } from '@/lib/supabase/errors';

export default async function ClientSessionsPage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');

  let supabaseAvailable = false;
  let sessions: ClientSession[] = [];
  let requests: SessionRequest[] = [];

  try {
    const sb = createServerClient();

    const [sessionsResult, requestsResult] = await Promise.all([
      sb
        .from('sessions' as any)
        .select(
          'id,start_at,end_at,scheduled_at,duration_min,location,notes,status,client_attendance_status,client_attendance_at,trainer:users!sessions_trainer_id_fkey(id,name,email)'
        )
        .eq('client_id', session.user.id)
        .order('start_at', { ascending: true })
        .limit(200),
      sb
        .from('session_requests' as any)
        .select(
          'id, session_id, requested_start, requested_end, proposed_start, proposed_end, status, message, trainer_note, reschedule_note, created_at, updated_at, responded_at, proposed_at, trainer:users!session_requests_trainer_id_fkey(id,name,email)'
        )
        .eq('client_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(80),
    ]);

    if (!sessionsResult.error) {
      sessions = (sessionsResult.data ?? []).map((row: any) => ({
        id: row.id,
        startISO: row.start_at ?? row.scheduled_at ?? null,
        endISO: row.end_at ?? null,
        durationMin: row.duration_min ?? null,
        location: row.location ?? null,
        notes: row.notes ?? null,
        trainerId: row.trainer?.id ?? null,
        trainerName: row.trainer?.name ?? null,
        trainerEmail: row.trainer?.email ?? null,
        status: row.status ?? null,
        attendanceStatus: row.client_attendance_status ?? 'pending',
        attendanceAt: row.client_attendance_at ?? null,
      }));
      supabaseAvailable = true;
    } else if (isSkippableSchemaError(sessionsResult.error)) {
      console.warn('[dashboard/sessions] tabela de sessões indisponível, a apresentar dados vazios', sessionsResult.error);
    } else {
      throw sessionsResult.error;
    }

    if (!requestsResult.error) {
      requests = (requestsResult.data ?? []).map((row: any) => ({
        id: row.id,
        sessionId: row.session_id ?? null,
        status: (row.status ?? 'pending') as SessionRequest['status'],
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
        trainer: row.trainer
          ? {
              id: row.trainer.id ?? '',
              name: row.trainer.name ?? null,
              email: row.trainer.email ?? null,
            }
          : null,
      }));
      supabaseAvailable = true;
    } else if (isSkippableSchemaError(requestsResult.error)) {
      console.warn('[dashboard/sessions] pedidos de sessão indisponíveis na instância actual', requestsResult.error);
    } else {
      throw requestsResult.error;
    }
  } catch (error) {
    console.warn('[dashboard/sessions] supabase indisponível', error);
  }

  return (
    <SessionsClient
      initialSessions={sessions}
      initialRequests={requests}
      supabaseAvailable={supabaseAvailable}
    />
  );
}
