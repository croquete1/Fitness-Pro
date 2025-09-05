// src/app/(app)/dashboard/pt/ui/PTLiveSummaryClient.tsx
'use client';

import * as React from 'react';
import WeekCalendar from '../../pt/sessions/ui/WeekCalendar';

type WeekItem = { id: string; start: string; end: string };

export default function PTLiveSummaryClient({ initial }: {
  initial: {
    todayCount: number;
    nextAt: string | null;
    activeClients: number;
    plansUpdated: number;
    week: WeekItem[];
  }
}) {
  const [state, setState] = React.useState(initial);

  React.useEffect(() => {
    const t = setInterval(async () => {
      const res = await fetch('/api/pt/summary', { cache: 'no-store' });
      if (res.ok) setState(await res.json());
    }, 60_000);
    return () => clearInterval(t);
  }, []);

  const weekStart = (() => {
    const d = new Date();
    const day = (d.getDay() + 6) % 7; // Mon=0
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() - day);
    return d.toISOString();
  })();

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
        <div className="card" style={{ padding: 12 }}>
          <div className="small text-muted">Sessões hoje</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{state.todayCount}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="small text-muted">Próxima sessão</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {state.nextAt ? new Date(state.nextAt).toLocaleString('pt-PT') : '—'}
          </div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="small text-muted">Clientes ativos</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{state.activeClients}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="small text-muted">Planos atualizados (7d)</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{state.plansUpdated}</div>
        </div>
      </div>

      {/* mini-calendário (leitura) */}
      <WeekCalendar
        weekStartIso={weekStart}
        sessions={state.week.map(w => ({ ...w, title: 'Sessão' }))}
        bufferMin={10}
        compact
      />
    </div>
  );
}
