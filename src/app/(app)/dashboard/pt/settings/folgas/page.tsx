export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

import PageHeader from '@/components/ui/PageHeader';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';

import FolgaForm from './FolgaForm';
import EditFolgaButton from './EditFolgaButton';

type DayOff = {
  id: string;
  trainer_id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
};

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = (day + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfWeek(date: Date) {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  end.setHours(0, 0, 0, 0);
  return end;
}

function hoursBetween(start: string, end: string) {
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);
  return h2 + m2 / 60 - (h1 + m1 / 60);
}

function monthMatrix(year: number, month0: number) {
  const first = new Date(year, month0, 1);
  const start = startOfWeek(first);
  const weeks: Date[][] = [];
  let cursor = new Date(start);
  for (;;) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i += 1) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    if (cursor.getMonth() !== month0 && cursor.getDay() === 1) break;
  }
  return weeks;
}

const weekdayShort = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const listDateFormatter = new Intl.DateTimeFormat('pt-PT', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
});
const metricNumber = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1 });

export default async function FolgasPage() {
  const session = await getSessionUserSafe();
  const viewer = session;
  if (!viewer?.id) redirect('/login');

  const role = (toAppRole(viewer.role) ?? 'CLIENT') as AppRole;
  if (role !== 'ADMIN' && role !== 'PT') redirect('/dashboard');

  const supabase = createServerClient();

  let supabaseOnline = true;
  let rows: DayOff[] = [];
  try {
    const query = supabase
      .from('pt_days_off')
      .select('id, trainer_id, date, start_time, end_time, reason')
      .order('date', { ascending: true });

    const { data, error } = role === 'ADMIN' ? await query : await query.eq('trainer_id', viewer.id);
    if (error) throw error;
    rows = (data ?? []) as DayOff[];
  } catch (error) {
    console.error('[pt-days-off] fallback to empty data', error);
    supabaseOnline = false;
    rows = [];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startWeek = startOfWeek(today);
  const endWeek = endOfWeek(today);

  const folgas = rows.sort((a, b) => a.date.localeCompare(b.date));

  const proximasFolgas = folgas.filter((day) => {
    const value = new Date(day.date);
    value.setHours(0, 0, 0, 0);
    return value >= today;
  });

  const horasSemana = folgas.reduce((acc, day) => {
    const value = new Date(day.date);
    if (value >= startWeek && value < endWeek) {
      if (day.start_time && day.end_time) {
        const delta = hoursBetween(day.start_time, day.end_time);
        const normalised = Number.isFinite(delta) ? delta : 0;
        return acc + Math.max(0, Math.min(24, normalised));
      }
      return acc + 8;
    }
    return acc;
  }, 0);

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const grid = monthMatrix(currentYear, currentMonth);
  const folgaDates = new Set(folgas.map((day) => new Date(day.date).toDateString()));

  const diasBloqueadosMes = new Set(
    folgas
      .filter((day) => {
        const date = new Date(day.date);
        return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
      })
      .map((day) => day.date),
  ).size;

  const proximasUnicas = new Set(proximasFolgas.map((day) => day.date));

  const supabaseState = supabaseOnline ? 'ok' : 'warn';
  const supabaseLabel = supabaseOnline ? 'Dados em tempo real' : 'Modo offline';

  return (
    <div className="pt-days-off neo-stack neo-stack--xl">
      <PageHeader
        title="🗓️ Folgas"
        subtitle="Bloqueia horários antes de abrir vagas aos clientes e acompanha o calendário actualizado com dados do servidor."
        sticky={false}
        actions={<span className="status-pill" data-state={supabaseState}>{supabaseLabel}</span>}
      />

      <section className="pt-days-off__metrics" aria-label="Indicadores principais">
        <article className="pt-days-off__metric" data-tone="accent">
          <span className="pt-days-off__metricLabel">Próximas folgas</span>
          <strong className="pt-days-off__metricValue">{metricNumber.format(proximasFolgas.length)}</strong>
          <span className="pt-days-off__metricHint">Confirmadas a partir de hoje</span>
        </article>
        <article className="pt-days-off__metric" data-tone="success">
          <span className="pt-days-off__metricLabel">Horas indisponíveis (semana)</span>
          <strong className="pt-days-off__metricValue">
            {metricNumber.format(horasSemana)}
            <span className="pt-days-off__metricUnit">h</span>
          </strong>
          <span className="pt-days-off__metricHint">Calculado com base nas folgas registadas</span>
        </article>
        <article className="pt-days-off__metric" data-tone="info">
          <span className="pt-days-off__metricLabel">Dias bloqueados no mês</span>
          <strong className="pt-days-off__metricValue">{metricNumber.format(diasBloqueadosMes)}</strong>
          <span className="pt-days-off__metricHint">{proximasUnicas.size} futur{proximasUnicas.size === 1 ? 'o' : 'os'}</span>
        </article>
      </section>

      <section className="neo-panel pt-days-off__panel" aria-labelledby="pt-days-off-create">
        <header className="neo-panel__header">
          <div className="neo-panel__meta">
            <h2 id="pt-days-off-create" className="neo-panel__title">
              Registar nova folga
            </h2>
            <p className="neo-panel__subtitle">Define dias completos ou janelas horárias para bloquear marcações.</p>
          </div>
        </header>
        <FolgaForm />
      </section>

      <section className="neo-panel pt-days-off__panel" aria-labelledby="pt-days-off-calendar">
        <header className="neo-panel__header">
          <div className="neo-panel__meta">
            <h2 id="pt-days-off-calendar" className="neo-panel__title">
              Calendário do mês actual
            </h2>
            <p className="neo-panel__subtitle">{today.toLocaleString('pt-PT', { month: 'long', year: 'numeric' })}</p>
          </div>
          <span className="pt-days-off__legend">Dias destacados indicam folgas confirmadas.</span>
        </header>
        <div className="pt-days-off__calendar" role="grid" aria-readonly>
          <div className="pt-days-off__calendarHeader" role="row">
            {weekdayShort.map((weekday) => (
              <span key={weekday} role="columnheader" className="pt-days-off__calendarWeekday">
                {weekday}
              </span>
            ))}
          </div>
          <div className="pt-days-off__calendarGrid">
            {grid.flat().map((date, index) => {
              const inMonth = date.getMonth() === currentMonth;
              const label = date.getDate();
              const key = date.toDateString();
              const isDayOff = folgaDates.has(key);
              return (
                <div
                  key={`${key}-${index}`}
                  className="pt-days-off__calendarCell"
                  data-muted={inMonth ? undefined : 'true'}
                  data-blocked={isDayOff ? 'true' : undefined}
                >
                  <span className="pt-days-off__calendarDay">{label}</span>
                  {isDayOff ? <span className="pt-days-off__calendarBadge">Folga</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="neo-panel pt-days-off__panel" aria-labelledby="pt-days-off-list">
        <header className="neo-panel__header">
          <div className="neo-panel__meta">
            <h2 id="pt-days-off-list" className="neo-panel__title">
              Folgas agendadas
            </h2>
            <p className="neo-panel__subtitle">
              {proximasFolgas.length > 0
                ? `${proximasFolgas.length} registo${proximasFolgas.length === 1 ? '' : 's'} a partir de hoje.`
                : 'Adiciona um novo registo para começar.'}
            </p>
          </div>
        </header>
        {folgas.length === 0 ? (
          <div className="neo-empty" role="status">
            <span className="neo-empty__icon" aria-hidden>
              🌤️
            </span>
            <p className="neo-empty__title">Sem folgas registadas</p>
            <p className="neo-empty__description">Os teus dias livres aparecerão aqui assim que forem guardados.</p>
          </div>
        ) : (
          <ul className="pt-days-off__list" role="list">
            {folgas.map((day) => {
              const date = new Date(day.date);
              const label = listDateFormatter.format(date);
              const range = day.start_time && day.end_time ? `${day.start_time}–${day.end_time}` : 'Dia inteiro';
              const reason = day.reason?.trim();
              const isPast = date.getTime() < today.getTime();
              return (
                <li key={day.id} className="pt-days-off__listItem" data-past={isPast ? 'true' : undefined}>
                  <div className="pt-days-off__listMeta">
                    <p className="pt-days-off__listDate">{label}</p>
                    <span className="pt-days-off__listInfo">
                      {range}
                      {reason ? ` · ${reason}` : ''}
                    </span>
                  </div>
                  <div className="pt-days-off__listActions">
                    <span className="status-pill" data-state={isPast ? 'neutral' : 'ok'}>
                      {isPast ? 'Histórico' : 'Agendado'}
                    </span>
                    <EditFolgaButton folgaId={day.id} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
