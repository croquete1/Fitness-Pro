'use client';

import * as React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Loader2, Mail, RefreshCcw, ArrowUpRight } from 'lucide-react';

import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import type { MessagesDashboardResponse } from '@/lib/messages/server';

const DASHBOARD_ENDPOINT = '/api/messages/dashboard';

type ViewerRole = 'client' | 'pt' | 'admin';

type ProfileMessagesPanelProps = {
  initialData: MessagesDashboardResponse;
  viewerRole?: ViewerRole;
  rangeDays?: number;
};

const fetcher = async (url: string): Promise<MessagesDashboardResponse> => {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || 'Não foi possível sincronizar as mensagens.');
  }

  const payload = (await response.json()) as MessagesDashboardResponse | { ok?: boolean; message?: string };
  if (!payload || typeof payload !== 'object' || (payload as { ok?: boolean }).ok !== true) {
    throw new Error((payload as { message?: string })?.message ?? 'Não foi possível sincronizar as mensagens.');
  }

  return payload as MessagesDashboardResponse;
};

function formatDateTime(value: string | null | undefined) {
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

function formatDuration(minutes: number | null | undefined) {
  if (!Number.isFinite(minutes) || minutes == null) return '—';
  const total = Math.max(0, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  if (mins > 0) return `${mins}m`;
  return `${total * 60}s`;
}

function resolveHeaderDescription(role: ViewerRole): string {
  switch (role) {
    case 'pt':
      return 'Acompanha as conversas activas com clientes e identifica contactos que precisam de resposta.';
    case 'admin':
      return 'Monitoriza a actividade das mensagens enviadas pela equipa e distribui melhor os follow-ups.';
    case 'client':
    default:
      return 'Mantém-te a par das mensagens trocadas com a equipa e responde sem sair do perfil.';
  }
}

export default function ProfileMessagesPanel({
  initialData,
  viewerRole = 'client',
  rangeDays = 14,
}: ProfileMessagesPanelProps) {
  const query = React.useMemo(() => `${DASHBOARD_ENDPOINT}?range=${rangeDays}`, [rangeDays]);
  const { data, error, isValidating, mutate } = useSWR<MessagesDashboardResponse>(
    query,
    fetcher,
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
      refreshInterval: 60_000,
    },
  );

  const dashboard = data ?? initialData;
  const heroMetrics = React.useMemo(() => dashboard.hero.slice(0, 3), [dashboard.hero]);
  const distribution = React.useMemo(() => dashboard.distribution.slice(0, 4), [dashboard.distribution]);
  const conversations = React.useMemo(() => dashboard.conversations.slice(0, 6), [dashboard.conversations]);
  const recentMessages = React.useMemo(() => dashboard.messages.slice(0, 6), [dashboard.messages]);
  const highlight = React.useMemo(() => dashboard.highlights.at(0) ?? null, [dashboard.highlights]);

  return (
    <section className="profile-panel profile-messages" aria-label="Resumo de mensagens">
      <header className="profile-panel__header">
        <div>
          <h2>Mensagens e alertas</h2>
          <p>{resolveHeaderDescription(viewerRole)}</p>
        </div>
        <div className="profile-panel__headerActions">
          <span className="profile-panel__meta">Intervalo · {dashboard.range.label}</span>
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
        <Alert tone="danger" className="profile-panel__alert" title="Erro ao sincronizar mensagens">
          {error.message || 'Não foi possível ligar ao servidor. Estamos a mostrar os últimos dados disponíveis.'}
        </Alert>
      ) : null}

      {highlight ? (
        <div className={`profile-messages__highlight tone-${highlight.tone}`}>
          <strong>{highlight.title}</strong>
          <p>{highlight.description}</p>
          <div className="profile-messages__highlightMeta">
            <span>{highlight.value}</span>
            {highlight.meta ? <small>{highlight.meta}</small> : null}
          </div>
        </div>
      ) : null}

      <div className="profile-messages__grid">
        <div className="profile-messages__metrics" role="list">
          {heroMetrics.map((metric) => (
            <article key={metric.key} className={`profile-messages__metric tone-${metric.tone ?? 'neutral'}`} role="listitem">
              <header>
                <span>{metric.label}</span>
              </header>
              <strong>{metric.value}</strong>
              {metric.hint ? <p>{metric.hint}</p> : null}
              {metric.trend ? <small>{metric.trend}</small> : null}
            </article>
          ))}
        </div>

        <div className="profile-messages__distribution">
          <header>
            <h3>Canais utilizados</h3>
          </header>
          <ul>
            {distribution.length ? (
              distribution.map((segment) => (
                <li key={segment.key} className={`tone-${segment.tone ?? 'neutral'}`}>
                  <div>
                    <span>{segment.label}</span>
                    <strong>{segment.value}</strong>
                  </div>
                  <small>{segment.percentage.toFixed(0)}%</small>
                </li>
              ))
            ) : (
              <li className="profile-dashboard__empty">Sem dados disponíveis.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="profile-messages__lists">
        <article className="profile-messages__conversations">
          <header>
            <div>
              <h3>Conversas principais</h3>
              <p>Prioriza os contactos com mais actividade e respostas pendentes.</p>
            </div>
            <Link href="/dashboard/messages" className="profile-panel__link">
              Abrir mensagens <ArrowUpRight className="icon" aria-hidden />
            </Link>
          </header>
          <table>
            <thead>
              <tr>
                <th scope="col">Contacto</th>
                <th scope="col">Mensagens</th>
                <th scope="col">Última</th>
                <th scope="col">Resposta média</th>
              </tr>
            </thead>
            <tbody>
              {conversations.length ? (
                conversations.map((conversation) => (
                  <tr key={conversation.id}>
                    <th scope="row">
                      <span>{conversation.counterpartName}</span>
                      {conversation.pendingResponses > 0 ? (
                        <small className="profile-messages__pending">{conversation.pendingResponses} pendentes</small>
                      ) : null}
                    </th>
                    <td>
                      <span className="profile-messages__badge">
                        <Mail className="icon" aria-hidden /> {conversation.totalMessages}
                      </span>
                    </td>
                    <td>{formatDateTime(conversation.lastMessageAt)}</td>
                    <td>{formatDuration(conversation.averageResponseMinutes)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="profile-dashboard__empty">
                    Sem conversas recentes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </article>

        <article className="profile-messages__activity">
          <header>
            <h3>Mensagens recentes</h3>
          </header>
          <ul className="profile-messages__messageList">
            {recentMessages.length ? (
              recentMessages.map((message) => (
                <li key={message.id}>
                  <div className="profile-messages__messageHeader">
                    <span>{message.direction === 'inbound' ? message.fromName ?? 'Recebida' : message.toName ?? 'Enviada'}</span>
                    <time dateTime={message.sentAt ?? undefined}>{message.relative ?? formatDateTime(message.sentAt)}</time>
                  </div>
                  <p>{message.body ?? 'Mensagem sem conteúdo de texto.'}</p>
                  <div className="profile-messages__messageMeta">
                    <span className={`profile-messages__chip tone-${message.channel}`}>
                      {message.channelLabel}
                    </span>
                    {Number.isFinite(message.responseMinutes) && message.responseMinutes != null ? (
                      <span className="profile-messages__chip tone-neutral">
                        Resp. em {formatDuration(message.responseMinutes)}
                      </span>
                    ) : null}
                  </div>
                </li>
              ))
            ) : (
              <li className="profile-dashboard__empty">Ainda não existem mensagens recentes.</li>
            )}
          </ul>
        </article>
      </div>
    </section>
  );
}
