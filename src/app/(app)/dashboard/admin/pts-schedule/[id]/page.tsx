import { notFound } from 'next/navigation';

import PageHeader from '@/components/ui/PageHeader';
import SessionFormClient from '../SessionFormClient';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { getAdminPtsScheduleFallback } from '@/lib/fallback/admin-pts-schedule';

export const dynamic = 'force-dynamic';

function mapRow(row: any) {
  const start = row.start_time ?? row.start ?? row.starts_at ?? row.begin_at ?? row.begin ?? null;
  const end = row.end_time ?? row.end ?? row.ends_at ?? row.finish_at ?? row.finish ?? null;
  const trainer = row.trainer_id ?? row.pt_id ?? null;
  const client = row.client_id ?? row.member_id ?? null;

  return {
    id: String(row.id),
    trainer_id: trainer ? String(trainer) : '',
    client_id: client ? String(client) : '',
    start_time: start ? String(start) : '',
    end_time: end ? String(end) : '',
    status: row.status ?? row.state ?? 'scheduled',
    location: row.location ?? row.place ?? '',
    notes: row.notes ?? row.note ?? '',
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = tryCreateServerClient();

  if (!sb) {
    const fallback = getAdminPtsScheduleFallback();
    const session = fallback.sessions.find((item) => item.id === id);
    if (!session) return notFound();
    return (
      <div className="admin-pts-schedule__formPage">
        <PageHeader title="Editar sessão" subtitle="Actualiza horários, notas e estado." sticky={false} />
        <div className="admin-pts-schedule__formCard">
          <SessionFormClient mode="edit" initial={{
            id: session.id,
            trainer_id: session.trainerId ?? '',
            client_id: session.clientId ?? '',
            start_time: session.start ?? '',
            end_time: session.end ?? session.start ?? '',
            status: session.status as any,
            location: session.location ?? '',
            notes: session.notes ?? '',
          }} />
        </div>
      </div>
    );
  }

  const tables = ['sessions', 'pt_sessions'] as const;
  for (const table of tables) {
    const { data: row } = await sb.from(table).select('*').eq('id', id).maybeSingle();
    if (row) {
      return (
        <div className="admin-pts-schedule__formPage">
          <PageHeader title="Editar sessão" subtitle="Actualiza horários, notas e estado." sticky={false} />
          <div className="admin-pts-schedule__formCard">
            <SessionFormClient mode="edit" initial={mapRow(row)} />
          </div>
        </div>
      );
    }
  }

  return notFound();
}
