'use client';

import * as React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
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
import type { PlanStatusKey, PlansDashboardPayload } from '@/lib/plans/types';

const STATUS_LABELS: Record<PlanStatusKey, string> = {
  active: 'Ativo',
  draft: 'Rascunho',
  archived: 'Arquivado',
  deleted: 'Removido',
  unknown: 'Indefinido',
};

const STATUS_TONE: Record<PlanStatusKey, 'positive' | 'warning' | 'critical' | 'neutral'> = {
  active: 'positive',
  draft: 'warning',
  archived: 'neutral',
  deleted: 'critical',
  unknown: 'warning',
};

export type ProfilePlansPanelData = PlansDashboardPayload;

const fetcher = async (url: string): Promise<ProfilePlansPanelData> => {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || 'Não foi possível sincronizar os planos.');
  }
  const payload = (await response.json()) as ProfilePlansPanelData;
  if (!payload?.ok) {
    throw new Error(payload?.message || 'Não foi possível sincronizar os planos.');
  }
  return payload;
};

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function resolveStatus(value: string | null | undefined): PlanStatusKey {
  if (!value) return 'unknown';
  const key = value.toString().trim().toUpperCase();
  switch (key) {
    case 'ACTIVE':
    case 'APPROVED':
    case 'LIVE':
      return 'active';
    case 'ARCHIVED':
    case 'COMPLETED':
    case 'FINISHED':
      return 'archived';
    case 'DELETED':
    case 'CANCELLED':
      return 'deleted';
    case 'DRAFT':
    case 'WAITING':
    case 'PENDING':
    case 'PAUSED':
      return 'draft';
    default:
      return 'unknown';
  }
}

type ProfilePlansPanelProps = {
  initialData: ProfilePlansPanelData;
};

export default function ProfilePlansPanel({ initialData }: ProfilePlansPanelProps) {
  const { data, error, isValidating, mutate } = useSWR<ProfilePlansPanelData>(
    '/api/client/plans/dashboard',
    fetcher,
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
      refreshInterval: 60_000,
    },
  );

  const dashboard = data ?? initialData;
  const recentPlans = React.useMemo(() => dashboard.rows.slice(0, 6), [dashboard.rows]);
  const statusSummary = React.useMemo(() => {
    const map = new Map<PlanStatusKey, number>();
    dashboard.statuses.forEach((item) => {
      map.set(item.key, item.count);
    });
    return Array.from(map.entries())
      .filter(([key]) => key !== 'unknown')
      .sort((a, b) => b[1] - a[1]);
  }, [dashboard.statuses]);

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

  const updatedAtLabel = React.useMemo(() => {
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
    <section className="profile-panel" aria-label="Planos de treino">
      <header className="profile-panel__header">
        <div>
          <h2>Planos de treino</h2>
          <p>Resumo dos planos atribuídos, evolução semanal e próximas entregas.</p>
        </div>
        <div className="profile-panel__headerActions">
          <span className="profile-panel__meta">Actualizado {updatedAtLabel}</span>
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
          {error.message || 'Não foi possível sincronizar com o servidor. A mostrar dados anteriores.'}
        </Alert>
      ) : null}

      <div className="profile-plans__grid">
        <div className="profile-plans__metrics" role="list">
          {dashboard.hero.map((metric) => (
            <article key={metric.key} className={`profile-plans__metric ${metric.tone ?? 'neutral'}`} role="listitem">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              {metric.hint ? <p>{metric.hint}</p> : null}
            </article>
          ))}
        </div>

        <div className="profile-plans__status">
          <h3>Estado dos planos</h3>
          <ul>
            {statusSummary.map(([status, count]) => (
              <li key={status} className={`tone-${STATUS_TONE[status]}`}>
                <span>{STATUS_LABELS[status]}</span>
                <strong>{count}</strong>
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
                <linearGradient id="profilePlansCreated" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--neo-chart-primary)" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="var(--neo-chart-primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profilePlansUpdated" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--neo-chart-success)" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="var(--neo-chart-success)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profilePlansArchived" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--neo-chart-danger)" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="var(--neo-chart-danger)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--neo-chart-grid)" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} minTickGap={28} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
              <Tooltip cursor={{ strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="created" stroke="var(--neo-chart-primary)" fill="url(#profilePlansCreated)" strokeWidth={2} name="Criados" />
              <Area type="monotone" dataKey="updated" stroke="var(--neo-chart-success)" fill="url(#profilePlansUpdated)" strokeWidth={2} name="Actualizados" />
              <Area type="monotone" dataKey="archived" stroke="var(--neo-chart-danger)" fill="url(#profilePlansArchived)" strokeWidth={2} name="Arquivados" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="profile-plans__table">
          <header>
            <h3>Planos recentes</h3>
            <Link href="/dashboard/plans" className="profile-panel__link">
              Ver todos
            </Link>
          </header>
          <table>
            <thead>
              <tr>
                <th scope="col">Plano</th>
                <th scope="col">Estado</th>
                <th scope="col">Personal Trainer</th>
                <th scope="col">Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {recentPlans.map((plan) => {
                const statusKey = resolveStatus(plan.status);
                return (
                  <tr key={plan.id}>
                    <th scope="row">{plan.title ?? 'Plano sem título'}</th>
                    <td>
                      <span className={`profile-status profile-status--${STATUS_TONE[statusKey]}`}>
                        {STATUS_LABELS[statusKey]}
                      </span>
                    </td>
                    <td>{plan.trainerName ?? plan.trainerEmail ?? '—'}</td>
                    <td>{formatDate(plan.updatedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
