'use client';

import * as React from 'react';
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
  Sparkles,
  Users,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import { useRealtimeResource } from '@/lib/supabase/useRealtimeResource';
import type {
  MessageHeroMetric,
  MessageHighlight,
  MessageListRow,
  MessageDirection,
  MessageTimelinePoint,
  MessagesDashboardData,
} from '@/lib/messages/types';
import type { MessagesDashboardResponse } from '@/lib/messages/server';
import MessagesFeed from './_components/MessagesFeed';
import ChatPanel from './_components/ChatPanel';
import MarkAllRead from './parts/MarkAllRead';

const RANGE_OPTIONS = [
  { value: 7, label: '7 dias' },
  { value: 14, label: '14 dias' },
  { value: 30, label: '30 dias' },
  { value: 60, label: '60 dias' },
  { value: 90, label: '90 dias' },
];

const numberFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });
const relativeFormatter = new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' });

function normalizeSearchTerm(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeSearchTerm(value: string): string[] {
  if (!value) return [];
  const unique = new Set<string>();
  value
    .split(' ')
    .map((token) => token.trim())
    .filter(Boolean)
    .forEach((token) => unique.add(token));
  return Array.from(unique);
}

function matchesSearchTokens(haystack: string, tokens: string[]): boolean {
  if (!tokens.length) return true;
  if (!haystack) return false;
  return tokens.every((token) => haystack.includes(token));
}

function directionTokens(direction: MessageDirection): string {
  switch (direction) {
    case 'inbound':
      return 'recebida recebidas inbound entrante entrada';
    case 'outbound':
      return 'enviada enviadas outbound enviada';
    case 'internal':
      return 'interna internas interno equipa';
    default:
      return '';
  }
}

type MessageIndexEntry = {
  message: MessageListRow;
  searchIndex: string;
};

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return numberFormatter.format(Math.round(value));
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

type DirectionFilter = 'all' | 'inbound' | 'outbound' | 'internal';

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

export default function MessagesDashboardClient({ viewerId, initialRange, initialData }: DashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const counterpartParam = searchParams?.get('counterpart');
  const threadParam = searchParams?.get('thread');
  const [range, setRange] = React.useState(() => {
    const raw = searchParams?.get('range');
    if (raw) {
      const value = Number(raw);
      if (Number.isFinite(value) && RANGE_OPTIONS.some((option) => option.value === value)) {
        return value;
      }
    }
    return initialRange;
  });
  const [directionFilter, setDirectionFilter] = React.useState<DirectionFilter>(() => {
    const raw = searchParams?.get('direction');
    return raw === 'inbound' || raw === 'outbound' || raw === 'internal' ? raw : 'all';
  });
  const [search, setSearch] = React.useState(() => searchParams?.get('q') ?? '');
  const updateQueryParams = React.useCallback(
    (next: { range?: number; direction?: DirectionFilter; search?: string }) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      let changed = false;

      if (typeof next.range === 'number') {
        if (next.range === initialRange) {
          if (params.has('range')) {
            params.delete('range');
            changed = true;
          }
        } else if (params.get('range') !== String(next.range)) {
          params.set('range', String(next.range));
          changed = true;
        }
      }

      if (next.direction) {
        if (next.direction === 'all') {
          if (params.has('direction')) {
            params.delete('direction');
            changed = true;
          }
        } else if (params.get('direction') !== next.direction) {
          params.set('direction', next.direction);
          changed = true;
        }
      }

      if (typeof next.search === 'string') {
        const trimmed = next.search.trim();
        if (!trimmed) {
          if (params.has('q')) {
            params.delete('q');
            changed = true;
          }
        } else if (params.get('q') !== trimmed) {
          params.set('q', trimmed);
          changed = true;
        }
      }

      if (!changed) {
        return;
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [initialRange, pathname, router, searchParams],
  );

  const messagesKey = React.useMemo<FetchKey>(() => ['messages-dashboard', range], [range]);
  const messageSubscriptions = React.useMemo(
    () =>
      viewerId
        ? [
            { table: 'messages', filter: `from_id=eq.${viewerId}` },
            { table: 'messages', filter: `to_id=eq.${viewerId}` },
          ]
        : [],
    [viewerId],
  );

  const { data, error, isValidating, refresh: refreshDashboard } = useRealtimeResource<
    MessagesDashboardResponse,
    FetchKey
  >({
    key: messagesKey,
    fetcher,
    initialData,
    channel: `messages-dashboard-${viewerId ?? 'anonymous'}`,
    subscriptions: messageSubscriptions,
    realtimeEnabled: Boolean(viewerId),
  });

  const dashboard = data ?? initialData;
  const supabase = dashboard.source === 'supabase';
  const deferredSearch = React.useDeferredValue(search);
  const normalizedSearch = React.useMemo(() => normalizeSearchTerm(deferredSearch), [deferredSearch]);
  const searchTokens = React.useMemo(() => tokenizeSearchTerm(normalizedSearch), [normalizedSearch]);
  const totalMessages = React.useMemo(
    () => dashboard.totals.inbound + dashboard.totals.outbound + dashboard.totals.internal,
    [dashboard.totals.inbound, dashboard.totals.outbound, dashboard.totals.internal],
  );
  const generatedAt = React.useMemo(() => {
    const date = dashboard.generatedAt ? new Date(dashboard.generatedAt) : null;
    return date && Number.isNaN(date.getTime()) ? null : date;
  }, [dashboard.generatedAt]);
  const generatedRelative = React.useMemo(() => formatRelativeTime(generatedAt), [generatedAt]);
  const pendingResponses = dashboard.totals.pendingResponses;
  const hasPendingResponses = pendingResponses > 0;
  const responseMetric = React.useMemo(
    () => dashboard.hero.find((metric) => metric.key === 'messages-response-time') ?? null,
    [dashboard.hero],
  );
  const scrollToChat = React.useCallback(() => {
    const element = document.getElementById('messages-chat');
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  React.useEffect(() => {
    const rawRange = searchParams?.get('range');
    const parsedRange = rawRange ? Number(rawRange) : NaN;
    if (
      rawRange &&
      Number.isFinite(parsedRange) &&
      RANGE_OPTIONS.some((option) => option.value === parsedRange)
    ) {
      setRange((current) => (current === parsedRange ? current : parsedRange));
    } else {
      setRange((current) => (current === initialRange ? current : initialRange));
    }

    const rawDirection = searchParams?.get('direction');
    const nextDirection: DirectionFilter =
      rawDirection === 'inbound' || rawDirection === 'outbound' || rawDirection === 'internal'
        ? rawDirection
        : 'all';
    setDirectionFilter((current) => (current === nextDirection ? current : nextDirection));

    const rawSearch = searchParams?.get('q') ?? '';
    setSearch((current) => (current === rawSearch ? current : rawSearch));
  }, [initialRange, searchParams]);

  React.useEffect(() => {
    const handle = window.setTimeout(() => {
      updateQueryParams({ search });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [search, updateQueryParams]);

  const timelineData = React.useMemo<ChartDatum[]>(() => {
    return (dashboard.timeline ?? []).map((point: MessageTimelinePoint) => ({
      day: point.day,
      inbound: point.inbound,
      outbound: point.outbound,
      replies: point.replies,
      label: point.label,
    }));
  }, [dashboard.timeline]);

  const messageIndex = React.useMemo<MessageIndexEntry[]>(() => {
    return (dashboard.messages ?? []).map((message) => {
      const hasResponseMinutes =
        typeof message.responseMinutes === 'number' && Number.isFinite(message.responseMinutes);
      const responseToken = hasResponseMinutes
        ? `tempo-resposta ${message.responseMinutes}`
        : 'sem-tempo-resposta';
      const searchIndex = normalizeSearchTerm(
        [
          message.body ?? '',
          message.fromName ?? '',
          message.toName ?? '',
          message.fromId ?? '',
          message.toId ?? '',
          message.channelLabel ?? '',
          message.channel,
          message.relative ?? '',
          directionTokens(message.direction),
          responseToken,
          message.sentAt ?? '',
          message.id,
        ].join(' '),
      );
      return { message, searchIndex } satisfies MessageIndexEntry;
    });
  }, [dashboard.messages]);

  const filteredMessages = React.useMemo<MessageListRow[]>(() => {
    return messageIndex
      .filter(({ message, searchIndex }) => {
        if (directionFilter !== 'all' && message.direction !== directionFilter) return false;
        if (searchTokens.length && !matchesSearchTokens(searchIndex, searchTokens)) return false;
        return true;
      })
      .map(({ message }) => message);
  }, [messageIndex, directionFilter, searchTokens]);

  const onRangeChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = Number(event.target.value);
      setRange(value);
      updateQueryParams({ range: value });
    },
    [updateQueryParams],
  );

  const onDirectionChange = React.useCallback(
    (value: DirectionFilter) => {
      setDirectionFilter(value);
      updateQueryParams({ direction: value });
    },
    [updateQueryParams],
  );

  const onRefresh = () => {
    void refreshDashboard();
  };

  const goToComposer = React.useCallback(() => {
    router.push('/dashboard/messages/new');
  }, [router]);

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

      <section className="messages-dashboard__cta" aria-label="Enviar mensagem ao Personal Trainer">
        <div className="messages-dashboard__ctaBackground" aria-hidden />
        <div className="messages-dashboard__ctaContent">
          <span className="messages-dashboard__ctaBadge">
            <Sparkles size={16} aria-hidden /> Conversa com o teu PT
          </span>
          <div className="messages-dashboard__ctaBody">
            <h2>Partilha actualizações em segundos</h2>
            <p>
              Mantém o teu Personal Trainer a par dos treinos, dúvidas ou progresso. O tempo mediano de resposta é
              {' '}
              {responseMetric?.value ?? 'indisponível'}, com base nas tuas conversas recentes.
            </p>
          </div>
          <div className="messages-dashboard__ctaActions">
            <Button variant="primary" size="sm" onClick={goToComposer} leftIcon={<Send size={16} aria-hidden />}> 
              Escrever mensagem
            </Button>
            <Button variant="ghost" size="sm" onClick={scrollToChat}>
              Ver conversas
            </Button>
          </div>
        </div>
        <dl className="messages-dashboard__ctaStats">
          <div>
            <dt>Mensagens trocadas</dt>
            <dd>{formatNumber(totalMessages)}</dd>
          </div>
          <div>
            <dt>Tempo mediano de resposta</dt>
            <dd>{responseMetric?.value ?? '—'}</dd>
          </div>
          <div>
            <dt>Pendentes para resposta</dt>
            <dd data-warning={hasPendingResponses ? 'true' : undefined}>{formatNumber(pendingResponses)}</dd>
          </div>
        </dl>
      </section>

      {error ? (
        <Alert tone="danger" title="Não foi possível actualizar as métricas">
          {error.message || 'Verifica a ligação e tenta novamente.'}
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
            <MarkAllRead
              size="sm"
              variant={supabase ? 'secondary' : 'warning'}
              disabled={!hasPendingResponses}
            />
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
              <strong>{formatNumber(filteredMessages.length)}</strong>
              <small>Mensagens filtradas</small>
            </span>
          </span>
          <span
            className="messages-dashboard__stat"
            data-warning={hasPendingResponses || undefined}
            aria-live="polite"
          >
            <Clock3 size={16} aria-hidden />
            <span>
              <strong>{formatNumber(pendingResponses)}</strong>
              <small>Respostas pendentes</small>
            </span>
          </span>
        </div>
      </section>

      <section className="neo-stack neo-stack--lg">
        <section
          className="messages-dashboard__panel neo-panel messages-dashboard__heroPanel"
          aria-label="Resumo das mensagens"
        >
          <header className="messages-dashboard__panelHeader">
            <div>
              <h2 className="messages-dashboard__panelTitle">Resumo rápido</h2>
              <p className="messages-dashboard__panelSubtitle">
                Principais indicadores das conversas no intervalo seleccionado.
              </p>
            </div>
          </header>
          <HeroMetrics metrics={dashboard.hero} />
        </section>

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

        <div id="messages-chat">
          <ChatPanel
            viewerId={viewerId}
            initialCounterpartId={counterpartParam ?? undefined}
            initialThreadId={threadParam ?? undefined}
          />
        </div>

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
              <button
                type="button"
                className={`messages-dashboard__segmentedItem${directionFilter === 'internal' ? ' is-active' : ''}`}
                onClick={() => onDirectionChange('internal')}
              >
                Internas
              </button>
            </div>
            <label className="messages-dashboard__search">
              <span className="sr-only">Pesquisar mensagens</span>
              <SearchIcon aria-hidden size={16} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Procurar por participante ou conteúdo"
                className="neo-field"
              />
            </label>
          </div>
          <MessagesFeed viewerId={viewerId} messages={filteredMessages} />
        </section>
      </section>
    </div>
  );
}
