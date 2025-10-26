import * as React from 'react';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import { buildFallbackAdminWeekSessions } from '@/lib/fallback/admin-week-sessions';
import { createServerClient } from '@/lib/supabaseServer';
import { formatRelativeTime } from '@/lib/datetime/relative';

const DATE_RANGE_FORMATTER = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

type Row = {
  id: string;
  name: string;
  sessions: number;
  nextAt: string | null;
};

type Source = 'supabase' | 'fallback';

function formatRange(start: Date, end: Date) {
  return `${DATE_RANGE_FORMATTER.format(start)} – ${DATE_RANGE_FORMATTER.format(end)}`;
}

export default async function AdminWeekTable() {
  const now = new Date();
  const fallback = buildFallbackAdminWeekSessions({ now });
  let rows: Row[] = fallback.rows;
  let source: Source = 'fallback';
  let generatedAt = fallback.generatedAt;
  let error: string | null = null;

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endWindow = new Date(startOfDay);
  endWindow.setDate(endWindow.getDate() + 7);
  const visibleEnd = new Date(endWindow.getTime() - 60_000);

  try {
    const supabase = createServerClient();
    const { data: rawWeek, error: weekError } = await supabase
      .from('sessions')
      .select('id, trainer_id, scheduled_at')
      .gte('scheduled_at', startOfDay.toISOString())
      .lt('scheduled_at', endWindow.toISOString());

    if (weekError) throw weekError;

    const byTrainer = new Map<string, { count: number; nextAt: string | null }>();

    for (const session of rawWeek ?? []) {
      const trainerId = session?.trainer_id as string | null;
      const scheduledAt = typeof session?.scheduled_at === 'string' ? session.scheduled_at : null;
      if (!trainerId) continue;
      const existing = byTrainer.get(trainerId) ?? { count: 0, nextAt: null };
      const nextAt = existing.nextAt;
      const candidate = scheduledAt ? new Date(scheduledAt).toISOString() : null;
      const updatedNext = !candidate
        ? nextAt
        : !nextAt || new Date(candidate).getTime() < new Date(nextAt).getTime()
          ? candidate
          : nextAt;
      byTrainer.set(trainerId, {
        count: existing.count + 1,
        nextAt: updatedNext,
      });
    }

    const trainerIds = Array.from(byTrainer.keys());
    let trainerNames = new Map<string, string>();
    if (trainerIds.length) {
      const { data: trainers, error: trainerError } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', trainerIds);
      if (trainerError) throw trainerError;
      trainerNames = new Map(
        (trainers ?? []).map((trainer) => [
          trainer.id as string,
          (trainer.name as string | null) ?? (trainer.email as string | null) ?? (trainer.id as string),
        ]),
      );
    }

    const supabaseRows: Row[] = Array.from(byTrainer.entries())
      .map(([id, snapshot]) => ({
        id,
        name: trainerNames.get(id) ?? id,
        sessions: snapshot.count,
        nextAt: snapshot.nextAt,
      }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, fallback.rows.length);

    rows = supabaseRows;
    source = 'supabase';
    generatedAt = new Date().toISOString();
  } catch (caught) {
    console.warn('[admin] week table fallback', caught);
    rows = fallback.rows;
    source = 'fallback';
    generatedAt = fallback.generatedAt;
    error = 'Sem ligação ao servidor — a mostrar dados determinísticos.';
  }

  const totalSessions = rows.reduce((acc, row) => acc + row.sessions, 0);

  return (
    <section className="neo-panel neo-panel--compact admin-week-table">
      <header className="neo-panel__header">
        <div className="neo-panel__meta">
          <h2 className="neo-panel__title">Sessões por PT (próx. 7 dias)</h2>
          <p className="neo-panel__subtitle">
            Janela {formatRange(startOfDay, visibleEnd)} · base em sessões confirmadas.
          </p>
        </div>
        <DataSourceBadge source={source} generatedAt={generatedAt} />
      </header>

      <div className="admin-week-table__summary">
        <div>
          <span className="admin-week-table__summaryLabel">Total agendado</span>
          <span className="admin-week-table__summaryValue">{totalSessions}</span>
        </div>
        <div>
          <span className="admin-week-table__summaryLabel">PTs activos</span>
          <span className="admin-week-table__summaryValue">{rows.length}</span>
        </div>
      </div>

      {error && <p className="admin-week-table__alert">{error}</p>}

      <div className="neo-table-wrapper">
        <table className="neo-table">
          <thead>
            <tr>
              <th>Personal trainer</th>
              <th className="neo-table__cell--right">Sessões</th>
              <th>Próxima sessão</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="neo-table-empty">
                  Sem sessões confirmadas para os próximos 7 dias.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const relative = formatRelativeTime(row.nextAt, now);
                const absolute = row.nextAt ? DATE_TIME_FORMATTER.format(new Date(row.nextAt)) : null;
                return (
                  <tr key={row.id}>
                    <td>
                      <span className="admin-week-table__name">{row.name}</span>
                    </td>
                    <td className="neo-table__cell--right">{row.sessions}</td>
                    <td>
                      {row.nextAt ? (
                        <span className="admin-week-table__next">
                          <time dateTime={row.nextAt} title={absolute ?? undefined}>
                            {relative ?? absolute ?? '—'}
                          </time>
                          {absolute && <span className="admin-week-table__nextHint">{absolute}</span>}
                        </span>
                      ) : (
                        <span className="admin-week-table__next admin-week-table__next--empty">Sem agendamentos</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
