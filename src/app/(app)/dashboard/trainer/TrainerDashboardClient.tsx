'use client';

import * as React from 'react';
import useSWR from 'swr';
import { Download } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import type {
  TrainerDashboardResponse,
  TrainerHeroMetric,
  TrainerTimelinePoint,
  TrainerHighlight,
  TrainerAgendaSession,
  TrainerUpcomingSession,
  TrainerClientSnapshot,
  TrainerApprovalItem,
} from '@/lib/trainer/dashboard/types';

const fetcher = async (url: string): Promise<DashboardResponse> => {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || 'Não foi possível actualizar o dashboard.');
  }
  const payload = (await response.json()) as DashboardResponse | { ok?: boolean; message?: string };
  if (!payload || typeof payload !== 'object' || !('ok' in payload) || !payload.ok) {
    throw new Error((payload as any)?.message ?? 'Não foi possível actualizar o dashboard.');
  }
  return payload as DashboardResponse;
};

type DashboardResponse = TrainerDashboardResponse & { ok: true };

type Props = {
  initialData: DashboardResponse;
  viewerName: string | null;
};

const numberFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });
const percentageFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'percent',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});
const inactivityAverageFormatter = new Intl.NumberFormat('pt-PT', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

const NO_UPCOMING_LABEL = 'Sem próxima sessão';
const NO_HISTORY_LABEL = 'Sem histórico';
const OVERDUE_LABEL = 'Sem sessão há 10+ dias';
const RECENT_ACTIVITY_DAYS = 7;

type ClientToneFilter =
  | 'all'
  | 'no-upcoming'
  | 'overdue'
  | 'no-history'
  | 'no-contact'
  | 'blocked'
  | TrainerClientSnapshot['tone'];

type ClientSort = 'priority' | 'activity';

const CLIENT_TONE_FILTERS: Array<{
  id: ClientToneFilter;
  label: string;
  tone: TrainerClientSnapshot['tone'] | null;
}> = [
  { id: 'all', label: 'Todos', tone: null },
  { id: 'positive', label: 'Em progresso', tone: 'positive' },
  { id: 'warning', label: 'Atenção', tone: 'warning' },
  { id: 'critical', label: 'Risco', tone: 'critical' },
  { id: 'no-upcoming', label: NO_UPCOMING_LABEL, tone: 'warning' },
  { id: 'overdue', label: OVERDUE_LABEL, tone: 'warning' },
  { id: 'no-history', label: NO_HISTORY_LABEL, tone: 'warning' },
  { id: 'no-contact', label: 'Sem contacto', tone: 'critical' },
  { id: 'blocked', label: 'Sem contacto + sessão', tone: 'critical' },
  { id: 'neutral', label: 'Sem alerta', tone: 'neutral' },
];

const CLIENT_SORT_OPTIONS: Array<{ id: ClientSort; label: string; description: string }> = [
  { id: 'priority', label: 'Prioridade', description: 'Crítico, atenção, progresso e neutros.' },
  { id: 'activity', label: 'Maior actividade', description: 'Mais sessões futuras e concluídas.' },
];

const CLIENT_TONE_LABELS: Record<TrainerClientSnapshot['tone'], string> = {
  positive: 'Em progresso',
  warning: 'Atenção',
  critical: 'Risco',
  neutral: 'Sem alerta',
};

const HERO_TONE_CLASS: Record<TrainerHeroMetric['tone'], 'positive' | 'warning' | 'critical' | 'neutral'> = {
  positive: 'positive',
  warning: 'warning',
  critical: 'critical',
  neutral: 'neutral',
};

const HIGHLIGHT_TONE_CLASS: Record<TrainerHighlight['tone'], 'positive' | 'warning' | 'critical' | 'info'> = {
  positive: 'positive',
  warning: 'warning',
  critical: 'critical',
  info: 'info',
};

const SESSION_TONE_CLASS: Record<'positive' | 'warning' | 'critical', 'positive' | 'warning' | 'critical'> = {
  positive: 'positive',
  warning: 'warning',
  critical: 'critical',
};

const CLIENT_TONE_CLASS: Record<TrainerClientSnapshot['tone'], 'positive' | 'warning' | 'critical' | 'neutral'> = {
  positive: 'positive',
  warning: 'warning',
  critical: 'critical',
  neutral: 'neutral',
};

const APPROVAL_TONE_CLASS: Record<TrainerApprovalItem['tone'], 'positive' | 'warning' | 'critical' | 'neutral'> = {
  positive: 'positive',
  warning: 'warning',
  critical: 'critical',
  neutral: 'neutral',
};

const CLIENT_FILTER_STORAGE_KEY = 'trainer-dashboard:client-preferences';

const TONE_PRIORITY: Record<TrainerClientSnapshot['tone'], number> = {
  critical: 0,
  warning: 1,
  positive: 2,
  neutral: 3,
};

type ClientFiltersState = {
  query: string;
  tone: ClientToneFilter;
  sort: ClientSort;
};

const CLIENT_FILTER_DEFAULTS: ClientFiltersState = {
  query: '',
  tone: 'all',
  sort: 'priority',
};

const MS_IN_DAY = 1000 * 60 * 60 * 24;
const STALLED_THRESHOLD_DAYS = 10;

type ClientEntry = {
  client: TrainerClientSnapshot;
  lastSessionDate: Date | null;
  lastSessionTime: number | null;
  nextSessionTime: number | null;
  hasHistory: boolean;
  hasUpcoming: boolean;
  lacksUpcoming: boolean;
  hasContact: boolean;
  isBlocked: boolean;
  isStalled: boolean;
  isOverdue: boolean;
  isNoHistory: boolean;
  isRecentlyActive: boolean;
  inactivityDays: number | null;
  isMissingContact: boolean;
  searchHaystack: string;
};

type ClientFiltersAction =
  | { type: 'hydrate'; value: Partial<ClientFiltersState> }
  | { type: 'setQuery'; value: string }
  | { type: 'setTone'; value: ClientToneFilter }
  | { type: 'setSort'; value: ClientSort }
  | { type: 'reset' };

function clientFiltersReducer(state: ClientFiltersState, action: ClientFiltersAction): ClientFiltersState {
  switch (action.type) {
    case 'hydrate': {
      const next: ClientFiltersState = { ...state };
      if (typeof action.value.query === 'string') {
        next.query = action.value.query;
      }
      if (
        typeof action.value.tone === 'string' &&
        CLIENT_TONE_FILTERS.some((filter) => filter.id === action.value.tone)
      ) {
        next.tone = action.value.tone as ClientToneFilter;
      }
      if (
        typeof action.value.sort === 'string' &&
        CLIENT_SORT_OPTIONS.some((option) => option.id === action.value.sort)
      ) {
        next.sort = action.value.sort as ClientSort;
      }
      return next;
    }
    case 'setQuery':
      return { ...state, query: action.value };
    case 'setTone':
      return { ...state, tone: action.value };
    case 'setSort':
      return { ...state, sort: action.value };
    case 'reset':
      return { ...CLIENT_FILTER_DEFAULTS };
    default:
      return state;
  }
}

function useTrainerClientFilters() {
  const [filters, dispatch] = React.useReducer(clientFiltersReducer, CLIENT_FILTER_DEFAULTS);
  const hydratedRef = React.useRef(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem(CLIENT_FILTER_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<ClientFiltersState> | null;
      if (parsed && typeof parsed === 'object') {
        dispatch({ type: 'hydrate', value: parsed });
      }
    } catch (storageError) {
      // Ignora estados inválidos armazenados.
    } finally {
      hydratedRef.current = true;
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !hydratedRef.current) return;
    const payload = JSON.stringify(filters);
    window.localStorage.setItem(CLIENT_FILTER_STORAGE_KEY, payload);
  }, [filters]);

  const setClientQuery = React.useCallback((value: string) => {
    dispatch({ type: 'setQuery', value });
  }, []);

  const setClientToneFilter = React.useCallback((value: ClientToneFilter) => {
    dispatch({ type: 'setTone', value });
  }, []);

  const setClientSort = React.useCallback((value: ClientSort) => {
    dispatch({ type: 'setSort', value });
  }, []);

  const clearFilters = React.useCallback(() => {
    dispatch({ type: 'reset' });
  }, []);

  const normalizedQuery = React.useMemo(() => filters.query.trim().toLowerCase(), [filters.query]);
  const deferredQuery = React.useDeferredValue(normalizedQuery);
  const hasFilters =
    normalizedQuery.length > 0 || filters.tone !== CLIENT_FILTER_DEFAULTS.tone || filters.sort !== CLIENT_FILTER_DEFAULTS.sort;

  return {
    filters,
    normalizedQuery,
    deferredQuery,
    hasFilters,
    setClientQuery,
    setClientToneFilter,
    setClientSort,
    clearFilters,
  };
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('pt-PT');
}

