'use client';

import React from 'react';

type SessionLite = {
  id: string;
  client: string;
  time?: string;     // "14:30"
  date?: string;     // "2025-08-16"
  type?: string;     // "Treino A", "Avaliação", ...
};

type PTBlock = {
  activeClients?: number;
  newClients7d?: number;
  todaySessions?: number;
  upcomingSessions?: number;
  tasksDue?: number;
  messagesUnread?: number;
  sessionsToday?: SessionLite[];
  upcoming?: SessionLite[];
};

type Stats = {
  pt?: PTBlock;
  // (mantém outros campos que já possas ter)
};

function n(v: unknown) {
  return typeof v === 'number' && isFinite(v) ? v : 0;
}

function CardKpi(props: { title: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="card" style={{ padding: 12, display: 'grid', gap: 6 }}>
      <div style={{ fontSize: 12, color: 'var(--muted-fg)' }}>{props.title}</div>
      <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{props.value}</div>
      {props.hint && <div style={{ fontSize: 12, color: 'var(--muted-fg)' }}>{props.hint}</div>}
    </div>
  );
}

function ListPanel(props: { title: string; items: SessionLite[]; empty: string }) {
  return (
    <div className="card" style={{ padding: 12, display: 'grid', gap: 8 }}>
      <div style={{ fontWeight: 700 }}>{props.title}</div>
      {props.items.length === 0 ? (
        <div className="text-muted" style={{ fontSize: 14 }}>{props.empty}</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
          {props.items.map((s) => (
            <li key={s.id}
                style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--muted-fg)' }}>{s.time ?? s.date ?? '—'}</span>
              <span style={{ fontWeight: 600 }}>{s.client}</span>
              <span className="text-muted" style={{ fontSize: 12 }}>{s.type ?? ''}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PTDashboard({ stats }: { stats?: Stats }) {
  const pt = stats?.pt ?? {};

  const sessionsToday = pt.sessionsToday ?? [];
  const upcoming = pt.upcoming ?? [];

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* KPIs */}
      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
        }}
      >
        <CardKpi title="Clientes ativos" value={n(pt.activeClients)} />
        <CardKpi title="Sessões hoje" value={n(pt.todaySessions)} />
        <CardKpi title="Próx. 7 dias" value={n(pt.upcomingSessions)} />
        <CardKpi title="Novos (7d)" value={n(pt.newClients7d)} />
      </div>

      {/* Gráfico/livre – placeholder para tendência 7d (mantém visual anterior) */}
      <div className="card" style={{ padding: 12, minHeight: 160 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Tendência de sessões (7 dias)</div>
        <div className="text-muted" style={{ fontSize: 14 }}>Atualizado em tempo real</div>
      </div>

      {/* Painéis e ações rápidas */}
      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: '2fr 1fr',
          alignItems: 'start',
        }}
      >
        <ListPanel
          title="Sessões de hoje"
          items={sessionsToday}
          empty="Sem sessões marcadas para hoje."
        />

        <div style={{ display: 'grid', gap: 12 }}>
          {/* Ações rápidas */}
          <div className="card" style={{ padding: 12, display: 'grid', gap: 8 }}>
            <div style={{ fontWeight: 700 }}>Ações rápidas</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a className="btn primary" href="/dashboard/clients/new">+ Novo cliente</a>
              <a className="btn ghost" href="/dashboard/plans/new">+ Novo plano</a>
              <a className="btn ghost" href="/dashboard/sessions/new">+ Nova sessão</a>
            </div>
            <div className="text-muted" style={{ fontSize: 12 }}>
              Tarefas pendentes: <b>{n(pt.tasksDue)}</b> • Mensagens por ler: <b>{n(pt.messagesUnread)}</b>
            </div>
          </div>

          <ListPanel
            title="Próximas sessões (7 dias)"
            items={upcoming}
            empty="Sem sessões marcadas para os próximos dias."
          />
        </div>
      </div>
    </div>
  );
}
