'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Loader2, RefreshCcw } from 'lucide-react';

import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import type {
  TrainerPlanStatusKey,
  TrainerPlansDashboardData,
  TrainerPlansDashboardPayload,
} from '@/lib/trainer/plans/types';
import { useTrainerPlansDashboard } from './useTrainerPlansDashboard';

const STATUS_LABEL: Record<TrainerPlanStatusKey, string> = {
  active: 'Ativos',
  draft: 'Rascunhos',
  archived: 'Arquivados',
  deleted: 'Removidos',
  unknown: 'Sem estado',
};

const STATUS_TONE: Record<TrainerPlanStatusKey, 'positive' | 'warning' | 'critical' | 'neutral'> = {
  active: 'positive',
  draft: 'warning',
  archived: 'neutral',
  deleted: 'critical',
  unknown: 'warning',
};

export type TrainerPlansPanelData = TrainerPlansDashboardPayload;

type TrainerPlansPanelProps = {
  initialData: TrainerPlansPanelData;
};

export default function TrainerPlansPanel({ initialData }: TrainerPlansPanelProps) {
  const { data, error, isValidating, mutate } = useTrainerPlansDashboard(initialData);

  const dashboard = data ?? initialData;
  const statusSummary = React.useMemo(
    () =>
      dashboard.statuses.map((item) => ({
        key: item.id,
        label: STATUS_LABEL[item.id],
        count: item.count,
        tone: STATUS_TONE[item.id],
      })),
    [dashboard.statuses],
  );

  const chartData = React.useMemo(
    () =>
      dashboard.timeline.map((point) => ({
        name: point.label,
        created: point.created,
        updated: point.updated,
        archived: point.archived,
      })),
    [dashboard.timeline],
  );

  const recentRows = React.useMemo(() => dashboard.rows.slice(0, 6), [dashboard.rows]);
  const recentClients = React.useMemo(() => dashboard.clients.slice(0, 5), [dashboard.clients]);

  const updatedLabel = React.useMemo(() => {
    if (!dashboard.updatedAt) return '—';
    const date = new Date(dashboard.updatedAt);
    if (!Number.isFinite(date.getTime())) return '—';
    return new Intl.DateTimeFormat('pt-PT', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    }).format(date);
  }, [dashboard.updatedAt]);

  return (
    <section className="profile-panel" aria-label="Planos publicados">
      <header className="profile-panel__header">
        <div>
          <h2>Planos geridos</h2>
          <p>Resumo dos planos em acompanhamento e dos clientes mais activos.</p>
        </div>
        <div className="profile-panel__headerActions">
          <span className="profile-panel__meta">Actualizado {updatedLabel}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => mutate()}
            leftIcon={isValidating ? <Loader2 className="icon-spin" aria-hidden /> : <RefreshCcw className="icon" aria-hidden />}
            disabled={isValidating}
          >
            Atualizar
          </Button>
        </div>
      </header>

      {error ? (
        <Alert tone="danger" className="profile-panel__alert" title="Erro ao sincronizar planos">
          {error.message || 'Não foi possível ligar ao servidor. A mostrar dados anteriores.'}
        </Alert>
      ) : null}

      <div className="profile-plans__grid">
        <div className="profile-plans__metrics" role="list">
          {dashboard.hero.map((metric) => (
            <article key={metric.id} className={`profile-plans__metric ${metric.tone ?? 'neutral'}`} role="listitem">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              {metric.hint ? <p>{metric.hint}</p> : null}
            </article>
          ))}
        </div>

        <div className="profile-plans__status">
          <h3>Distribuição por estado</h3>
          <ul>
            {statusSummary.map((status) => (
              <li key={status.key} className={`tone-${status.tone}`}>
                <span>{status.label}</span>
                <strong>{status.count}</strong>
              </li>
            ))}
          </ul>
        </div>

        <div className="profile-plans__timeline">
          <header>
            <h3>Atividade recente</h3>
            <span>Últimas 24 semanas</span>
          </header>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ left: 12, right: 12, top: 16, bottom: 0 }}>
              <defs>
                <linearGradient id="trainerPlansCreated" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--neo-chart-primary)" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="var(--neo-chart-primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="trainerPlansUpdated" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--neo-chart-success)" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="var(--neo-chart-success)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="trainerPlansArchived" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--neo-chart-danger)" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="var(--neo-chart-danger)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--neo-chart-grid)" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} minTickGap={28} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
              <Tooltip cursor={{ strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="created" stroke="var(--neo-chart-primary)" fill="url(#trainerPlansCreated)" strokeWidth={2} name="Criados" />
              <Area type="monotone" dataKey="updated" stroke="var(--neo-chart-success)" fill="url(#trainerPlansUpdated)" strokeWidth={2} name="Actualizados" />
              <Area type="monotone" dataKey="archived" stroke="var(--neo-chart-danger)" fill="url(#trainerPlansArchived)" strokeWidth={2} name="Arquivados" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="profile-plans__table">
          <header>
            <h3>Planos recentes</h3>
            <Link href="/dashboard/pt/plans" className="profile-panel__link">
              Abrir gestão de planos
            </Link>
          </header>
          <table>
            <thead>
              <tr>
                <th scope="col">Plano</th>
                <th scope="col">Cliente</th>
                <th scope="col">Estado</th>
                <th scope="col">Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {recentRows.map((row) => (
                <tr key={row.id}>
                  <th scope="row">{row.title}</th>
                  <td>{row.clientName}</td>
                  <td>
                    <span className={`profile-status profile-status--${row.statusTone}`}>
                      {row.statusLabel}
                    </span>
                  </td>
                  <td>{row.updatedLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="profile-trainer__clients">
          <header>
            <h3>Clientes em destaque</h3>
            <Link href="/dashboard/pt/clients" className="profile-panel__link">
              Ver todos os clientes
            </Link>
          </header>
          <ul>
            {recentClients.map((client) => (
              <li key={client.id}>
                <div>
                  <strong>{client.name}</strong>
                  <span>{client.email ?? 'Sem email associado'}</span>
                </div>
                <div className="profile-trainer__clientsMeta">
                  <span>{client.activePlans} ativos</span>
                  <span>{client.totalPlans} totais</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