function firstName(fullName: string | null): string {
  if (!fullName) return 'Treinador';
  const [first] = fullName.split(/\s+/);
  return first || fullName;
}

const nameCollator = new Intl.Collator('pt-PT', { sensitivity: 'base' });

function heroToneClass(metric: TrainerHeroMetric) {
  return HERO_TONE_CLASS[metric.tone] ?? 'neutral';
}

function highlightToneClass(highlight: TrainerHighlight) {
  return HIGHLIGHT_TONE_CLASS[highlight.tone] ?? 'info';
}

function sessionToneClass(tone: TrainerUpcomingSession['tone'] | TrainerAgendaSession['tone']) {
  return SESSION_TONE_CLASS[tone] ?? 'warning';
}

function clientToneClass(tone: TrainerClientSnapshot['tone']) {
  return CLIENT_TONE_CLASS[tone] ?? 'neutral';
}

function approvalToneClass(tone: TrainerApprovalItem['tone']) {
  return APPROVAL_TONE_CLASS[tone] ?? 'neutral';
}

function matchesClientQuery(entry: ClientEntry, query: string) {
  if (!query) return true;
  return entry.searchHaystack.includes(query);
}

function parseClientDate(value: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function TimelineTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as TrainerTimelinePoint | undefined;
  if (!point) return null;
  return (
    <div className="trainer-dashboard__tooltip">
      <div className="trainer-dashboard__tooltip-label">{point.label}</div>
      <div className="trainer-dashboard__tooltip-row">
        <span>Agendadas</span>
        <strong>{numberFormatter.format(point.scheduled)}</strong>
      </div>
      <div className="trainer-dashboard__tooltip-row">
        <span>Concluídas</span>
        <strong>{numberFormatter.format(point.completed)}</strong>
      </div>
      <div className="trainer-dashboard__tooltip-row">
        <span>Canceladas</span>
        <strong>{numberFormatter.format(point.cancelled)}</strong>
      </div>
    </div>
  );
}

