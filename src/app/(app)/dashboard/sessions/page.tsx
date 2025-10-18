export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import SessionsClient from './SessionsClient';
import type { ClientSession, SessionRequest } from '@/lib/sessions/types';

export default async function ClientSessionsPage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');

  const sb = createServerClient();
  const { data } = await sb
    .from('sessions' as any)
    .select('id,start_at,end_at,scheduled_at,duration_min,location,notes,status,client_attendance_status,client_attendance_at,trainer:users!sessions_trainer_id_fkey(name,email)')
    .eq('client_id', session.user.id)
    .order('start_at', { ascending: true })
    .limit(200);

  const sessions: ClientSession[] = (data ?? []).map((row: any) => ({
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

  const { data: requestRows } = await sb
    .from('session_requests' as any)
    .select(
      'id, session_id, requested_start, requested_end, proposed_start, proposed_end, status, message, trainer_note, reschedule_note, created_at, updated_at, responded_at, proposed_at, trainer:users!session_requests_trainer_id_fkey(id,name,email)'
    )
    .eq('client_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(80);

  const requests: SessionRequest[] = (requestRows ?? []).map((row: any) => ({
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

  return <SessionsClient initialSessions={sessions} initialRequests={requests} />;
}
