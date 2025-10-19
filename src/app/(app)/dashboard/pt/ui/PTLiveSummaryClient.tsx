// src/app/(app)/dashboard/pt/ui/PTLiveSummaryClient.tsx
'use client';

import * as React from 'react';
import WeekCalendar from '../../pt/sessions/ui/WeekCalendar';

type WeekItem = { id: string; start: string; end: string };

function formatDateTime(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  try {
    return new Intl.DateTimeFormat('pt-PT', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '—';
  }
}

export default function PTLiveSummaryClient({ initial }: {
  initial: {
    todayCount: number;
    nextAt: string | null;
    activeClients: number;
    plansUpdated: number;
    week: WeekItem[];
  };
}) {
  const [state, setState] = React.useState(initial);

  React.useEffect(() => {
    const t = setInterval(async () => {
      const res = await fetch('/api/pt/summary', { cache: 'no-store' });
      if (res.ok) setState(await res.json());
    }, 60_000);
    return () => clearInterval(t);
  }, []);

  const weekStart = React.useMemo(() => {
    const d = new Date();
    const day = (d.getDay() + 6) % 7; // Mon=0
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day);
    return d.toISOString();
  }, []);

  return (
    <div className="pt-summary neo-stack neo-stack--lg">
      <section className="neo-panel pt-summary__metrics" aria-label="Métricas rápidas">
        <div className="pt-summary__grid" role="list">
          <article className="pt-summary__metric" role="listitem">
            <span className="pt-summary__label">Sessões hoje</span>
            <strong className="pt-summary__value">{state.todayCount}</strong>
            <span className="pt-summary__hint">confirmadas na agenda</span>
          </article>
          <article className="pt-summary__metric" role="listitem">
            <span className="pt-summary__label">Próxima sessão</span>
            <strong className="pt-summary__value">{formatDateTime(state.nextAt)}</strong>
            <span className="pt-summary__hint">actualizado automaticamente</span>
          </article>
          <article className="pt-summary__metric" role="listitem">
            <span className="pt-summary__label">Clientes activos</span>
            <strong className="pt-summary__value">{state.activeClients}</strong>
            <span className="pt-summary__hint">com plano em acompanhamento</span>
          </article>
          <article className="pt-summary__metric" role="listitem">
            <span className="pt-summary__label">Planos actualizados (7d)</span>
            <strong className="pt-summary__value">{state.plansUpdated}</strong>
            <span className="pt-summary__hint">edições concluídas na última semana</span>
          </article>
        </div>
      </section>

      <section className="neo-panel pt-summary__calendar" aria-label="Agenda semanal">
        <header className="pt-summary__calendarHeader">
          <div>
            <h2 className="pt-summary__calendarTitle">Visão semanal</h2>
            <p className="pt-summary__calendarHint">Arrasta para seleccionar blocos livres ou folgas rápidas.</p>
          </div>
        </header>
        <WeekCalendar
          weekStartIso={weekStart}
          sessions={state.week.map((item) => ({ ...item, title: 'Sessão' }))}
          bufferMin={10}
          compact
        />
      </section>
    </div>
  );
}