export default function TrainerDashboardClient({ initialData, viewerName }: Props) {
  const { data, error, isValidating, mutate } = useSWR<DashboardResponse>('/api/trainer/dashboard', fetcher, {
    fallbackData: initialData,
    revalidateOnMount: true,
  });

  const dashboard = data ?? initialData;

  const greeting = React.useMemo(() => firstName(viewerName ?? dashboard.trainerName), [viewerName, dashboard.trainerName]);
  const { filters, deferredQuery, hasFilters, setClientQuery, setClientToneFilter, setClientSort, clearFilters } =
    useTrainerClientFilters();

  const referenceTime = React.useMemo(() => {
    const reference = new Date(dashboard.updatedAt ?? Date.now());
    const time = reference.getTime();
    return Number.isNaN(time) ? Date.now() : time;
  }, [dashboard.updatedAt]);

  const clientEntries = React.useMemo<ClientEntry[]>(() => {
    return dashboard.clients.map((client) => {
      const lastSessionDate = parseClientDate(client.lastSessionAt);
      const lastSessionTime = lastSessionDate ? lastSessionDate.getTime() : null;
      const hasHistory = lastSessionTime !== null;
      const inactivityDays =
        !hasHistory ? null : Math.max(0, Math.floor((referenceTime - lastSessionTime) / MS_IN_DAY));
      const nextSessionDateRaw = parseClientDate(client.nextSessionAt);
      const rawNextSessionTime = nextSessionDateRaw ? nextSessionDateRaw.getTime() : null;
      const hasUpcoming = rawNextSessionTime !== null && rawNextSessionTime >= referenceTime;
      const nextSessionTime = hasUpcoming ? rawNextSessionTime : null;
      const sanitizedEmail = typeof client.email === 'string' ? client.email.trim() : client.email;
      const normalizedEmail = sanitizedEmail && sanitizedEmail.length > 0 ? sanitizedEmail : null;
      const hasContact = Boolean(normalizedEmail);
      const lacksUpcoming = !hasUpcoming;
      const isMissingContact = !hasContact;
      const isStalled = lacksUpcoming;
      const isOverdue = lacksUpcoming && inactivityDays !== null && inactivityDays >= STALLED_THRESHOLD_DAYS;
      const isBlocked = isMissingContact && lacksUpcoming;
      const isNoHistory = !hasHistory;
      const isRecentlyActive = inactivityDays !== null && inactivityDays <= RECENT_ACTIVITY_DAYS;
      const needsEmailNormalization = normalizedEmail !== client.email;
      const needsNextNormalization =
        lacksUpcoming && (client.nextSessionAt !== null || client.nextSessionLabel !== NO_UPCOMING_LABEL);
      const normalizedClient =
        needsEmailNormalization || needsNextNormalization
          ? {
              ...client,
              email: normalizedEmail,
              nextSessionAt: hasUpcoming ? client.nextSessionAt : null,
              nextSessionLabel: hasUpcoming ? client.nextSessionLabel : NO_UPCOMING_LABEL,
            }
          : client;
      const searchHaystack = [
        normalizedClient.name,
        normalizedClient.email ?? '',
        normalizedClient.lastSessionLabel,
        normalizedClient.nextSessionLabel,
        isNoHistory ? 'sem historico sem histórico sem ultima sessao' : '',
      ]
        .join(' ')
        .toLowerCase();

      return {
        client: normalizedClient,
        lastSessionDate,
        lastSessionTime,
        nextSessionTime,
        hasHistory,
        hasUpcoming,
        lacksUpcoming,
        hasContact,
        isMissingContact,
        isBlocked,
        isStalled,
        isOverdue,
        isNoHistory,
        isRecentlyActive,
        inactivityDays,
        searchHaystack,
      } satisfies ClientEntry;
    });
  }, [dashboard.clients, referenceTime]);

  const toneCounts = React.useMemo(() => {
    const totals: Record<ClientToneFilter, number> = {
      all: clientEntries.length,
      positive: 0,
      warning: 0,
      critical: 0,
      neutral: 0,
      'no-upcoming': 0,
      overdue: 0,
      'no-history': 0,
      'no-contact': 0,
      blocked: 0,
    };
    const matches: Record<ClientToneFilter, number> = {
      all: 0,
      positive: 0,
      warning: 0,
      critical: 0,
      neutral: 0,
      'no-upcoming': 0,
      overdue: 0,
      'no-history': 0,
      'no-contact': 0,
      blocked: 0,
    };

    for (const entry of clientEntries) {
      const { client, lacksUpcoming, isBlocked, isMissingContact, isNoHistory, isOverdue } = entry;
      totals[client.tone] += 1;
      if (lacksUpcoming) {
        totals['no-upcoming'] += 1;
      }
      if (isOverdue) {
        totals.overdue += 1;
      }
      if (isNoHistory) {
        totals['no-history'] += 1;
      }
      if (isMissingContact) {
        totals['no-contact'] += 1;
      }
      if (isBlocked) {
        totals.blocked += 1;
      }
      if (matchesClientQuery(entry, deferredQuery)) {
        matches.all += 1;
        matches[client.tone] += 1;
        if (lacksUpcoming) {
          matches['no-upcoming'] += 1;
        }
        if (isOverdue) {
          matches.overdue += 1;
        }
        if (isNoHistory) {
          matches['no-history'] += 1;
        }
        if (isMissingContact) {
          matches['no-contact'] += 1;
        }
        if (isBlocked) {
          matches.blocked += 1;
        }
      }
    }

    const keys = CLIENT_TONE_FILTERS.map((filter) => filter.id as ClientToneFilter);
    const queryActive = deferredQuery.length > 0;
    const totalLabels = Object.fromEntries(
      keys.map((key) => [key, numberFormatter.format(totals[key])]),
    ) as Record<ClientToneFilter, string>;
    const matchLabels = Object.fromEntries(
      keys.map((key) => [key, numberFormatter.format(matches[key])]),
    ) as Record<ClientToneFilter, string>;

    const displayLabels = Object.fromEntries(
      keys.map((key) => [key, queryActive ? matchLabels[key] : totalLabels[key]]),
    ) as Record<ClientToneFilter, string>;
    const ariaLabels = Object.fromEntries(
      keys.map((key) => [key, queryActive ? `${matchLabels[key]} de ${totalLabels[key]}` : totalLabels[key]]),
    ) as Record<ClientToneFilter, string>;

    return {
      totals,
      matches,
      queryActive,
      displayLabels,
      totalLabels,
      matchLabels,
      ariaLabels,
    };
  }, [clientEntries, deferredQuery]);

  const filteredEntries = React.useMemo(() => {
    const normalizedEntries = clientEntries
      .filter((entry) => {
        const { client, lacksUpcoming, isBlocked, isMissingContact, isNoHistory, isOverdue } = entry;
        const matchesQuery = matchesClientQuery(entry, deferredQuery);
        const matchesTone =
          filters.tone === 'all'
            ? true
            : filters.tone === 'no-upcoming'
            ? lacksUpcoming
            : filters.tone === 'overdue'
            ? isOverdue
            : filters.tone === 'no-history'
            ? isNoHistory
            : filters.tone === 'no-contact'
            ? isMissingContact
            : filters.tone === 'blocked'
            ? isBlocked
            : client.tone === filters.tone;
        return matchesQuery && matchesTone;
      })
      .sort((a, b) => {
        const clientA = a.client;
        const clientB = b.client;

        if (filters.sort === 'activity') {
          const upcomingDiff = clientB.upcoming - clientA.upcoming;
          if (upcomingDiff !== 0) return upcomingDiff;
          const completedDiff = clientB.completed - clientA.completed;
          if (completedDiff !== 0) return completedDiff;
        } else {
          const toneDiff = (TONE_PRIORITY[clientA.tone] ?? 99) - (TONE_PRIORITY[clientB.tone] ?? 99);
          if (toneDiff !== 0) return toneDiff;
          const overdueDiff = Number(b.isOverdue) - Number(a.isOverdue);
          if (overdueDiff !== 0) return overdueDiff;
          const inactivityA = a.inactivityDays ?? -1;
          const inactivityB = b.inactivityDays ?? -1;
          if (inactivityA !== inactivityB) return inactivityB - inactivityA;
          const lacksUpcomingDiff = Number(b.lacksUpcoming) - Number(a.lacksUpcoming);
          if (lacksUpcomingDiff !== 0) return lacksUpcomingDiff;
        }

        return nameCollator.compare(clientA.name, clientB.name);
      });

    return normalizedEntries;
  }, [clientEntries, deferredQuery, filters.tone, filters.sort]);

  const clientStats = React.useMemo(() => {
    const totals = filteredEntries.reduce(
      (acc, entry) => {
        const {
          client,
          lacksUpcoming,
          isBlocked,
          isMissingContact,
          isOverdue,
          isNoHistory,
          isRecentlyActive,
          inactivityDays,
        } = entry;
        acc.total += 1;
        acc.upcoming += client.upcoming;
        acc.completed += client.completed;
        if (isMissingContact) {
          acc.missingContact += 1;
        }
        if (lacksUpcoming) {
          acc.noUpcoming += 1;
        }
        if (isOverdue) {
          acc.overdue += 1;
        }
        if (isNoHistory) {
          acc.noHistory += 1;
        }
        if (isBlocked) {
          acc.blocked += 1;
        }
        if (isRecentlyActive) {
          acc.recentlyActive += 1;
        }
        if (inactivityDays !== null) {
          acc.inactivitySamples += 1;
          acc.inactivitySum += inactivityDays;
          if (acc.maxInactivity === null || inactivityDays > acc.maxInactivity) {
            acc.maxInactivity = inactivityDays;
          }
        }
        if (client.tone === 'critical' || client.tone === 'warning') {
          acc.attention += 1;
        }
        acc.tones[client.tone] += 1;
        return acc;
      },
      {
        total: 0,
        upcoming: 0,
        completed: 0,
        attention: 0,
        noUpcoming: 0,
        overdue: 0,
        noHistory: 0,
        missingContact: 0,
        blocked: 0,
        recentlyActive: 0,
        inactivitySamples: 0,
        inactivitySum: 0,
        maxInactivity: null as number | null,
        tones: {
          positive: 0,
          warning: 0,
          critical: 0,
          neutral: 0,
        } as Record<TrainerClientSnapshot['tone'], number>,
      },
    );

    const attentionRate = totals.total === 0 ? 0 : totals.attention / totals.total;
    const averageInactivity = totals.inactivitySamples === 0 ? null : totals.inactivitySum / totals.inactivitySamples;

    const distribution = (Object.keys(totals.tones) as Array<TrainerClientSnapshot['tone']>).map((tone) => {
      const count = totals.tones[tone];
      const percent = totals.total === 0 ? 0 : count / totals.total;
      return {
        tone,
        count,
        percent,
        label: CLIENT_TONE_LABELS[tone],
        countLabel: numberFormatter.format(count),
        percentLabel: percentageFormatter.format(percent),
      };
    });

    const distributionLabel = distribution
      .map((segment) => `${segment.label}: ${segment.countLabel}`)
      .join('; ');

    return {
      ...totals,
      totalLabel: numberFormatter.format(totals.total),
      upcomingLabel: numberFormatter.format(totals.upcoming),
      completedLabel: numberFormatter.format(totals.completed),
      attentionLabel: numberFormatter.format(totals.attention),
      attentionRateLabel: percentageFormatter.format(attentionRate),
      noUpcomingLabel: numberFormatter.format(totals.noUpcoming),
      overdueLabel: numberFormatter.format(totals.overdue),
      noHistoryLabel: numberFormatter.format(totals.noHistory),
      missingContactLabel: numberFormatter.format(totals.missingContact),
      blockedLabel: numberFormatter.format(totals.blocked),
      recentlyActive: totals.recentlyActive,
      recentlyActiveLabel: numberFormatter.format(totals.recentlyActive),
      hasInactivitySamples: totals.inactivitySamples > 0,
      averageInactivity,
      averageInactivityLabel:
        averageInactivity === null ? null : inactivityAverageFormatter.format(Math.max(0, averageInactivity)),
      maxInactivity: totals.maxInactivity,
      maxInactivityLabel:
        totals.maxInactivity === null ? null : numberFormatter.format(Math.max(0, totals.maxInactivity)),
      criticalLabel: numberFormatter.format(totals.tones.critical),
      warningLabel: numberFormatter.format(totals.tones.warning),
      positiveLabel: numberFormatter.format(totals.tones.positive),
      neutralLabel: numberFormatter.format(totals.tones.neutral),
      distribution,
      distributionLabel,
    };
  }, [filteredEntries]);

  const totalClients = clientEntries.length;
  const totalClientsLabel = React.useMemo(() => numberFormatter.format(totalClients), [totalClients]);
  const showFilteredSummary = totalClients > 0 && (hasFilters || clientStats.total !== totalClients);
  const noClients = totalClients === 0;

  const priorityClients = React.useMemo(() => {
    return clientEntries
      .filter((entry) => entry.client.tone === 'critical' || entry.client.tone === 'warning')
      .sort((a, b) => {
        const toneDiff = (TONE_PRIORITY[a.client.tone] ?? 99) - (TONE_PRIORITY[b.client.tone] ?? 99);
        if (toneDiff !== 0) return toneDiff;
        const upcomingDiff = b.client.upcoming - a.client.upcoming;
        if (upcomingDiff !== 0) return upcomingDiff;
        const completedDiff = b.client.completed - a.client.completed;
        if (completedDiff !== 0) return completedDiff;
        return nameCollator.compare(a.client.name, b.client.name);
      })
      .slice(0, 4)
      .map((entry) => ({
        id: entry.client.id,
        name: entry.client.name,
        tone: entry.client.tone,
        hasUpcoming: entry.hasUpcoming,
        nextSessionLabel: entry.hasUpcoming ? entry.client.nextSessionLabel : NO_UPCOMING_LABEL,
        hasContact: entry.hasContact,
        email: entry.hasContact ? entry.client.email : null,
      }));
  }, [clientEntries]);

  const stalledClients = React.useMemo(() => {
    return clientEntries
      .filter((entry) => entry.isStalled && !entry.isNoHistory && !entry.isOverdue)
      .map((entry) => ({
        id: entry.client.id,
        name: entry.client.name,
        email: entry.client.email,
        lastSessionLabel: entry.client.lastSessionLabel,
        inactivityDays: entry.inactivityDays,
        priorityScore: entry.inactivityDays ?? -1,
      }))
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 4)
      .map((entry) => ({
        id: entry.id,
        name: entry.name,
        email: entry.email,
        lastSessionLabel: entry.lastSessionLabel,
        inactivityLabel:
          entry.inactivityDays === null
            ? 'Sem histórico registado'
            : `${numberFormatter.format(entry.inactivityDays)} dia(s) sem sessão`,
      }));
  }, [clientEntries]);

  const overdueClients = React.useMemo(() => {
    return clientEntries
      .filter((entry) => entry.isOverdue)
      .map((entry) => ({
        id: entry.client.id,
        name: entry.client.name,
        email: entry.client.email,
        tone: entry.client.tone,
        inactivityDays: entry.inactivityDays,
        lastSessionLabel: entry.client.lastSessionLabel,
      }))
      .sort((a, b) => {
        const toneDiff = (TONE_PRIORITY[a.tone] ?? 99) - (TONE_PRIORITY[b.tone] ?? 99);
        if (toneDiff !== 0) return toneDiff;
        const inactivityA = a.inactivityDays ?? -1;
        const inactivityB = b.inactivityDays ?? -1;
        if (inactivityA !== inactivityB) {
          return inactivityB - inactivityA;
        }
        return nameCollator.compare(a.name, b.name);
      })
      .slice(0, 4)
      .map((entry) => ({
        id: entry.id,
        name: entry.name,
        tone: entry.tone,
        lastSessionLabel: entry.lastSessionLabel,
        inactivityLabel:
          entry.inactivityDays === null
            ? 'Sem histórico registado'
            : `${numberFormatter.format(entry.inactivityDays)} dia(s) sem sessão`,
        email: entry.email,
      }));
  }, [clientEntries]);

  const missingContactClients = React.useMemo(() => {
    const entries = clientEntries
      .filter((entry) => entry.isMissingContact)
      .map((entry) => {
        const { client, hasUpcoming, isStalled, isOverdue, isNoHistory, nextSessionTime, lastSessionTime } = entry;
        return {
          id: client.id,
          name: client.name,
          tone: client.tone,
          hasUpcoming,
          isStalled,
          isOverdue,
          isNoHistory,
          nextSessionLabel: hasUpcoming ? client.nextSessionLabel : NO_UPCOMING_LABEL,
          nextSessionTime: hasUpcoming ? nextSessionTime : null,
          lastSessionLabel: client.lastSessionLabel,
          lastSessionTime,
        };
      })
      .sort((a, b) => {
        const toneDiff = (TONE_PRIORITY[a.tone] ?? 99) - (TONE_PRIORITY[b.tone] ?? 99);
        if (toneDiff !== 0) return toneDiff;
        if (a.hasUpcoming !== b.hasUpcoming) {
          return a.hasUpcoming ? -1 : 1;
        }
        if (a.hasUpcoming && b.hasUpcoming) {
          if (a.nextSessionTime !== null && b.nextSessionTime !== null) {
            return a.nextSessionTime - b.nextSessionTime;
          }
          if (a.nextSessionTime !== null) return -1;
          if (b.nextSessionTime !== null) return 1;
        }
        if (!a.hasUpcoming && !b.hasUpcoming) {
          if (a.lastSessionTime !== null && b.lastSessionTime !== null) {
            return a.lastSessionTime - b.lastSessionTime;
          }
          if (a.lastSessionTime === null && b.lastSessionTime !== null) return -1;
          if (a.lastSessionTime !== null && b.lastSessionTime === null) return 1;
        }
        return nameCollator.compare(a.name, b.name);
      })
      .slice(0, 4);

    return entries;
  }, [clientEntries]);

  const blockedClients = React.useMemo(() => {
    return clientEntries
      .filter((entry) => entry.isBlocked)
      .map((entry) => ({
        id: entry.client.id,
        name: entry.client.name,
        tone: entry.client.tone,
        inactivityDays: entry.inactivityDays,
        inactivityScore: entry.inactivityDays ?? -1,
        isOverdue: entry.isOverdue,
        isNoHistory: entry.isNoHistory,
        lastSessionLabel: entry.client.lastSessionLabel,
      }))
      .sort((a, b) => {
        const toneDiff = (TONE_PRIORITY[a.tone] ?? 99) - (TONE_PRIORITY[b.tone] ?? 99);
        if (toneDiff !== 0) return toneDiff;
        if (a.isOverdue !== b.isOverdue) {
          return a.isOverdue ? -1 : 1;
        }
        if (a.inactivityScore !== b.inactivityScore) {
          return b.inactivityScore - a.inactivityScore;
        }
        return nameCollator.compare(a.name, b.name);
      })
      .slice(0, 4)
      .map((entry) => ({
        id: entry.id,
        name: entry.name,
        tone: entry.tone,
        lastSessionLabel: entry.lastSessionLabel,
        inactivityLabel:
          entry.inactivityDays === null
            ? 'Sem histórico registado'
            : `${numberFormatter.format(entry.inactivityDays)} dia(s) sem sessão`,
      }));
  }, [clientEntries]);

  const noHistoryClients = React.useMemo(() => {
    return clientEntries
      .filter((entry) => entry.isNoHistory)
      .map((entry) => ({
        id: entry.client.id,
        name: entry.client.name,
        tone: entry.client.tone,
        hasUpcoming: entry.hasUpcoming,
        lacksUpcoming: entry.lacksUpcoming,
        nextSessionLabel: entry.hasUpcoming ? entry.client.nextSessionLabel : NO_UPCOMING_LABEL,
        hasContact: entry.hasContact,
        email: entry.hasContact ? entry.client.email : null,
      }))
      .sort((a, b) => {
        const toneDiff = (TONE_PRIORITY[a.tone] ?? 99) - (TONE_PRIORITY[b.tone] ?? 99);
        if (toneDiff !== 0) return toneDiff;
        if (a.lacksUpcoming !== b.lacksUpcoming) {
          return a.lacksUpcoming ? -1 : 1;
        }
        if (a.hasUpcoming !== b.hasUpcoming) {
          return a.hasUpcoming ? -1 : 1;
        }
        return nameCollator.compare(a.name, b.name);
      })
      .slice(0, 4);
  }, [clientEntries]);

  const showNoUpcomingClients = React.useCallback(() => {
    if (filters.query) {
      setClientQuery('');
    }
    setClientToneFilter('no-upcoming');
  }, [filters.query, setClientQuery, setClientToneFilter]);

  const showOverdueClients = React.useCallback(() => {
    if (filters.query) {
      setClientQuery('');
    }
    if (filters.sort !== 'priority') {
      setClientSort('priority');
    }
    setClientToneFilter('overdue');
  }, [filters.query, filters.sort, setClientQuery, setClientSort, setClientToneFilter]);

  const showNoHistoryClients = React.useCallback(() => {
    if (filters.query) {
      setClientQuery('');
    }
    setClientToneFilter('no-history');
  }, [filters.query, setClientQuery, setClientToneFilter]);

  const showBlockedClients = React.useCallback(() => {
    if (filters.query) {
      setClientQuery('');
    }
    if (filters.sort !== 'priority') {
      setClientSort('priority');
    }
    setClientToneFilter('blocked');
  }, [filters.query, filters.sort, setClientQuery, setClientSort, setClientToneFilter]);

  const showMissingContactClients = React.useCallback(() => {
    if (filters.query) {
      setClientQuery('');
    }
    setClientToneFilter('no-contact');
  }, [filters.query, setClientQuery, setClientToneFilter]);

  const handleRefresh = React.useCallback(() => {
    void mutate();
  }, [mutate]);

  const exportClients = React.useCallback(() => {
    if (filteredEntries.length === 0) return;

    const header = ['Cliente', 'Email', 'Próximas', 'Concluídas', 'Última sessão', 'Próxima sessão', 'Prioridade'];
    const rows = filteredEntries.map(({ client, hasUpcoming, hasContact }) => [
      client.name,
      hasContact ? client.email ?? '' : 'Sem email registado',
      String(client.upcoming),
      String(client.completed),
      client.lastSessionLabel,
      hasUpcoming ? client.nextSessionLabel : NO_UPCOMING_LABEL,
      CLIENT_TONE_LABELS[client.tone] ?? client.tone,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(';'))
      .join('\n');

    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `carteira-clientes-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredEntries]);

  return (
    <div className="trainer-dashboard">
      <PageHeader
        title={`Olá, ${greeting}`}
        subtitle="Acompanha métricas, pedidos e sessões do teu portefólio."
        sticky={false}
        actions={
          <div className="trainer-dashboard__actions">
            <DataSourceBadge
              source={dashboard.source}
              generatedAt={dashboard.updatedAt}
              className="trainer-dashboard__data-source"
            />
            <Button
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              disabled={isValidating}
              aria-busy={isValidating}
            >
              {isValidating ? 'A actualizar…' : 'Actualizar'}
            </Button>
          </div>
        }
      />

      {error && (
        <Alert tone="danger" className="trainer-dashboard__alert" title="Sincronização falhou">
          {error.message || 'Não foi possível ligar ao Supabase. A mostrar dados locais.'}
        </Alert>
      )}

      <section className="neo-panel trainer-dashboard__panel" aria-labelledby="trainer-dashboard-hero">
        <div className="neo-panel__header trainer-dashboard__panel-header">
          <div className="neo-panel__meta">
            <h2 id="trainer-dashboard-hero" className="neo-panel__title">
              Indicadores-chave
            </h2>
            <p className="neo-panel__subtitle">Última actualização: {formatUpdatedAt(dashboard.updatedAt)}</p>
          </div>
        </div>
        <div className="trainer-dashboard__hero-grid">
          {dashboard.hero.map((metric) => (
            <article
              key={metric.id}
              className={`trainer-dashboard__hero-card trainer-dashboard__hero-card--${heroToneClass(metric)}`}
            >
              <div className="trainer-dashboard__hero-meta">
                <span className="trainer-dashboard__hero-label">{metric.label}</span>
                <span className="trainer-dashboard__hero-value">{metric.value}</span>
              </div>
              {metric.hint && <p className="trainer-dashboard__hero-hint">{metric.hint}</p>}
              {metric.trend && <span className="trainer-dashboard__hero-trend">{metric.trend}</span>}
            </article>
          ))}
        </div>
      </section>

      <div className="trainer-dashboard__grid">
        <section className="neo-panel trainer-dashboard__panel" aria-labelledby="trainer-dashboard-timeline">
          <div className="neo-panel__header trainer-dashboard__panel-header">
            <div className="neo-panel__meta">
              <h2 id="trainer-dashboard-timeline" className="neo-panel__title">
                Actividade das últimas semanas
              </h2>
              <p className="neo-panel__subtitle">Sessões agendadas, concluídas e canceladas (14 dias).</p>
            </div>
          </div>
          <div className="trainer-dashboard__chart">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={dashboard.timeline}>
                <CartesianGrid strokeDasharray="4 4" className="trainer-dashboard__chart-grid" />
                <XAxis dataKey="label" stroke="currentColor" className="trainer-dashboard__chart-axis" />
                <YAxis stroke="currentColor" className="trainer-dashboard__chart-axis" allowDecimals={false} />
                <Tooltip content={<TimelineTooltip />} cursor={{ stroke: 'var(--neo-border-strong)' }} />
                <Area type="monotone" dataKey="scheduled" stackId="1" stroke="var(--neo-chart-primary)" fill="var(--neo-chart-primary-fill)" />
                <Area type="monotone" dataKey="completed" stackId="1" stroke="var(--neo-chart-positive)" fill="var(--neo-chart-positive-fill)" />
                <Area type="monotone" dataKey="cancelled" stackId="1" stroke="var(--neo-chart-warning)" fill="var(--neo-chart-warning-fill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="neo-panel trainer-dashboard__panel" aria-labelledby="trainer-dashboard-highlights">
          <div className="neo-panel__header trainer-dashboard__panel-header">
            <div className="neo-panel__meta">
              <h2 id="trainer-dashboard-highlights" className="neo-panel__title">
                Destaques imediatos
              </h2>
              <p className="neo-panel__subtitle">O que merece atenção nas próximas horas.</p>
            </div>
          </div>
          <ul className="trainer-dashboard__highlights">
            {dashboard.highlights.map((highlight) => (
              <li
                key={highlight.id}
                className={`trainer-dashboard__highlight trainer-dashboard__highlight--${highlightToneClass(highlight)}`}
              >
                <h3 className="trainer-dashboard__highlight-title">{highlight.title}</h3>
                <p className="trainer-dashboard__highlight-description">{highlight.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="trainer-dashboard__grid">
        <section className="neo-panel trainer-dashboard__panel" aria-labelledby="trainer-dashboard-agenda">
          <div className="neo-panel__header trainer-dashboard__panel-header">
            <div className="neo-panel__meta">
              <h2 id="trainer-dashboard-agenda" className="neo-panel__title">
                Agenda (próximos 7 dias)
              </h2>
              <p className="neo-panel__subtitle">Resumo diário das sessões planeadas.</p>
            </div>
          </div>
          <div className="trainer-dashboard__agenda-grid">
            {dashboard.agenda.map((day) => (
              <article key={day.date} className="trainer-dashboard__agenda-day">
                <header className="trainer-dashboard__agenda-header">
                  <span className="trainer-dashboard__agenda-label">{day.label}</span>
                  <span className="trainer-dashboard__agenda-count">{day.total} sessão(ões)</span>
                </header>
                <ul className="trainer-dashboard__agenda-list">
                  {day.sessions.length === 0 ? (
                    <li className="trainer-dashboard__agenda-empty">Sem sessões.</li>
                  ) : (
                    day.sessions.map((session) => (
                      <li
                        key={session.id}
                        className={`trainer-dashboard__agenda-item trainer-dashboard__agenda-item--${sessionToneClass(session.tone)}`}
                      >
                        <span className="trainer-dashboard__agenda-time">{session.timeLabel}</span>
                        <div className="trainer-dashboard__agenda-meta">
                          <span className="trainer-dashboard__agenda-client">{session.clientName}</span>
                          <span className="trainer-dashboard__agenda-status">{session.status}</span>
                        </div>
                        <span className="trainer-dashboard__agenda-location">{session.location ?? 'Local a definir'}</span>
                      </li>
                    ))
                  )}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="neo-panel trainer-dashboard__panel" aria-labelledby="trainer-dashboard-approvals">
          <div className="neo-panel__header trainer-dashboard__panel-header">
            <div className="neo-panel__meta">
              <h2 id="trainer-dashboard-approvals" className="neo-panel__title">
                Pedidos e aprovações
              </h2>
              <p className="neo-panel__subtitle">
                {dashboard.approvals.pending > 0
                  ? `${dashboard.approvals.pending} pedido(s) a aguardar decisão.`
                  : 'Sem pedidos pendentes.'}
              </p>
            </div>
          </div>
          <ul className="trainer-dashboard__approvals">
            {dashboard.approvals.recent.map((approval) => (
              <li
                key={approval.id}
                className={`trainer-dashboard__approvals-item trainer-dashboard__approvals-item--${approvalToneClass(approval.tone)}`}
              >
                <div className="trainer-dashboard__approvals-header">
                  <span className="trainer-dashboard__approvals-client">{approval.clientName}</span>
                  <span className="trainer-dashboard__approvals-status">{approval.status}</span>
                </div>
                <p className="trainer-dashboard__approvals-meta">
                  {approval.type ?? 'Pedido'} · {approval.requestedLabel}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="trainer-dashboard__grid trainer-dashboard__grid--stack">
        <section className="neo-panel trainer-dashboard__panel" aria-labelledby="trainer-dashboard-upcoming">
          <div className="neo-panel__header trainer-dashboard__panel-header">
            <div className="neo-panel__meta">
              <h2 id="trainer-dashboard-upcoming" className="neo-panel__title">
                Próximas sessões
              </h2>
              <p className="neo-panel__subtitle">Ordem cronológica das próximas marcações.</p>
            </div>
          </div>
          <ul className="trainer-dashboard__upcoming">
            {dashboard.upcoming.length === 0 ? (
              <li className="trainer-dashboard__upcoming-empty">Sem sessões agendadas.</li>
            ) : (
              dashboard.upcoming.map((session) => (
                <li
                  key={session.id}
                  className={`trainer-dashboard__upcoming-item trainer-dashboard__upcoming-item--${sessionToneClass(session.tone)}`}
                >
                  <div className="trainer-dashboard__upcoming-meta">
                    <span className="trainer-dashboard__upcoming-date">{session.dateLabel}</span>
                    <span className="trainer-dashboard__upcoming-time">{session.timeLabel}</span>
                  </div>
                  <div className="trainer-dashboard__upcoming-details">
                    <span className="trainer-dashboard__upcoming-client">{session.clientName}</span>
                    <span className="trainer-dashboard__upcoming-status">{session.status}</span>
                  </div>
                  <span className="trainer-dashboard__upcoming-location">{session.location ?? 'Local a definir'}</span>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="neo-panel trainer-dashboard__panel" aria-labelledby="trainer-dashboard-clients">
          <div className="neo-panel__header trainer-dashboard__panel-header">
            <div className="neo-panel__meta">
              <h2 id="trainer-dashboard-clients" className="neo-panel__title">
                Carteira de clientes
              </h2>
              <p className="neo-panel__subtitle">Resumo de acompanhamento por cliente.</p>
            </div>
            <div className="trainer-dashboard__clients-tools">
              <div className="trainer-dashboard__clients-search">
                <input
                  type="search"
                  placeholder="Procurar por nome, email ou sessão"
                  value={filters.query}
                  onChange={(event) => setClientQuery(event.target.value)}
                  className="trainer-dashboard__clients-input"
                  aria-label="Filtrar clientes"
                />
              </div>
              <div className="trainer-dashboard__clients-sort">
                <label htmlFor="trainer-dashboard-clients-sort" className="trainer-dashboard__clients-sort-label">
                  Ordenar
                </label>
                <select
                  id="trainer-dashboard-clients-sort"
                  className="trainer-dashboard__clients-sort-select"
                  value={filters.sort}
                  onChange={(event) => setClientSort(event.target.value as ClientSort)}
                  aria-describedby="trainer-dashboard-clients-sort-description"
                >
                  {CLIENT_SORT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p id="trainer-dashboard-clients-sort-description" className="trainer-dashboard__clients-sort-description">
                  {CLIENT_SORT_OPTIONS.find((option) => option.id === filters.sort)?.description}
                </p>
              </div>
              <div className="trainer-dashboard__tone-toggle" role="group" aria-label="Filtrar por prioridade">
                {CLIENT_TONE_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    className="trainer-dashboard__tone-button"
                    data-active={filters.tone === filter.id}
                    data-tone={filter.tone ?? 'all'}
                    aria-pressed={filters.tone === filter.id}
                    aria-label={`${filter.label} (${toneCounts.ariaLabels[filter.id]})`}
                    onClick={() => setClientToneFilter(filter.id)}
                  >
                    <span className="trainer-dashboard__tone-button-label">
                      {filter.label}
                      {toneCounts.queryActive && (
                        <span className="trainer-dashboard__tone-button-total" aria-hidden="true">
                          de {toneCounts.totalLabels[filter.id]}
                        </span>
                      )}
                    </span>
                    <span className="trainer-dashboard__tone-button-count" aria-hidden="true">
                      {toneCounts.displayLabels[filter.id]}
                    </span>
                  </button>
                ))}
              </div>
              <div className="trainer-dashboard__clients-actions">
                {hasFilters && (
                  <Button
                    onClick={clearFilters}
                    variant="ghost"
                    size="sm"
                    className="trainer-dashboard__clients-clear"
                  >
                    Limpar filtros
                  </Button>
                )}
                <Button
                  onClick={exportClients}
                  variant="ghost"
                  size="sm"
                  leftIcon={<Download size={16} aria-hidden />}
                  disabled={filteredEntries.length === 0}
                >
                  Exportar CSV
                </Button>
              </div>
            </div>
          </div>
          {priorityClients.length > 0 && (
            <div className="trainer-dashboard__clients-priority" aria-live="polite">
              <h3 className="trainer-dashboard__clients-priority-title">Prioridades imediatas</h3>
              <ul className="trainer-dashboard__clients-priority-list">
                {priorityClients.map((client) => (
                  <li
                    key={client.id}
                    className={`trainer-dashboard__clients-priority-item trainer-dashboard__clients-priority-item--${clientToneClass(client.tone)}`}
                  >
                    <div className="trainer-dashboard__clients-priority-header">
                      <span className="trainer-dashboard__clients-priority-name">{client.name}</span>
                      <span className="trainer-dashboard__clients-priority-badge">
                        {CLIENT_TONE_LABELS[client.tone]}
                      </span>
                    </div>
                    <p className="trainer-dashboard__clients-priority-meta">
                      {client.hasUpcoming
                        ? `Próxima sessão: ${client.nextSessionLabel}`
                        : `${NO_UPCOMING_LABEL} agendada.`}
                    </p>
                    {client.hasContact && client.email && (
                      <a className="trainer-dashboard__clients-priority-link" href={`mailto:${client.email}`}>
                        Enviar email
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {overdueClients.length > 0 && (
            <div className="trainer-dashboard__clients-overdue" aria-live="polite">
              <div className="trainer-dashboard__clients-subheader">
                <h3 className="trainer-dashboard__clients-overdue-title">{OVERDUE_LABEL}</h3>
                <Button
                  onClick={showOverdueClients}
                  variant="ghost"
                  size="sm"
                  className="trainer-dashboard__clients-subheader-action"
                >
                  Ver todos
                </Button>
              </div>
              <ul className="trainer-dashboard__clients-overdue-list">
                {overdueClients.map((client) => (
                  <li
                    key={client.id}
                    className={`trainer-dashboard__clients-overdue-item trainer-dashboard__clients-overdue-item--${clientToneClass(client.tone)}`}
                  >
                    <div className="trainer-dashboard__clients-overdue-header">
                      <span className="trainer-dashboard__clients-overdue-name">{client.name}</span>
                      <span className="trainer-dashboard__clients-overdue-badge">{client.inactivityLabel}</span>
                    </div>
                    <p className="trainer-dashboard__clients-overdue-meta">Última sessão: {client.lastSessionLabel}</p>
                    {client.email && (
                      <a className="trainer-dashboard__clients-overdue-link" href={`mailto:${client.email}`}>
                        Contactar
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {stalledClients.length > 0 && (
            <div className="trainer-dashboard__clients-stalled" aria-live="polite">
              <div className="trainer-dashboard__clients-subheader">
                <h3 className="trainer-dashboard__clients-stalled-title">Sem próxima sessão</h3>
                <Button
                  onClick={showNoUpcomingClients}
                  variant="ghost"
                  size="sm"
                  className="trainer-dashboard__clients-subheader-action"
                >
                  Ver todos
                </Button>
              </div>
              <ul className="trainer-dashboard__clients-stalled-list">
                {stalledClients.map((client) => (
                  <li key={client.id} className="trainer-dashboard__clients-stalled-item">
                    <div className="trainer-dashboard__clients-stalled-header">
                      <span className="trainer-dashboard__clients-stalled-name">{client.name}</span>
                      <span className="trainer-dashboard__clients-stalled-badge">{client.inactivityLabel}</span>
                    </div>
                    <p className="trainer-dashboard__clients-stalled-meta">
                      Última sessão: {client.lastSessionLabel}
                    </p>
                    {client.email && (
                      <a className="trainer-dashboard__clients-stalled-link" href={`mailto:${client.email}`}>
                        Contactar
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {noHistoryClients.length > 0 && (
            <div className="trainer-dashboard__clients-stalled" aria-live="polite">
              <div className="trainer-dashboard__clients-subheader">
                <h3 className="trainer-dashboard__clients-stalled-title">Sem histórico de sessões</h3>
                <Button
                  onClick={showNoHistoryClients}
                  variant="ghost"
                  size="sm"
                  className="trainer-dashboard__clients-subheader-action"
                >
                  Ver todos
                </Button>
              </div>
              <ul className="trainer-dashboard__clients-stalled-list">
                {noHistoryClients.map((client) => (
                  <li key={client.id} className="trainer-dashboard__clients-stalled-item">
                    <div className="trainer-dashboard__clients-stalled-header">
                      <span className="trainer-dashboard__clients-stalled-name">{client.name}</span>
                      <span className="trainer-dashboard__clients-stalled-badge">
                        {client.hasUpcoming ? 'Primeira sessão agendada' : 'Nenhuma sessão agendada'}
                      </span>
                    </div>
                    <p className="trainer-dashboard__clients-stalled-meta">
                      Próxima sessão: {client.hasUpcoming ? client.nextSessionLabel : NO_UPCOMING_LABEL}
                    </p>
                    {client.hasContact && client.email ? (
                      <a className="trainer-dashboard__clients-stalled-link" href={`mailto:${client.email}`}>
                        Contactar
                      </a>
                    ) : (
                      <p className="trainer-dashboard__clients-stalled-meta">
                        Sem contacto directo disponível.
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {blockedClients.length > 0 && (
            <div className="trainer-dashboard__clients-blocked" aria-live="polite">
              <div className="trainer-dashboard__clients-subheader">
                <h3 className="trainer-dashboard__clients-blocked-title">Sem contacto + sessão</h3>
                <Button
                  onClick={showBlockedClients}
                  variant="ghost"
                  size="sm"
                  className="trainer-dashboard__clients-subheader-action"
                >
                  Ver todos
                </Button>
              </div>
              <ul className="trainer-dashboard__clients-blocked-list">
                {blockedClients.map((client) => (
                  <li
                    key={client.id}
                    className={`trainer-dashboard__clients-blocked-item trainer-dashboard__clients-blocked-item--${clientToneClass(client.tone)}`}
                  >
                    <div className="trainer-dashboard__clients-blocked-header">
                      <span className="trainer-dashboard__clients-blocked-name">{client.name}</span>
                      <span className="trainer-dashboard__clients-blocked-badge">Sem contacto</span>
                    </div>
                    <p className="trainer-dashboard__clients-blocked-meta">{client.inactivityLabel}</p>
                    <p className="trainer-dashboard__clients-blocked-meta">
                      Última sessão: {client.lastSessionLabel}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {missingContactClients.length > 0 && (
            <div className="trainer-dashboard__clients-missing" aria-live="polite">
              <div className="trainer-dashboard__clients-subheader">
                <h3 className="trainer-dashboard__clients-missing-title">Sem contacto directo</h3>
                <Button
                  onClick={showMissingContactClients}
                  variant="ghost"
                  size="sm"
                  className="trainer-dashboard__clients-subheader-action"
                >
                  Ver todos
                </Button>
              </div>
              <ul className="trainer-dashboard__clients-missing-list">
                {missingContactClients.map((client) => (
                  <li
                    key={client.id}
                    className={`trainer-dashboard__clients-missing-item trainer-dashboard__clients-missing-item--${clientToneClass(client.tone)}`}
                  >
                    <div className="trainer-dashboard__clients-missing-header">
                      <span className="trainer-dashboard__clients-missing-name">{client.name}</span>
                      <div className="trainer-dashboard__clients-missing-tags">
                        <span className="trainer-dashboard__clients-missing-badge">Sem email</span>
                        {client.isOverdue ? (
                          <span className="trainer-dashboard__clients-missing-extra" aria-hidden="true">
                            Sem sessão 10+ dias
                          </span>
                        ) : client.isStalled ? (
                          <span className="trainer-dashboard__clients-missing-extra" aria-hidden="true">
                            Sem próxima sessão
                          </span>
                        ) : null}
                        {client.isNoHistory && (
                          <span className="trainer-dashboard__clients-missing-extra" aria-hidden="true">
                            Sem histórico
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="trainer-dashboard__clients-missing-meta">
                      {client.hasUpcoming
                        ? `Próxima sessão: ${client.nextSessionLabel}`
                        : 'Sem próxima sessão agendada.'}
                    </p>
                    <p className="trainer-dashboard__clients-missing-meta">
                      Última sessão: {client.lastSessionLabel}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="trainer-dashboard__clients-summary" aria-live="polite">
            {showFilteredSummary && (
              <span className="trainer-dashboard__clients-summary-item trainer-dashboard__clients-summary-item--total">
                A mostrar {clientStats.totalLabel} de {totalClientsLabel} cliente(s)
              </span>
            )}
            <span className="trainer-dashboard__clients-summary-item">
              {totalClientsLabel} cliente(s) no total
            </span>
            <span className="trainer-dashboard__clients-summary-item">
              {clientStats.upcomingLabel} sessão(ões) futuras
            </span>
            <span className="trainer-dashboard__clients-summary-item">
              {clientStats.completedLabel} concluídas
            </span>
            {clientStats.tones.critical > 0 && (
              <span className="trainer-dashboard__clients-summary-item trainer-dashboard__clients-summary-item--critical">
                {clientStats.criticalLabel} em risco
              </span>
            )}
            {clientStats.tones.warning > 0 && (
              <span className="trainer-dashboard__clients-summary-item trainer-dashboard__clients-summary-item--warning">
                {clientStats.warningLabel} a requer atenção
              </span>
            )}
            {clientStats.noUpcoming > 0 && (
              <span className="trainer-dashboard__clients-summary-item trainer-dashboard__clients-summary-item--stalled">
                {clientStats.noUpcomingLabel} sem próxima sessão
              </span>
            )}
            {clientStats.noHistory > 0 && (
              <span className="trainer-dashboard__clients-summary-item trainer-dashboard__clients-summary-item--no-history">
                {clientStats.noHistoryLabel} sem histórico registado
              </span>
            )}
            {clientStats.overdue > 0 && (
              <span className="trainer-dashboard__clients-summary-item trainer-dashboard__clients-summary-item--overdue">
                {clientStats.overdueLabel} sem sessão há {STALLED_THRESHOLD_DAYS}+ dias
              </span>
            )}
            {clientStats.missingContact > 0 && (
              <span className="trainer-dashboard__clients-summary-item trainer-dashboard__clients-summary-item--missing">
                {clientStats.missingContactLabel} sem contacto directo
              </span>
            )}
            {clientStats.blocked > 0 && (
              <span className="trainer-dashboard__clients-summary-item trainer-dashboard__clients-summary-item--blocked">
                {clientStats.blockedLabel} sem contacto e sessão
              </span>
            )}
            {clientStats.recentlyActive > 0 && (
              <span className="trainer-dashboard__clients-summary-item trainer-dashboard__clients-summary-item--recent">
                {clientStats.recentlyActiveLabel} com sessão ≤ {RECENT_ACTIVITY_DAYS} dia(s)
              </span>
            )}
            {clientStats.hasInactivitySamples && clientStats.averageInactivityLabel && (
              <span className="trainer-dashboard__clients-summary-item trainer-dashboard__clients-summary-item--average">
                Média sem sessão: {clientStats.averageInactivityLabel} dia(s)
              </span>
            )}
            {clientStats.maxInactivity !== null && clientStats.maxInactivity > 0 && clientStats.maxInactivityLabel && (
              <span className="trainer-dashboard__clients-summary-item trainer-dashboard__clients-summary-item--max">
                Maior hiato: {clientStats.maxInactivityLabel} dia(s)
              </span>
            )}
            <span className="trainer-dashboard__clients-summary-item trainer-dashboard__clients-summary-item--rate">
              {clientStats.attentionRateLabel} da carteira em alerta
            </span>
          </div>
          {clientStats.distribution.filter((segment) => segment.count > 0).length > 0 && (
            <div
              className="trainer-dashboard__clients-distribution"
              role="img"
              aria-label={`Distribuição por prioridade: ${clientStats.distributionLabel}.`}
            >
              {clientStats.distribution
                .filter((segment) => segment.count > 0)
                .map((segment) => (
                  <div
                    key={segment.tone}
                    className={`trainer-dashboard__clients-distribution-segment trainer-dashboard__clients-distribution-segment--${segment.tone}`}
                    style={{ flexGrow: segment.count }}
                  >
                    <span className="trainer-dashboard__clients-distribution-count">{segment.countLabel}</span>
                    <span className="trainer-dashboard__clients-distribution-percent">{segment.percentLabel}</span>
                    <span className="trainer-dashboard__clients-distribution-label">{segment.label}</span>
                  </div>
                ))}
            </div>
          )}
          <div className="trainer-dashboard__clients-table" role="table">
            <div className="trainer-dashboard__clients-row trainer-dashboard__clients-row--head" role="row">
              <div role="columnheader">Cliente</div>
              <div role="columnheader">Próximas</div>
              <div role="columnheader">Concluídas</div>
              <div role="columnheader">Última sessão</div>
              <div role="columnheader">Próxima sessão</div>
              <div role="columnheader">Contacto</div>
            </div>
            {filteredEntries.length === 0 ? (
              <div className="trainer-dashboard__clients-empty" role="row">
                <div role="cell">
                  <p>
                    {noClients
                      ? 'Ainda não tens clientes atribuídos. Assim que um cliente for associado, ele aparecerá aqui.'
                      : 'Nenhum cliente corresponde aos filtros aplicados.'}
                  </p>
                  {!noClients && hasFilters && (
                    <button type="button" className="trainer-dashboard__clients-reset" onClick={clearFilters}>
                      Limpar filtros
                    </button>
                  )}
                </div>
              </div>
            ) : (
              filteredEntries.map(({ client, hasUpcoming, hasContact }) => (
                <div
                  key={client.id}
                  className={`trainer-dashboard__clients-row trainer-dashboard__clients-row--${clientToneClass(client.tone)}`}
                  role="row"
                >
                  <div role="cell" className="trainer-dashboard__clients-name">
                    <span>{client.name}</span>
                    {client.email && <span className="trainer-dashboard__clients-email">{client.email}</span>}
                  </div>
                  <div role="cell">{numberFormatter.format(client.upcoming)}</div>
                  <div role="cell">{numberFormatter.format(client.completed)}</div>
                  <div role="cell">{client.lastSessionLabel}</div>
                  <div role="cell">{hasUpcoming ? client.nextSessionLabel : NO_UPCOMING_LABEL}</div>
                  <div role="cell" className="trainer-dashboard__clients-contact">
                    {hasContact && client.email ? (
                      <a
                        href={`mailto:${client.email}`}
                        className="trainer-dashboard__clients-contact-link"
                        aria-label={`Enviar email para ${client.name}`}
                        title={`Enviar email para ${client.name}`}
                      >
                        Enviar email
                      </a>
                    ) : (
                      <span className="trainer-dashboard__clients-contact-missing">Sem email</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
