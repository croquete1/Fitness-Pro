export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

type SessionRow = {
  id: string;
  scheduled_at: string | null;
  trainer_id: string | null;
  client_id: string | null;
  status: string | null;
  location: string | null;
};

const dateFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

function formatDate(value: string | null) {
  if (!value) return '—';
  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return '—';
  }
}

type StatusTone = 'ok' | 'warn' | 'down';

function toneForStatus(status: string | null): StatusTone {
  const normalized = (status ?? '').toString().trim().toUpperCase();
  if (!normalized) return 'warn';

  if (['CONFIRMED', 'COMPLETED', 'DONE', 'ACTIVE'].includes(normalized)) {
    return 'ok';
  }
  if (['PENDING', 'REQUESTED', 'WAITING', 'RESCHEDULE'].includes(normalized)) {
    return 'warn';
  }
  return 'down';
}

function friendlyStatus(status: string | null) {
  if (!status) return '—';
  const normalized = status.replace(/_/g, ' ').toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export default async function HistoryPage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');

  const role = toAppRole(session.user.role) ?? 'CLIENT';
  const supabase = createServerClient();

  let query = supabase
    .from('sessions')
    .select('id,scheduled_at,trainer_id,client_id,status,location')
    .order('scheduled_at', { ascending: false })
    .limit(200);

  if (role === 'PT') {
    query = query.eq('trainer_id', session.user.id);
  } else if (role === 'CLIENT') {
    query = query.eq('client_id', session.user.id);
  }

  const { data } = await query;
  const rows: SessionRow[] = (data ?? []) as SessionRow[];

  const counts = rows.reduce(
    (acc, row) => {
      const tone = toneForStatus(row.status);
      if (tone === 'ok') acc.confirmed += 1;
      else if (tone === 'warn') acc.pending += 1;
      else acc.cancelled += 1;
      return acc;
    },
    { confirmed: 0, pending: 0, cancelled: 0 },
  );

  const showTrainerColumn = role !== 'PT';
  const showClientColumn = role !== 'CLIENT';
  const columnCount = 3 + (showTrainerColumn ? 1 : 0) + (showClientColumn ? 1 : 0);

  return (
    <div className="space-y-6">
      <header className="page-header neo-panel neo-panel--header">
        <div className="page-header__body">
          <h1 className="page-header__title heading-solid">Histórico</h1>
          <p className="page-header__subtitle">
            Consulta as últimas sessões confirmadas, reagendadas ou canceladas.
          </p>
        </div>
      </header>

      <section className="neo-panel space-y-4" aria-labelledby="history-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="history-heading" className="neo-panel__title">
              Sessões registadas
            </h2>
            <p className="neo-panel__subtitle">
              Mostramos até 200 entradas ordenadas da mais recente para a mais antiga.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <span className="neo-tag" data-tone="primary">Total · {rows.length}</span>
            <span className="neo-tag" data-tone="success">Ok · {counts.confirmed}</span>
            <span className="neo-tag" data-tone="warning">Pendentes · {counts.pending}</span>
            <span className="neo-tag" data-tone="danger">Canceladas · {counts.cancelled}</span>
          </div>
        </div>

        <div className="neo-table-wrapper" role="region" aria-live="polite">
          <table className="neo-table">
            <thead>
              <tr>
                <th>Data</th>
                {showTrainerColumn && <th>Treinador</th>}
                {showClientColumn && <th>Cliente</th>}
                <th>Local</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const tone = toneForStatus(row.status);
                return (
                  <tr key={row.id}>
                    <td>{formatDate(row.scheduled_at)}</td>
                    {showTrainerColumn && <td className="text-sm text-muted">{row.trainer_id ?? '—'}</td>}
                    {showClientColumn && <td className="text-sm text-muted">{row.client_id ?? '—'}</td>}
                    <td className="text-sm text-muted">{row.location ?? '—'}</td>
                    <td>
                      <span className="status-pill" data-state={tone}>
                        {friendlyStatus(row.status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr>
                  <td colSpan={columnCount}>
                    <div className="neo-empty">
                      <span className="neo-empty__icon" aria-hidden>
                        📭
                      </span>
                      <p className="neo-empty__title">Sem registos</p>
                      <p className="neo-empty__description">
                        Assim que existirem sessões concluídas ou reagendadas elas vão surgir automaticamente aqui.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
