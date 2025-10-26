'use client';

import * as React from 'react';
import useSWR from 'swr';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  CalendarDays,
  Clock3,
  Filter,
  MessageSquare,
  RefreshCcw,
  Search as SearchIcon,
  Send,
  Users,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import type {
  MessageHeroMetric,
  MessageHighlight,
  MessageListRow,
  MessageConversationRow,
  MessageDistributionSegment,
  MessageTimelinePoint,
  MessagesDashboardData,
} from '@/lib/messages/types';
import type { MessagesDashboardResponse } from '@/lib/messages/server';
import MessagesFeed from './_components/MessagesFeed';
import MarkAllRead from './parts/MarkAllRead';

const RANGE_OPTIONS = [
  { value: 7, label: '7 dias' },
  { value: 14, label: '14 dias' },
  { value: 30, label: '30 dias' },
  { value: 60, label: '60 dias' },
  { value: 90, label: '90 dias' },
];

const numberFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1, minimumFractionDigits: 0 });
const durationFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });
const relativeFormatter = new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' });

function normalizeSearchTerm(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return numberFormatter.format(Math.round(value));
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0%';
  return `${percentFormatter.format(value * 100)}%`;
}

function formatDuration(minutes: number | null): string {
  if (!Number.isFinite(minutes) || minutes === null) return '—';
  const abs = Math.max(0, minutes);
  const hours = Math.floor(abs / 60);
  const mins = Math.round(abs % 60);
  if (hours >= 1) {
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }
  if (mins > 0) return `${mins}m`;
  return `${durationFormatter.format(Math.round(abs * 60))}s`;
}

function formatRelativeTime(target: Date | null): string | null {
  if (!target) return null;
  const diffMs = target.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const ranges: Array<{ limit: number; unit: Intl.RelativeTimeFormatUnit; size: number }> = [
    { limit: 60_000, unit: 'second', size: 1_000 },
    { limit: 3_600_000, unit: 'minute', size: 60_000 },
    { limit: 86_400_000, unit: 'hour', size: 3_600_000 },
    { limit: 604_800_000, unit: 'day', size: 86_400_000 },
    { limit: 2_629_746_000, unit: 'week', size: 604_800_000 },
    { limit: 31_556_952_000, unit: 'month', size: 2_629_746_000 },
    { limit: Infinity, unit: 'year', size: 31_556_952_000 },
  ];
  const bucket = ranges.find((item) => absMs < item.limit) ?? ranges[ranges.length - 1]!;
  const value = Math.round(diffMs / bucket.size);
  return relativeFormatter.format(value, bucket.unit);
}

type ChartDatum = {
  day: string;
  inbound: number;
  outbound: number;
  replies: number;
  label: string;
};

type DashboardProps = {
  viewerId: string;
  initialRange: number;
  initialData: MessagesDashboardResponse;
};

type DirectionFilter = 'all' | 'inbound' | 'outbound';

type FetchKey = [string, number];

