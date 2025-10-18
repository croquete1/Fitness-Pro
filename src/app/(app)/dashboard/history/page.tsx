export const dynamic = 'force-dynamic';

import { randomUUID } from 'crypto';
import { redirect } from 'next/navigation';
import SessionHistoryClient from './SessionHistoryClient';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { toAppRole, type AppRole } from '@/lib/roles';
import { getSampleSessionHistory } from '@/lib/fallback/history';
import type { SessionHistoryDataset, SessionHistoryRow, SessionHistoryPerson } from '@/lib/history/types';

function cleanName(value: any): string {
  const candidates = [
    value?.name,
    value?.full_name,
    value?.display_name,
    value?.username,
    value?.user_name,
    value?.email,
    value?.user_email,
  ];
  for (const candidate of candidates) {
    if (candidate && String(candidate).trim()) {
      return String(candidate);
    }
  }
  const id = value?.id ?? value?.user_id ?? value?.userId ?? null;
  return id ? String(id) : 'Utilizador';
}

function toPerson(raw: any, fallbackId?: string | number | null): SessionHistoryPerson | null {
  if (!raw && !fallbackId) return null;
  const id = raw?.id ?? raw?.user_id ?? raw?.userId ?? fallbackId;
  if (!id) return null;
  const email = raw?.email ?? raw?.user_email ?? raw?.contact_email ?? null;
  return {
    id: String(id),
    name: cleanName(raw ?? { id }),
    email: email ? String(email) : null,
  };
}

async function loadSessionHistory(userId: string, role: AppRole): Promise<{ data: SessionHistoryDataset; supabase: boolean }> {
  const sb = tryCreateServerClient();
  if (!sb) {
    return { data: getSampleSessionHistory(), supabase: false };
  }

  try {
    let query = sb
      .from('sessions')
      .select(
        '*,' +
          'trainer:users!sessions_trainer_id_fkey(id,name,email),' +
          'client:users!sessions_client_id_fkey(id,name,email)',
      )
      .order('scheduled_at', { ascending: false })
      .limit(400);

    if (role === 'PT') {
      query = query.eq('trainer_id', userId);
    } else if (role === 'CLIENT') {
      query = query.eq('client_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows: SessionHistoryRow[] = (data ?? []).map((row: any) => {
      const scheduledAt = row.scheduled_at ?? null;
      const startAt = row.start_at ?? row.start_time ?? scheduledAt;
      const endAt = row.end_at ?? row.end_time ?? null;
      const durationRaw = row.duration_min ?? row.durationMinutes ?? null;
      const durationMin =
        typeof durationRaw === 'number'
          ? durationRaw
          : durationRaw == null
          ? null
          : Number.isFinite(Number(durationRaw))
          ? Number(durationRaw)
          : null;
      const status = row.status ?? row.session_status ?? null;
      const attendance = row.client_attendance_status ?? row.attendance_status ?? status ?? null;
      const trainer = toPerson(row.trainer, row.trainer_id ?? row.pt_id ?? null);
      const client = toPerson(row.client, row.client_id ?? row.user_id ?? null);

      return {
        id: String(row.id ?? randomUUID()),
        scheduledAt,
        startAt,
        endAt,
        durationMin,
        status,
        attendance,
        location: row.location ?? row.place ?? null,
        notes: row.notes ?? row.note ?? null,
        trainer,
        client,
      } satisfies SessionHistoryRow;
    });

    return {
      data: {
        generatedAt: new Date().toISOString(),
        rows,
      },
      supabase: true,
    };
  } catch (error) {
    console.warn('[history] supabase query falhou, a usar fallback', error);
    return { data: getSampleSessionHistory(), supabase: false };
  }
}

export default async function HistoryPage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const role = toAppRole(session.user.role) ?? 'CLIENT';
  const { data, supabase } = await loadSessionHistory(session.user.id, role);
  const viewerName = session.user.name ?? session.user.email ?? null;

  return <SessionHistoryClient data={data} role={role} supabase={supabase} viewerName={viewerName} />;
}
