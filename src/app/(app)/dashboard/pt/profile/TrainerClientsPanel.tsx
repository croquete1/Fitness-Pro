'use client';

import * as React from 'react';
import Link from 'next/link';
import { Loader2, RefreshCcw, Users2 } from 'lucide-react';

import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import type { TrainerPlansDashboardPayload } from '@/lib/trainer/plans/types';
import { useTrainerPlansDashboard } from './useTrainerPlansDashboard';

export type TrainerClientsPanelProps = {
  initialData: TrainerPlansDashboardPayload;
};

function formatUpdatedLabel(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export default function TrainerClientsPanel({ initialData }: TrainerClientsPanelProps) {
  const { data, error, isValidating, mutate } = useTrainerPlansDashboard(initialData);
  const dashboard = data ?? initialData;

  const clientTotals = React.useMemo(() => {
    return dashboard.clients.reduce(
      (acc, client) => {
        acc.total += 1;
        acc.active += client.activePlans;
        acc.plans += client.totalPlans;
        if (client.tone === 'critical') acc.risk += 1;
        return acc;
      },
      { total: 0, active: 0, plans: 0, risk: 0 },
    );
  }, [dashboard.clients]);

  const topClients = React.useMemo(() => dashboard.clients.slice(0, 8), [dashboard.clients]);
  const updatedLabel = React.useMemo(() => formatUpdatedLabel(dashboard.updatedAt), [dashboard.updatedAt]);

  return (
    <section className="profile-panel profile-trainer-clients" aria-label="Clientes acompanhados">
      <header className="profile-panel__header">
        <div>
          <h2>Clientes acompanhados</h2>
          <p>Visualiza quem precisa de acompanhamento extra e consulta o histórico de planos activos.</p>
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
        <Alert tone="danger" className="profile-panel__alert" title="Erro ao sincronizar clientes">
          {error.message || 'Não foi possível ligar ao servidor. Estamos a mostrar os últimos dados disponíveis.'}
        </Alert>
      ) : null}

      <div className="profile-trainer-clients__grid">
        <div className="profile-trainer-clients__summary" role="list">
          <article className="profile-trainer-clients__metric" role="listitem">
            <header>
              <Users2 className="icon" aria-hidden />
              <span>Total de clientes</span>
            </header>
            <strong>{clientTotals.total}</strong>
            <p>Clientes com planos atribuídos recentemente.</p>
          </article>
          <article className="profile-trainer-clients__metric" role="listitem">
            <header>
              <span>Planos activos</span>
            </header>
            <strong>{clientTotals.active}</strong>
            <p>Planos actualmente em acompanhamento.</p>
          </article>
          <article className="profile-trainer-clients__metric" role="listitem">
            <header>
              <span>Planos entregues</span>
            </header>
            <strong>{clientTotals.plans}</strong>
            <p>Total de planos atribuídos no período em análise.</p>
          </article>
          <article className="profile-trainer-clients__metric" role="listitem">
            <header>
              <span>Clientes em risco</span>
            </header>
            <strong>{clientTotals.risk}</strong>
            <p>Sessões com sinalização crítica ou cancelamentos sucessivos.</p>
          </article>
        </div>

        <div className="profile-trainer-clients__table">
          <header>
            <div>
              <h3>Clientes prioritários</h3>
              <p>Ordenados por interacções recentes e número de planos activos.</p>
            </div>
            <Link href="/dashboard/pt/clients" className="profile-panel__link">
              Gerir clientes
            </Link>
          </header>
          <table>
            <thead>
              <tr>
                <th scope="col">Cliente</th>
                <th scope="col">Planos activos</th>
                <th scope="col">Total de planos</th>
                <th scope="col">Última actualização</th>
              </tr>
            </thead>
            <tbody>
              {topClients.length ? (
                topClients.map((client) => (
                  <tr key={client.id} data-tone={client.tone}>
                    <th scope="row">
                      <span>{client.name}</span>
                      {client.email ? <small>{client.email}</small> : null}
                    </th>
                    <td>{client.activePlans}</td>
                    <td>{client.totalPlans}</td>
                    <td>{client.lastUpdateLabel}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="profile-dashboard__empty">
                    Ainda não existem clientes associados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