const fetcher = async ([, range]: FetchKey): Promise<MessagesDashboardResponse> => {
  const response = await fetch(`/api/messages/dashboard?range=${range}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    const message = await response.text().catch(() => 'Não foi possível sincronizar as mensagens.');
    throw new Error(message || 'Não foi possível sincronizar as mensagens.');
  }
  const payload = (await response.json()) as MessagesDashboardResponse | { ok?: boolean; message?: string };
  if (!payload || typeof payload !== 'object' || !('ok' in payload) || !payload.ok) {
    throw new Error((payload as any)?.message ?? 'Não foi possível sincronizar as mensagens.');
  }
  return payload as MessagesDashboardResponse;
};

function HeroMetrics({ metrics }: { metrics: MessageHeroMetric[] }) {
  const iconForMetric = React.useCallback((metric: MessageHeroMetric) => {
    switch (metric.key) {
      case 'messages-total':
        return <MessageSquare size={22} aria-hidden />;
      case 'messages-outbound':
        return <Send size={22} aria-hidden />;
      case 'messages-response-time':
        return <Clock3 size={22} aria-hidden />;
      case 'messages-conversations':
        return <Users size={22} aria-hidden />;
      default:
        return <MessageSquare size={22} aria-hidden />;
    }
  }, []);

  return (
    <div className="messages-dashboard__hero" role="list">
      {metrics.map((metric) => (
        <article key={metric.key} className="messages-dashboard__heroCard" data-tone={metric.tone ?? 'neutral'}>
          <span className="messages-dashboard__heroIcon" aria-hidden>
            {iconForMetric(metric)}
          </span>
          <span className="messages-dashboard__heroLabel">{metric.label}</span>
          <strong className="messages-dashboard__heroValue">{metric.value}</strong>
          {metric.hint ? <span className="messages-dashboard__heroHint">{metric.hint}</span> : null}
          {metric.trend ? <span className="messages-dashboard__heroTrend">{metric.trend}</span> : null}
        </article>
      ))}
    </div>
  );
}

type TimelineTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: ChartDatum; value: number; dataKey: keyof ChartDatum; color: string }>;
  label?: string;
};

function TimelineTooltip({ active, payload, label }: TimelineTooltipProps) {
  if (!active || !payload?.length) return null;
  const datum = payload[0]?.payload;
  return (
    <div className="messages-dashboard__tooltip">
      <p className="messages-dashboard__tooltipTitle">{label}</p>
      <dl className="messages-dashboard__tooltipList">
        <div>
          <dt>Entrantes</dt>
          <dd>{formatNumber(datum?.inbound ?? 0)}</dd>
        </div>
        <div>
          <dt>Respondidas</dt>
          <dd>{formatNumber(datum?.replies ?? 0)}</dd>
        </div>
        <div>
          <dt>Enviadas</dt>
          <dd>{formatNumber(datum?.outbound ?? 0)}</dd>
        </div>
      </dl>
    </div>
  );
}

function DistributionList({ distribution }: { distribution: MessageDistributionSegment[] }) {
  if (!distribution.length) {
    return (
      <div className="messages-dashboard__empty" role="status">
        <span className="neo-text--sm neo-text--muted">Sem dados suficientes para calcular a distribuição.</span>
      </div>
    );
  }
  return (
    <ul className="messages-dashboard__distribution" role="list">
      {distribution.map((segment) => (
        <li key={segment.key} className="messages-dashboard__distributionItem" data-tone={segment.tone ?? 'neutral'}>
          <div>
            <span className="messages-dashboard__distributionLabel">{segment.label}</span>
            <span className="messages-dashboard__distributionValue">{formatNumber(segment.value)}</span>
          </div>
          <div className="messages-dashboard__distributionBar" role="presentation">
            <div
              className="messages-dashboard__distributionFill"
              style={{ width: `${Math.min(100, Math.max(0, segment.percentage * 100))}%` }}
            />
            <span className="messages-dashboard__distributionPercent">{formatPercent(segment.percentage)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function HighlightsList({ highlights }: { highlights: MessageHighlight[] }) {
  if (!highlights.length) {
    return (
      <div className="messages-dashboard__empty" role="status">
        <span className="neo-text--sm neo-text--muted">Sem destaques gerados para o intervalo seleccionado.</span>
      </div>
    );
  }
  return (
    <ul className="messages-dashboard__highlights" role="list">
      {highlights.map((highlight) => (
        <li key={highlight.id} className="messages-dashboard__highlight" data-tone={highlight.tone}>
          <div className="messages-dashboard__highlightHeader">
            <span className="messages-dashboard__highlightTitle">{highlight.title}</span>
            <span className="messages-dashboard__highlightValue">{highlight.value}</span>
          </div>
          <p className="messages-dashboard__highlightDescription">{highlight.description}</p>
          {highlight.meta ? <span className="messages-dashboard__highlightMeta">{highlight.meta}</span> : null}
        </li>
      ))}
    </ul>
  );
}

function ConversationsTable({
  conversations,
}: {
  conversations: MessageConversationRow[];
}) {
  if (!conversations.length) {
    return (
      <div className="messages-dashboard__empty" role="status">
        <span className="neo-text--sm neo-text--muted">Nenhuma conversa corresponde aos filtros seleccionados.</span>
      </div>
    );
  }
  return (
    <div className="messages-dashboard__tableWrapper">
      <table className="messages-dashboard__table">
        <thead>
          <tr>
            <th scope="col">Conversa</th>
            <th scope="col">Mensagens</th>
            <th scope="col">Entrantes</th>
            <th scope="col">Respondidas</th>
            <th scope="col">Canal principal</th>
            <th scope="col">Tempo médio de resposta</th>
            <th scope="col">Pendentes</th>
          </tr>
        </thead>
        <tbody>
          {conversations.map((conversation) => (
            <tr key={conversation.id}>
              <th scope="row">
                <div className="messages-dashboard__conversationName">{conversation.counterpartName}</div>
                <span className="messages-dashboard__conversationMeta">
                  {conversation.lastMessageAt ? `Última ${new Date(conversation.lastMessageAt).toLocaleString('pt-PT')}` : 'Sem registos'}
                </span>
              </th>
              <td>{formatNumber(conversation.totalMessages)}</td>
              <td>{formatNumber(conversation.inbound)}</td>
              <td>{formatNumber(conversation.outbound)}</td>
              <td>
                <span className="messages-dashboard__channel" data-channel={conversation.mainChannel}>
                  {conversation.mainChannelLabel}
                </span>
              </td>
              <td>{formatDuration(conversation.averageResponseMinutes)}</td>
              <td>
                {conversation.pendingResponses > 0 ? (
                  <span className="messages-dashboard__pending" data-active>
                    {formatNumber(conversation.pendingResponses)}
                  </span>
                ) : (
                  <span className="messages-dashboard__pending">0</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MessagesDashboardClient({ viewerId, initialRange, initialData }: DashboardProps) {
  const [range, setRange] = React.useState(initialRange);
  const [directionFilter, setDirectionFilter] = React.useState<DirectionFilter>('all');
  const [search, setSearch] = React.useState('');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data, error, isValidating, mutate } = useSWR<MessagesDashboardResponse, Error, FetchKey>(
    ['messages-dashboard', range],
    fetcher,
    {
      fallbackData: initialData,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const dashboard = data ?? initialData;
  const supabase = dashboard.source === 'supabase';
  const normalizedSearch = React.useMemo(() => normalizeSearchTerm(search), [search]);
  const totalMessages = React.useMemo(
    () => dashboard.totals.inbound + dashboard.totals.outbound,
    [dashboard.totals.inbound, dashboard.totals.outbound],
  );
  const generatedAt = React.useMemo(() => {
    const date = dashboard.generatedAt ? new Date(dashboard.generatedAt) : null;
    return date && Number.isNaN(date.getTime()) ? null : date;
  }, [dashboard.generatedAt]);
  const generatedRelative = React.useMemo(() => formatRelativeTime(generatedAt), [generatedAt]);
  const pendingResponses = dashboard.totals.pendingResponses;

  const timelineData = React.useMemo<ChartDatum[]>(() => {
    return (dashboard.timeline ?? []).map((point: MessageTimelinePoint) => ({
      day: point.day,
      inbound: point.inbound,
      outbound: point.outbound,
      replies: point.replies,
      label: point.label,
    }));
  }, [dashboard.timeline]);

  const filteredConversations = React.useMemo(() => {
    const query = normalizedSearch;
    return (dashboard.conversations ?? [])
      .filter((conversation) => {
        if (query) {
          const haystack = normalizeSearchTerm(
            [
              conversation.counterpartName,
              conversation.counterpartId ?? '',
              conversation.mainChannelLabel,
              conversation.mainChannel,
              conversation.pendingResponses > 0 ? 'pendente' : '',
            ].join(' '),
          );
          if (!haystack.includes(query)) return false;
        }
        if (directionFilter === 'inbound') return conversation.inbound > 0;
        if (directionFilter === 'outbound') return conversation.outbound > 0;
        return true;
      })
      .slice(0, 40);
  }, [dashboard.conversations, normalizedSearch, directionFilter]);

  const filteredMessages = React.useMemo<MessageListRow[]>(() => {
    const query = normalizedSearch;
    return (dashboard.messages ?? []).filter((message) => {
      if (directionFilter !== 'all' && message.direction !== directionFilter) return false;
      if (query) {
        const content = normalizeSearchTerm(
          [
            message.body ?? '',
            message.fromName ?? '',
            message.toName ?? '',
            message.fromId ?? '',
            message.toId ?? '',
            message.channelLabel ?? '',
            message.channel,
            message.relative ?? '',
            message.direction === 'outbound'
              ? 'enviada'
              : message.direction === 'inbound'
              ? 'recebida'
              : 'interna',
          ].join(' '),
        );
        if (!content.includes(query)) return false;
      }
      return true;
    });
  }, [dashboard.messages, directionFilter, normalizedSearch]);

  const onRangeChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = Number(event.target.value);
      setRange(value);
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      params.set('range', String(value));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const onDirectionChange = (value: DirectionFilter) => {
    setDirectionFilter(value);
  };

  const onRefresh = () => {
    void mutate();
  };

  const goToComposer = React.useCallback(() => {
    router.push('/dashboard/messages/new');
  }, [router]);

  const isFallback = dashboard.source === 'fallback';

  React.useEffect(() => {
    const raw = searchParams?.get('range') ?? null;
    if (raw) {
      const value = Number(raw);
      if (
        Number.isFinite(value) &&
        RANGE_OPTIONS.some((option) => option.value === value) &&
        value !== range
      ) {
        setRange(value);
      }
      return;
    }
    if (range !== initialRange) {
      setRange(initialRange);
    }
  }, [searchParams, range, initialRange]);

  return (
    <div className="messages-dashboard">
      <PageHeader
        title="Mensagens"
        subtitle="Analisa os canais mais activos, tempos de resposta e identifica conversas que precisam de acompanhamento."
        actions={
          <div className="messages-dashboard__headerActions">
            <Button size="sm" onClick={goToComposer} leftIcon={<Send size={16} aria-hidden />}>
              Nova mensagem
            </Button>
          </div>
        }
      />

      {error ? (
        <Alert tone="danger" title="Não foi possível actualizar as métricas">
          {error.message || 'Verifica a ligação e tenta novamente.'}
        </Alert>
      ) : null}

      {isFallback ? (
        <Alert tone="warning" title="A mostrar dados de demonstração">
          Não foi possível sincronizar com o servidor. Estás a ver dados determinísticos para manter a experiência operacional.
        </Alert>
      ) : null}

      <section className="messages-dashboard__status neo-panel neo-panel--subtle" aria-label="Estado dos dados">
        <div className="messages-dashboard__statusRow">
          <div className="messages-dashboard__statusMain">
            <DataSourceBadge source={dashboard.source} generatedAt={dashboard.generatedAt} />
            {generatedRelative ? (
              <span className="messages-dashboard__statusChip">
                <Clock3 size={14} aria-hidden />
                Actualizado {generatedRelative}
              </span>
            ) : null}
            <span className="messages-dashboard__statusChip">
              <CalendarDays size={14} aria-hidden />
              Intervalo {dashboard.range.label}
            </span>
          </div>
          <div className="messages-dashboard__statusActions">
            <label className="messages-dashboard__selectGroup">
              <span>Intervalo</span>
              <select value={range} onChange={onRangeChange}>
                {RANGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <Button
              onClick={onRefresh}
              variant="ghost"
              size="sm"
              loading={isValidating}
              leftIcon={<RefreshCcw size={16} aria-hidden />}
            >
              Actualizar
            </Button>
            <MarkAllRead size="sm" variant={supabase ? 'secondary' : 'warning'} />
          </div>
        </div>
        <div className="messages-dashboard__statusRow messages-dashboard__statusRow--stats">
          <span className="messages-dashboard__stat">
            <MessageSquare size={16} aria-hidden />
            <span>
              <strong>{formatNumber(totalMessages)}</strong>
              <small>Total de mensagens</small>
            </span>
          </span>
          <span className="messages-dashboard__stat">
            <Users size={16} aria-hidden />
            <span>
              <strong>{formatNumber(dashboard.totals.participants)}</strong>
              <small>Participantes únicos</small>
            </span>
          </span>
          <span className="messages-dashboard__stat">
            <Filter size={16} aria-hidden />
            <span>
              <strong>{formatNumber(filteredConversations.length)}</strong>
              <small>Conversas filtradas</small>
            </span>
          </span>
          <span className="messages-dashboard__stat" data-warning={pendingResponses > 0 || undefined}>
            <Clock3 size={16} aria-hidden />
            <span>
              <strong>{formatNumber(pendingResponses)}</strong>
              <small>Respostas pendentes</small>
            </span>
          </span>
        </div>
      </section>

      <section className="neo-stack neo-stack--lg">
        <HeroMetrics metrics={dashboard.hero} />

        <div className="messages-dashboard__panel neo-panel">
          <header className="messages-dashboard__panelHeader">
            <div>
              <h2 className="messages-dashboard__panelTitle">Volume diário</h2>
              <p className="messages-dashboard__panelSubtitle">
                Evolução das mensagens recebidas e respondidas no período seleccionado.
              </p>
            </div>
          </header>
          <div className="messages-dashboard__chart">
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={timelineData} margin={{ top: 16, left: 0, right: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" stroke="var(--muted-fg)" tickLine={false} interval="preserveStartEnd" />
                <YAxis stroke="var(--muted-fg)" tickFormatter={(value: number) => formatNumber(value)} tickLine={false} />
                <Tooltip content={<TimelineTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Area type="monotone" dataKey="inbound" fill="var(--neo-primary-soft)" stroke="var(--neo-primary)" name="Entrantes" />
                <Line type="monotone" dataKey="replies" stroke="var(--neo-success)" strokeWidth={2} dot={false} name="Respondidas" />
                <Line type="monotone" dataKey="outbound" stroke="var(--neo-info)" strokeWidth={2} dot={false} name="Enviadas" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="messages-dashboard__split">
          <section className="messages-dashboard__panel neo-panel">
            <header className="messages-dashboard__panelHeader">
              <div>
                <h2 className="messages-dashboard__panelTitle">Distribuição por canal</h2>
                <p className="messages-dashboard__panelSubtitle">Percebe onde os clientes preferem interagir contigo.</p>
              </div>
            </header>
            <DistributionList distribution={dashboard.distribution} />
          </section>

          <section className="messages-dashboard__panel neo-panel">
            <header className="messages-dashboard__panelHeader">
              <div>
                <h2 className="messages-dashboard__panelTitle">Destaques automáticos</h2>
                <p className="messages-dashboard__panelSubtitle">
                  Insights sobre conversas activas, tempos de resposta e pendentes críticos.
                </p>
              </div>
            </header>
            <HighlightsList highlights={dashboard.highlights} />
          </section>
        </div>

        <section className="messages-dashboard__panel neo-panel">
          <header className="messages-dashboard__panelHeader messages-dashboard__panelHeader--controls">
            <div>
              <h2 className="messages-dashboard__panelTitle">Conversa por participante</h2>
              <p className="messages-dashboard__panelSubtitle">
                Tabela filtrável com os contactos mais activos e respectivos tempos de resposta.
              </p>
            </div>
            <div className="messages-dashboard__filters">
              <div className="messages-dashboard__segmented" role="group" aria-label="Filtrar direcção">
                <button
                  type="button"
                  className={`messages-dashboard__segmentedItem${directionFilter === 'all' ? ' is-active' : ''}`}
                  onClick={() => onDirectionChange('all')}
                >
                  Todas
                </button>
                <button
                  type="button"
                  className={`messages-dashboard__segmentedItem${directionFilter === 'inbound' ? ' is-active' : ''}`}
                  onClick={() => onDirectionChange('inbound')}
                >
                  Recebidas
                </button>
                <button
                  type="button"
                  className={`messages-dashboard__segmentedItem${directionFilter === 'outbound' ? ' is-active' : ''}`}
                  onClick={() => onDirectionChange('outbound')}
                >
                  Enviadas
                </button>
              </div>
              <label className="messages-dashboard__search">
                <span className="sr-only">Pesquisar mensagens</span>
                <SearchIcon aria-hidden size={16} />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Procurar por nome, conteúdo ou canal"
                  className="neo-field"
                />
              </label>
            </div>
          </header>
          <ConversationsTable conversations={filteredConversations} />
        </section>

        <section className="messages-dashboard__panel neo-panel">
          <header className="messages-dashboard__panelHeader">
            <div>
              <h2 className="messages-dashboard__panelTitle">Linha temporal</h2>
              <p className="messages-dashboard__panelSubtitle">
                Histórico das mensagens filtradas por direcção e pesquisa textual.
              </p>
            </div>
            <span className="messages-dashboard__panelMeta">
              {formatNumber(filteredMessages.length)} mensagem(ns)
              {isValidating ? ' • a sincronizar…' : null}
            </span>
          </header>
          <MessagesFeed viewerId={viewerId} messages={filteredMessages} />
        </section>
      </section>
    </div>
  );
}
