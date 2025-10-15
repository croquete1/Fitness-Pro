'use client';

import * as React from 'react';
import Link from 'next/link';
import { CalendarClock, Sparkles, UserPlus2, Users2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

const assignments = [
  {
    id: 'assign-ines',
    trainer: 'Inês Costa',
    trainerFocus: 'HIIT & Mobilidade',
    status: 'active',
    shift: 'manhã',
    clients: 12,
    highlightedClient: 'Bruno Mota',
    nextCheckIn: 'Hoje · 11:30',
    tags: ['Premium', 'Reabilitação'],
    load: 'Alta',
    lastSync: 'há 42 min',
  },
  {
    id: 'assign-diego',
    trainer: 'Diogo Faria',
    trainerFocus: 'Força & Hipertrofia',
    status: 'onboarding',
    shift: 'tarde',
    clients: 8,
    highlightedClient: 'Helena Duarte',
    nextCheckIn: 'Hoje · 17:00',
    tags: ['Onboarding'],
    load: 'Moderada',
    lastSync: 'há 1 h',
  },
  {
    id: 'assign-raquel',
    trainer: 'Raquel Santos',
    trainerFocus: 'Wellness & Mindfulness',
    status: 'active',
    shift: 'manhã',
    clients: 10,
    highlightedClient: 'Sara Oliveira',
    nextCheckIn: 'Amanhã · 09:00',
    tags: ['Corporate'],
    load: 'Equilibrada',
    lastSync: 'há 18 min',
  },
  {
    id: 'assign-mateus',
    trainer: 'Mateus Ribeiro',
    trainerFocus: 'Performance Atleta',
    status: 'paused',
    shift: 'noite',
    clients: 6,
    highlightedClient: 'Equipa Sub23',
    nextCheckIn: 'Em revisão',
    tags: ['Equipa'],
    load: 'Revisão',
    lastSync: 'há 3 h',
  },
  {
    id: 'assign-lara',
    trainer: 'Lara Mendes',
    trainerFocus: 'Pilates & Mobilidade',
    status: 'active',
    shift: 'tarde',
    clients: 11,
    highlightedClient: 'Carina Lopes',
    nextCheckIn: 'Hoje · 15:45',
    tags: ['Studio'],
    load: 'Alta',
    lastSync: 'há 27 min',
  },
] as const;

type Assignment = (typeof assignments)[number];

type StatusFilter = '' | 'active' | 'onboarding' | 'paused';
type ShiftFilter = '' | 'manhã' | 'tarde' | 'noite';

const shiftOptions: Array<{ value: ShiftFilter; label: string }> = [
  { value: '', label: 'Todos os turnos' },
  { value: 'manhã', label: 'Turno da manhã' },
  { value: 'tarde', label: 'Turno da tarde' },
  { value: 'noite', label: 'Turno noite' },
];

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: '', label: 'Todos os estados' },
  { value: 'active', label: 'Operacionais' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'paused', label: 'Em pausa' },
];

const timeline = [
  { id: 'slot-1', title: 'Check-in premium', when: 'Hoje · 11:30', owner: 'Inês Costa', detail: 'Follow-up com Bruno Mota' },
  { id: 'slot-2', title: 'Sessão corporativa', when: 'Hoje · 13:00', owner: 'Raquel Santos', detail: 'Workshop “Pausa activa”' },
  { id: 'slot-3', title: 'Revisão planos atleta', when: 'Hoje · 18:15', owner: 'Mateus Ribeiro', detail: 'Equipa Sub23 · novo calendário' },
];

function toneForStatus(status: StatusFilter | Assignment['status']) {
  if (status === 'active') return 'success';
  if (status === 'onboarding') return 'warning';
  if (status === 'paused') return 'neutral';
  return 'info';
}

export default function RosterClient() {
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<StatusFilter>('');
  const [shift, setShift] = React.useState<ShiftFilter>('');

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return assignments.filter((assignment) => {
      if (status && assignment.status !== status) return false;
      if (shift && assignment.shift !== shift) return false;
      if (!term) return true;
      return [
        assignment.trainer,
        assignment.trainerFocus,
        assignment.highlightedClient,
        assignment.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [search, status, shift]);

  const metrics = React.useMemo(() => {
    const trainers = new Set<string>();
    let totalClients = 0;
    let onboarding = 0;
    let paused = 0;
    let active = 0;
    filtered.forEach((assignment) => {
      trainers.add(assignment.trainer);
      totalClients += assignment.clients;
      if (assignment.status === 'active') active += 1;
      if (assignment.status === 'onboarding') onboarding += 1;
      if (assignment.status === 'paused') paused += 1;
    });
    return [
      { id: 'trainers', label: 'Treinadores listados', value: trainers.size, tone: 'violet' as const },
      { id: 'clients', label: 'Clientes sob gestão', value: totalClients, tone: 'primary' as const },
      { id: 'active', label: 'Escalas activas', value: active, tone: 'success' as const },
      { id: 'onboarding', label: 'Onboarding', value: onboarding, tone: 'warning' as const },
      { id: 'paused', label: 'Em pausa', value: paused, tone: 'neutral' as const },
    ];
  }, [filtered]);

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 lg:px-12">
      <PageHeader
        title="Escala & atribuições"
        subtitle="Orquestra a distribuição de clientes por treinador com um overview responsivo e orientado ao futuro."
        actions={(
          <div className="neo-quick-actions flex-wrap">
            <button type="button" className="btn">
              <UserPlus2 className="h-4 w-4" aria-hidden="true" />
              <span>Nova atribuição</span>
            </button>
            <Link href="/dashboard/admin/approvals" className="btn ghost" prefetch={false}>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>Ver aprovações</span>
            </Link>
          </div>
        )}
      />

      <section className="neo-panel space-y-5" aria-label="Indicadores principais">
        <div className="neo-grid auto-fit min-[220px]:grid-cols-2 lg:grid-cols-5">
          {metrics.map((metric) => (
            <article key={metric.id} className="neo-surface neo-surface--interactive space-y-2 p-4" data-variant={metric.tone}>
              <span className="neo-surface__hint uppercase tracking-wide">{metric.label}</span>
              <span className="neo-surface__value text-2xl font-semibold text-fg">{metric.value}</span>
            </article>
          ))}
        </div>

        <div className="neo-grid auto-fit min-[260px]:grid-cols-2 xl:grid-cols-4" role="group" aria-label="Filtros da escala">
          <label htmlFor="roster-search" className="flex flex-col gap-2">
            <span className="neo-surface__hint uppercase tracking-wide">Pesquisar</span>
            <input
              id="roster-search"
              type="search"
              className="neo-input"
              placeholder="Treinador, cliente, tag…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <label htmlFor="roster-status" className="flex flex-col gap-2">
            <span className="neo-surface__hint uppercase tracking-wide">Estado</span>
            <select
              id="roster-status"
              className="neo-input"
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
            >
              {statusOptions.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="roster-shift" className="flex flex-col gap-2">
            <span className="neo-surface__hint uppercase tracking-wide">Turno</span>
            <select
              id="roster-shift"
              className="neo-input"
              value={shift}
              onChange={(event) => setShift(event.target.value as ShiftFilter)}
            >
              {shiftOptions.map((option) => (
                <option key={option.value || 'all-shifts'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col justify-end gap-2">
            <span className="neo-surface__hint uppercase tracking-wide">Atalhos</span>
            <Link href="/dashboard/admin/pts-schedule" className="btn ghost" prefetch={false}>
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              <span>Agenda de PTs</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="neo-panel space-y-4" aria-label="Tabela de atribuições">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="neo-panel__title">Distribuição actual</h2>
            <p className="neo-panel__subtitle">Vista consolidada por treinador com próximos marcos de acompanhamento.</p>
          </div>
          <span className="neo-tag" data-tone="primary">
            {filtered.length} {filtered.length === 1 ? 'registo' : 'registos'}
          </span>
        </div>

        <div className="neo-table-wrapper" role="region" aria-live="polite">
          <table className="neo-table">
            <thead>
              <tr>
                <th scope="col">Treinador</th>
                <th scope="col">Clientes</th>
                <th scope="col">Estado</th>
                <th scope="col">Próximo check-in</th>
                <th scope="col">Tags</th>
                <th scope="col" className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted">
                    Nenhuma atribuição encontrada para os filtros seleccionados.
                  </td>
                </tr>
              )}

              {filtered.map((assignment) => (
                <tr key={assignment.id}>
                  <td data-title="Treinador">
                    <div className="flex flex-col">
                      <span className="font-semibold text-fg">{assignment.trainer}</span>
                      <span className="text-xs text-muted">{assignment.trainerFocus}</span>
                    </div>
                  </td>
                  <td data-title="Clientes" className="font-semibold text-fg">
                    <div className="flex items-center gap-2">
                      <Users2 className="h-4 w-4 text-muted" aria-hidden="true" />
                      {assignment.clients}
                    </div>
                  </td>
                  <td data-title="Estado">
                    <span className="neo-table__status" data-state={toneForStatus(assignment.status)}>
                      {assignment.status === 'active' && 'Operacional'}
                      {assignment.status === 'onboarding' && 'Onboarding'}
                      {assignment.status === 'paused' && 'Em pausa'}
                    </span>
                  </td>
                  <td data-title="Próximo check-in">
                    <div className="flex flex-col">
                      <span>{assignment.nextCheckIn}</span>
                      <span className="text-xs text-muted">Última sync {assignment.lastSync}</span>
                    </div>
                  </td>
                  <td data-title="Tags">
                    <div className="flex flex-wrap gap-2">
                      {assignment.tags.map((tag) => (
                        <span key={tag} className="neo-tag" data-tone="neutral">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td data-title="Ações" className="text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Link href={`/dashboard/admin/pts-schedule?trainer=${encodeURIComponent(assignment.trainer)}`} className="btn ghost" prefetch={false}>
                        Ver agenda
                      </Link>
                      <button type="button" className="btn ghost">
                        Detalhes
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="neo-panel space-y-4" aria-label="Próximos marcos">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="neo-panel__title">Marcos iminentes</h2>
            <p className="neo-panel__subtitle">Agenda condensada para garantir acompanhamento em tempo quase-real.</p>
          </div>
        </div>

        <ol className="space-y-3">
          {timeline.map((item) => (
            <li key={item.id} className="neo-surface p-4" data-variant="info">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-fg">{item.title}</p>
                  <p className="text-xs text-muted">{item.detail}</p>
                </div>
                <div className="text-right text-sm font-medium text-fg">
                  <p>{item.when}</p>
                  <p className="text-xs text-muted">Responsável · {item.owner}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
