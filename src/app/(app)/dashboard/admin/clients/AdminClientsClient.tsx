'use client';

import * as React from 'react';
import useSWR from 'swr';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { XCircle } from 'lucide-react';
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
import DataSourceBadge, { describeDataSourceRelative } from '@/components/ui/DataSourceBadge';

import type {
  AdminClientRow,
  AdminClientsDashboardData,
  AdminClientRiskLevel,
  AdminClientStatusKey,
} from '@/lib/admin/clients/types';

const RANGE_OPTIONS = [
  { value: '12w', label: '12 semanas' },
  { value: '24w', label: '24 semanas' },
  { value: '36w', label: '36 semanas' },
] as const;

type RangeValue = (typeof RANGE_OPTIONS)[number]['value'];

type DashboardResponse = AdminClientsDashboardData & { ok: boolean; source: 'supabase' | 'fallback' };

const AUTO_REFRESH_INTERVAL_MS = 60_000;
const RELATIVE_REFRESH_TICK_MS = 30_000;

const numberFormatter = new Intl.NumberFormat('pt-PT');

const STATUS_VALUES = new Set(['all', 'active', 'pending', 'suspended', 'inactive']);
const RISK_VALUES = new Set(['all', 'healthy', 'watch', 'critical']);
const SORT_VALUES = new Set(['recent', 'sessions', 'spend', 'risk']);
const UNASSIGNED_TRAINER_VALUE = '__none__';

const listFormatter = new Intl.ListFormat('pt-PT', { style: 'long', type: 'conjunction' });

function deriveRangeFromWeeks(weeks: number): RangeValue {
  if (weeks >= 36) return '36w';
  if (weeks >= 24) return '24w';
  return '12w';
}

function canonicaliseRange(value: string | null, fallback: RangeValue): RangeValue {
  if (value && RANGE_OPTIONS.some((option) => option.value === value)) {
    return value as RangeValue;
  }
  return fallback;
}

function canonicaliseStatus(value: string | null): 'all' | AdminClientStatusKey {
  if (value && STATUS_VALUES.has(value)) {
    return value as 'all' | AdminClientStatusKey;
  }
  return 'all';
}

function canonicaliseRisk(value: string | null): 'all' | AdminClientRiskLevel {
  if (value && RISK_VALUES.has(value)) {
    return value as 'all' | AdminClientRiskLevel;
  }
  return 'all';
}

function canonicaliseSort(value: string | null): SortValue {
  if (value && SORT_VALUES.has(value)) {
    return value as SortValue;
  }
  return 'recent';
}

type TrainerValue = 'all' | typeof UNASSIGNED_TRAINER_VALUE | string;

function canonicaliseTrainer(value: string | null): TrainerValue {
  if (!value) return 'all';
  if (value === UNASSIGNED_TRAINER_VALUE || value === 'none') {
    return UNASSIGNED_TRAINER_VALUE;
  }
  return value;
}

function canonicaliseSearch(value: string | null): string {
  return value ?? '';
}

function normaliseText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

const fetcher = async (url: string): Promise<DashboardResponse> => {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || 'Não foi possível sincronizar os clientes.');
  }
  const payload = (await response.json()) as DashboardResponse | { ok?: boolean; message?: string };
  if (!payload || typeof payload !== 'object' || !('ok' in payload) || !payload.ok) {
    const message = (payload as any)?.message ?? 'Não foi possível sincronizar os clientes.';
    throw new Error(message);
  }
  return payload as DashboardResponse;
};

const STATUS_FILTERS: Array<{ value: 'all' | AdminClientStatusKey; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'suspended', label: 'Suspensos' },
  { value: 'inactive', label: 'Inativos' },
];

const RISK_FILTERS: Array<{ value: 'all' | AdminClientRiskLevel; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'healthy', label: 'Saudáveis' },
  { value: 'watch', label: 'A monitorizar' },
  { value: 'critical', label: 'Críticos' },
];

type SortValue = 'recent' | 'sessions' | 'spend' | 'risk';

const SORT_OPTIONS: Array<{ value: SortValue; label: string }> = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'sessions', label: 'Mais sessões' },
  { value: 'spend', label: 'Maior receita' },
  { value: 'risk', label: 'Maior risco' },
];

function matchesQuery(row: AdminClientRow, query: string): boolean {
  if (!query) return true;
  const value = normaliseText(query.trim());
  if (!value) return true;
  const haystack = [
    row.displayName,
    row.email ?? '',
    row.statusLabel,
    row.trainerName ?? '',
    row.id,
  ].map((entry) => normaliseText(entry));
  return haystack.some((entry) => entry.includes(value));
}

function compareRows(sort: SortValue): (a: AdminClientRow, b: AdminClientRow) => number {
  switch (sort) {
    case 'sessions':
      return (a, b) => b.sessionsCompleted - a.sessionsCompleted;
    case 'spend':
      return (a, b) => b.spendValue - a.spendValue;
    case 'risk':
      const levelOrder: Record<AdminClientRiskLevel, number> = { critical: 3, watch: 2, healthy: 1 };
      return (a, b) => levelOrder[b.riskLevel] - levelOrder[a.riskLevel];
    case 'recent':
    default:
      return (a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      };
  }
}

function exportCsv(rows: AdminClientRow[]) {
  const header = [
    'ID',
    'Nome',
    'Email',
    'Estado',
    'Treinador',
    'Saldo',
    'Receita 30d',
    'Sessões',
    'Próxima sessão',
    'Nível de risco',
    'Criado em',
    'Última actividade',
  ];
  const escape = (value: string) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
  const body = rows
    .map((row) =>
      [
        row.id,
        row.displayName,
        row.email ?? '',
        row.statusLabel,
        row.trainerName ?? '—',
        row.walletLabel,
        row.spendLabel,
        row.sessionsLabel,
        row.nextSessionLabel,
        row.riskLabel,
        row.createdAt ?? '—',
        row.lastActiveAt ?? '—',
      ]
        .map((value) => escape(value ?? ''))
        .join(','),
    )
    .join('\n');

  const csv = [header.join(','), body].filter(Boolean).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `clientes-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

type Props = {
  initialData: AdminClientsDashboardData;
};

export default function AdminClientsClient({ initialData }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams?.toString() ?? '';

  const [dashboard, setDashboard] = React.useState(initialData);
  const initialRangeRef = React.useRef<RangeValue>(deriveRangeFromWeeks(initialData.rangeWeeks));
  const [range, setRange] = React.useState<RangeValue>(initialRangeRef.current);
  const [status, setStatus] = React.useState<'all' | AdminClientStatusKey>('all');
  const [risk, setRisk] = React.useState<'all' | AdminClientRiskLevel>('all');
  const [trainer, setTrainer] = React.useState<TrainerValue>('all');
  const [search, setSearch] = React.useState('');
  const [sort, setSort] = React.useState<SortValue>('recent');
  const [dataSource, setDataSource] = React.useState<'supabase' | 'fallback'>(
    initialData.fallback ? 'fallback' : 'supabase',
  );
  const [lastUpdatedAt, setLastUpdatedAt] = React.useState<string | null>(initialData.updatedAt ?? null);
  const [isOnline, setIsOnline] = React.useState<boolean>(
    () => (typeof navigator === 'undefined' ? true : navigator.onLine),
  );
  const [, forceRelativeTick] = React.useState(0);
  const lastSyncedQueryRef = React.useRef<string>('');

  const defaultRangeValue = React.useMemo(
    () => deriveRangeFromWeeks(dashboard.rangeWeeks),
    [dashboard.rangeWeeks],
  );

  const { data, error, isValidating, mutate } = useSWR<DashboardResponse>(
    `/api/admin/clients/dashboard?range=${range}`,
    fetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  );

  React.useEffect(() => {
    if (!data?.ok) return;
    const { ok: _ok, source, ...rest } = data;
    setDashboard(rest);
    setDataSource(source ?? (rest.fallback ? 'fallback' : 'supabase'));
    setLastUpdatedAt(rest.updatedAt ?? null);
  }, [data]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!lastUpdatedAt) return;
    const id = window.setInterval(() => {
      forceRelativeTick((tick) => tick + 1);
    }, RELATIVE_REFRESH_TICK_MS);
    return () => window.clearInterval(id);
  }, [forceRelativeTick, lastUpdatedAt]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOnline = () => {
      setIsOnline(true);
      void mutate();
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [mutate]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isOnline) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void mutate();
      }
    }, AUTO_REFRESH_INTERVAL_MS);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isOnline) {
        void mutate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isOnline, mutate]);

  React.useEffect(() => {
    const params = new URLSearchParams(searchParamsString);
    const nextRange = canonicaliseRange(params.get('range'), defaultRangeValue);
    if (nextRange !== range) {
      setRange(nextRange);
    }
    const nextStatus = canonicaliseStatus(params.get('status'));
    if (nextStatus !== status) {
      setStatus(nextStatus);
    }
    const nextRisk = canonicaliseRisk(params.get('risk'));
    if (nextRisk !== risk) {
      setRisk(nextRisk);
    }
    const nextTrainer = canonicaliseTrainer(params.get('trainer'));
    if (nextTrainer !== trainer) {
      setTrainer(nextTrainer);
    }
    const nextSort = canonicaliseSort(params.get('sort'));
    if (nextSort !== sort) {
      setSort(nextSort);
    }
    const nextSearch = canonicaliseSearch(params.get('q'));
    if (nextSearch !== search) {
      setSearch(nextSearch);
    }
  }, [defaultRangeValue, range, risk, search, searchParamsString, status, sort, trainer]);

  React.useEffect(() => {
    const params = new URLSearchParams(searchParamsString);
    const trimmedSearch = search.trim();
    if (trimmedSearch) {
      params.set('q', trimmedSearch);
    } else {
      params.delete('q');
    }
    if (range !== defaultRangeValue) {
      params.set('range', range);
    } else {
      params.delete('range');
    }
    if (status !== 'all') {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    if (risk !== 'all') {
      params.set('risk', risk);
    } else {
      params.delete('risk');
    }
    if (trainer !== 'all') {
      params.set('trainer', trainer);
    } else {
      params.delete('trainer');
    }
    if (sort !== 'recent') {
      params.set('sort', sort);
    } else {
      params.delete('sort');
    }
    const nextString = params.toString();
    if (nextString === searchParamsString) {
      lastSyncedQueryRef.current = nextString;
      return;
    }
    if (lastSyncedQueryRef.current === nextString) {
      return;
    }
    lastSyncedQueryRef.current = nextString;
    router.replace(`${pathname}${nextString ? `?${nextString}` : ''}`, { scroll: false });
  }, [
    defaultRangeValue,
    pathname,
    range,
    risk,
    router,
    search,
    searchParamsString,
    sort,
    status,
    trainer,
  ]);

  const filteredRows = React.useMemo(() => {
    return dashboard.rows
      .filter((row) => matchesQuery(row, search))
      .filter((row) => (status === 'all' ? true : row.statusKey === status))
      .filter((row) => (risk === 'all' ? true : row.riskLevel === risk))
      .filter((row) => {
        if (trainer === 'all') return true;
        if (trainer === UNASSIGNED_TRAINER_VALUE) {
          return !row.trainerName;
        }
        return row.trainerName === trainer;
      });
  }, [dashboard.rows, risk, search, status, trainer]);

  const sortedRows = React.useMemo(() => {
    const comparer = compareRows(sort);
    return [...filteredRows].sort(comparer);
  }, [filteredRows, sort]);

  const syncError = error ? error.message : null;

  const lastUpdatedSubtitle = React.useMemo(() => {
    if (!lastUpdatedAt) {
      return 'Sincronização inicial em curso…';
    }
    const relative = describeDataSourceRelative(lastUpdatedAt);
    const absolute = new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(lastUpdatedAt));
    if (relative) {
      return `Actualizado ${relative} (${absolute}).`;
    }
    return `Actualizado em ${absolute}.`;
  }, [lastUpdatedAt]);

  const filtersActive = React.useMemo(() => {
    if (status !== 'all' || risk !== 'all' || trainer !== 'all') return true;
    if (range !== initialRangeRef.current) return true;
    if (sort !== 'recent') return true;
    return Boolean(search.trim());
  }, [initialRangeRef, range, risk, search, sort, status, trainer]);

  const resultsSummary = React.useMemo(() => {
    const total = dashboard.rows.length;
    const filtered = filteredRows.length;
    if (total === 0) {
      return 'Sem clientes carregados neste momento.';
    }
    if (!filtersActive) {
      return `${numberFormatter.format(total)} clientes carregados.`;
    }
    return `${numberFormatter.format(filtered)} de ${numberFormatter.format(total)} clientes correspondem aos critérios actuais.`;
  }, [dashboard.rows.length, filteredRows.length, filtersActive]);

  const autoRefreshHint = isOnline
    ? 'Actualização automática a cada minuto.'
    : 'Actualização automática suspensa enquanto estiver offline.';

  const trainerFilterOptions = React.useMemo(() => {
    const actualCounts = new Map<string, number>();
    dashboard.rows.forEach((row) => {
      const key = row.trainerName ?? UNASSIGNED_TRAINER_VALUE;
      actualCounts.set(key, (actualCounts.get(key) ?? 0) + 1);
    });

    const labelByValue = new Map<string, string>();
    const options: Array<{ value: string; label: string }> = [];

    dashboard.filters.trainers.forEach((item) => {
      const total = Math.max(item.total, actualCounts.get(item.name) ?? 0);
      const label = total > 0 ? `${item.name} (${numberFormatter.format(total)})` : item.name;
      options.push({ value: item.name, label });
      labelByValue.set(item.name, item.name);
    });

    const knownNames = new Set(options.map((option) => option.value));
    Array.from(actualCounts.entries()).forEach(([name, total]) => {
      if (name === UNASSIGNED_TRAINER_VALUE) {
        return;
      }
      if (knownNames.has(name)) {
        return;
      }
      const label = total > 0 ? `${name} (${numberFormatter.format(total)})` : name;
      options.push({ value: name, label });
      labelByValue.set(name, name);
    });

    options.sort((a, b) => normaliseText(a.value).localeCompare(normaliseText(b.value)));

    labelByValue.set(UNASSIGNED_TRAINER_VALUE, 'Sem treinador');

    return {
      options,
      unassignedTotal: actualCounts.get(UNASSIGNED_TRAINER_VALUE) ?? 0,
      labelByValue,
    };
  }, [dashboard.filters.trainers, dashboard.rows]);

  const {
    options: trainerOptions,
    unassignedTotal: unassignedTrainerTotal,
    labelByValue: trainerLabelByValue,
  } = trainerFilterOptions;

  const handleResetFilters = React.useCallback(() => {
    setSearch('');
    setStatus('all');
    setRisk('all');
    setTrainer('all');
    setSort('recent');
    setRange(initialRangeRef.current);
  }, [initialRangeRef]);

  const activeFiltersDescription = React.useMemo(() => {
    const parts: string[] = [];
    const trimmedSearch = search.trim();
    if (trimmedSearch) {
      parts.push(`Pesquisa por "${trimmedSearch}"`);
    }
    if (status !== 'all') {
      const label = STATUS_FILTERS.find((option) => option.value === status)?.label ?? status;
      parts.push(`Estado: ${label}`);
    }
    if (risk !== 'all') {
      const label = RISK_FILTERS.find((option) => option.value === risk)?.label ?? risk;
      parts.push(`Risco: ${label}`);
    }
    if (trainer !== 'all') {
      const label =
        trainer === UNASSIGNED_TRAINER_VALUE
          ? 'Sem treinador'
          : trainerLabelByValue.get(trainer) ?? trainer;
      parts.push(`Treinador: ${label}`);
    }
    if (range !== initialRangeRef.current) {
      const label = RANGE_OPTIONS.find((option) => option.value === range)?.label ?? range;
      parts.push(`Intervalo: ${label}`);
    }
    if (sort !== 'recent') {
      const label = SORT_OPTIONS.find((option) => option.value === sort)?.label ?? sort;
      parts.push(`Ordenação: ${label}`);
    }
    if (parts.length === 0) {
      return 'Sem filtros adicionais aplicados.';
    }
    return `${listFormatter.format(parts)}.`;
  }, [range, risk, search, sort, status, trainer, trainerLabelByValue, initialRangeRef]);

  return (
    <div className="admin-clients-dashboard neo-stack neo-stack--xl">
      <PageHeader
        title="Clientes"
        subtitle={
          <span>
            Acompanhar métricas, sessões e risco por cliente.{' '}
            <strong>Última sincronização:</strong> {lastUpdatedSubtitle}
          </span>
        }
        actions={
          <div className="neo-inline neo-inline--sm neo-inline--end">
            <DataSourceBadge source={dataSource} generatedAt={lastUpdatedAt} />
            <Button variant="ghost" onClick={() => exportCsv(sortedRows)} disabled={!sortedRows.length}>
              Exportar CSV
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                void mutate();
              }}
              loading={isValidating}
              loadingText="A sincronizar…"
              disabled={!isOnline}
            >
              {isOnline ? 'Reforçar sincronização' : 'Sem ligação'}
            </Button>
          </div>
        }
      />

      {!isOnline && (
        <div className="neo-alert neo-alert--warning" role="status">
          <div className="neo-alert__content">
            <strong>Ligação offline detectada.</strong>
            <p>Mostramos os últimos dados sincronizados. Retomaremos a actualização assim que voltares a ficar online.</p>
          </div>
        </div>
      )}

      {dashboard.fallback && (
        <div className="neo-alert neo-alert--info" role="status">
          <div className="neo-alert__content">
            <strong>Modo offline.</strong>
            <p>Estamos a mostrar dados de demonstração até a ligação ao servidor ficar disponível.</p>
          </div>
        </div>
      )}

      {syncError && (
        <div className="neo-alert neo-alert--warning" role="status">
          <div className="neo-alert__content">
            <strong>Falha ao sincronizar dados em tempo real.</strong>
            <p>{syncError}</p>
          </div>
        </div>
      )}

      <section className="neo-panel admin-clients-dashboard__hero" aria-label="Métricas principais">
        <div className="neo-panel__meta">
          <h2 className="neo-panel__title">Visão geral</h2>
          <p className="neo-panel__subtitle">
            Distribuição agregada dos últimos {dashboard.rangeWeeks} semanas.
          </p>
        </div>
        <div className="admin-clients-dashboard__heroGrid">
          {dashboard.hero.map((metric) => (
            <article key={metric.id} className="neo-surface admin-clients-dashboard__heroCard" data-tone={metric.tone}>
              <h3>{metric.label}</h3>
              <p className="admin-clients-dashboard__heroValue">{metric.value}</p>
              <span className="admin-clients-dashboard__heroHelper">{metric.helper}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="neo-panel admin-clients-dashboard__timeline" aria-label="Novos clientes e sessões por semana">
        <div className="neo-panel__header">
          <div className="neo-panel__meta">
            <h2 className="neo-panel__title">Atividade semanal</h2>
            <p className="neo-panel__subtitle">
              Evolução de novos clientes, clientes ativos e sessões concluídas no período seleccionado.
            </p>
          </div>
          <label className="neo-input-group admin-clients-dashboard__range">
            <span className="neo-input-group__label">Intervalo</span>
            <select
              className="neo-input neo-input--compact"
              value={range}
              onChange={(event) => setRange(event.target.value as RangeValue)}
            >
              {RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="admin-clients-dashboard__chart">
          <ResponsiveContainer>
            <AreaChart data={dashboard.timeline} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--neo-border-subtle)" />
              <XAxis dataKey="label" stroke="var(--neo-text-tertiary)" minTickGap={24} />
              <YAxis stroke="var(--neo-text-tertiary)" allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'var(--neo-surface-elevated)', borderRadius: 12, border: '1px solid var(--neo-border-strong)' }}
              />
              <Area type="monotone" dataKey="newClients" name="Novos clientes" stroke="var(--neo-chart-primary)" fill="var(--neo-chart-primary-fill)" />
              <Area type="monotone" dataKey="activeClients" name="Clientes activos" stroke="var(--neo-chart-positive)" fill="var(--neo-chart-positive-fill)" />
              <Area type="monotone" dataKey="sessionsCompleted" name="Sessões concluídas" stroke="var(--neo-chart-warning)" fill="var(--neo-chart-warning-fill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="admin-clients-dashboard__grid" aria-label="Distribuições e destaques">
        <article className="neo-panel admin-clients-dashboard__asideCard" aria-label="Estados dos clientes">
          <h3 className="neo-panel__title">Estado dos clientes</h3>
          <ul className="admin-clients-dashboard__list">
            {dashboard.statuses.map((segment) => (
              <li key={segment.id}>
                <span className="admin-clients-dashboard__label">{segment.label}</span>
                <span className="admin-clients-dashboard__value">{(segment.share * 100).toFixed(0)}% · {segment.total}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="neo-panel admin-clients-dashboard__asideCard" aria-label="Engajamento">
          <h3 className="neo-panel__title">Engajamento</h3>
          <ul className="admin-clients-dashboard__list">
            {dashboard.engagement.map((segment) => (
              <li key={segment.id}>
                <span className="admin-clients-dashboard__label">{segment.label}</span>
                <span className="admin-clients-dashboard__value">{(segment.share * 100).toFixed(0)}% · {segment.total}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="neo-panel admin-clients-dashboard__asideCard" aria-label="Saldo em carteira">
          <h3 className="neo-panel__title">Carteira</h3>
          <ul className="admin-clients-dashboard__list">
            {dashboard.wallet.map((segment) => (
              <li key={segment.id}>
                <span className="admin-clients-dashboard__label">{segment.label}</span>
                <span className="admin-clients-dashboard__value">{(segment.share * 100).toFixed(0)}% · {segment.total}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="neo-panel admin-clients-dashboard__asideCard" aria-label="Treinadores">
          <h3 className="neo-panel__title">Treinadores atribuídos</h3>
          <ul className="admin-clients-dashboard__list">
            {dashboard.trainers.map((segment) => (
              <li key={segment.id}>
                <span className="admin-clients-dashboard__label">{segment.label}</span>
                <span className="admin-clients-dashboard__value">{segment.total}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="admin-clients-dashboard__highlights" aria-label="Clientes em destaque">
        <article className="neo-panel admin-clients-dashboard__highlight" aria-label="Maior receita">
          <h3 className="neo-panel__title">Top receita 30 dias</h3>
          <ul>
            {dashboard.highlights.revenue.map((item) => (
              <li key={item.id}>
                <div className="admin-clients-dashboard__highlightMeta">
                  <strong>{item.name}</strong>
                  <span>{item.amount}</span>
                </div>
                <p>{item.helper}</p>
              </li>
            ))}
          </ul>
        </article>
        <article className="neo-panel admin-clients-dashboard__highlight" aria-label="Clientes em risco">
          <h3 className="neo-panel__title">Clientes em risco</h3>
          <ul>
            {dashboard.highlights.atRisk.map((item) => (
              <li key={item.id}>
                <div className="admin-clients-dashboard__highlightMeta">
                  <strong>{item.name}</strong>
                  <span>{item.amount}</span>
                </div>
                <p>{item.helper}</p>
              </li>
            ))}
          </ul>
        </article>
        <article className="neo-panel admin-clients-dashboard__highlight" aria-label="Novos clientes">
          <h3 className="neo-panel__title">Novos clientes</h3>
          <ul>
            {dashboard.highlights.newcomers.map((item) => (
              <li key={item.id}>
                <div className="admin-clients-dashboard__highlightMeta">
                  <strong>{item.name}</strong>
                  <span>{item.statusLabel}</span>
                </div>
                <p>{item.helper}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="neo-panel admin-clients-dashboard__table" aria-label="Tabela de clientes">
        <header className="neo-panel__header">
          <div className="neo-panel__meta">
            <h2 className="neo-panel__title">Lista de clientes</h2>
            <p className="neo-panel__subtitle">
              Pesquisa, filtros e exportação dos clientes com métricas operacionais.
            </p>
          </div>
          <div className="admin-clients-dashboard__filters" role="group" aria-label="Filtros da lista de clientes">
            <label className="neo-input-group admin-clients-dashboard__filter">
              <span className="neo-input-group__label">Pesquisa</span>
              <input
                className="neo-input neo-input--compact"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nome, email ou ID"
                aria-label="Pesquisar clientes"
              />
            </label>
            <label className="neo-input-group admin-clients-dashboard__filter">
              <span className="neo-input-group__label">Estado</span>
              <select
                className="neo-input neo-input--compact"
                value={status}
                onChange={(event) => setStatus(event.target.value as any)}
                aria-label="Filtrar por estado"
              >
                {STATUS_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="neo-input-group admin-clients-dashboard__filter">
              <span className="neo-input-group__label">Risco</span>
              <select
                className="neo-input neo-input--compact"
                value={risk}
                onChange={(event) => setRisk(event.target.value as any)}
                aria-label="Filtrar por risco"
              >
                {RISK_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="neo-input-group admin-clients-dashboard__filter">
              <span className="neo-input-group__label">Treinador</span>
              <select
                className="neo-input neo-input--compact"
                value={trainer}
                onChange={(event) => setTrainer(event.target.value as TrainerValue)}
                aria-label="Filtrar por treinador"
              >
                <option value="all">Todos</option>
                {unassignedTrainerTotal > 0 && (
                  <option value={UNASSIGNED_TRAINER_VALUE}>
                    {`Sem treinador (${numberFormatter.format(unassignedTrainerTotal)})`}
                  </option>
                )}
                {trainerOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="neo-input-group admin-clients-dashboard__filter">
              <span className="neo-input-group__label">Ordenar</span>
              <select
                className="neo-input neo-input--compact"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortValue)}
                aria-label="Ordenar lista"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              disabled={!filtersActive}
              leftIcon={<XCircle className="neo-icon neo-icon--xs" aria-hidden />}
            >
              Limpar filtros
            </Button>
          </div>
          <p className="neo-text--sm neo-text--muted" role="status" aria-live="polite">
            {activeFiltersDescription}
          </p>
        </header>

        <div className="neo-inline neo-inline--between neo-inline--sm" role="status" aria-live="polite">
          <span className="neo-text--sm neo-text--muted">{resultsSummary}</span>
          <span className="neo-text--xs neo-text--muted">{autoRefreshHint}</span>
        </div>

        <div className="neo-table-wrapper">
          <table className="neo-table admin-clients-dashboard__tableGrid">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Treinador</th>
                <th>Saldo</th>
                <th>Receita 30d</th>
                <th>Sessões</th>
                <th>Próxima sessão</th>
                <th>Risco</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="admin-clients-dashboard__cell">
                      <strong>{row.displayName}</strong>
                      <span>{row.email ?? '—'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="neo-tag" data-tone={row.statusTone}>{row.statusLabel}</span>
                  </td>
                  <td>{row.trainerName ?? '—'}</td>
                  <td>
                    <span className={`admin-clients-dashboard__wallet admin-clients-dashboard__wallet--${row.walletTone}`}>
                      {row.walletLabel}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-clients-dashboard__spend admin-clients-dashboard__spend--${row.spendTone}`}>
                      {row.spendLabel}
                    </span>
                  </td>
                  <td>
                    <span title={row.sessionsTooltip}>{row.sessionsLabel}</span>
                  </td>
                  <td>{row.nextSessionLabel}</td>
                  <td>
                    <span className={`admin-clients-dashboard__risk admin-clients-dashboard__risk--${row.riskTone}`}>
                      {row.riskLabel}
                    </span>
                  </td>
                </tr>
              ))}
              {!sortedRows.length && (
                <tr>
                  <td colSpan={8}>
                    <div className="neo-empty">
                      <span className="neo-empty__icon" aria-hidden>
                        📉
                      </span>
                      <p className="neo-empty__title">Sem clientes correspondentes</p>
                      <p className="neo-empty__description">
                        Ajusta os filtros ou pesquisa para encontrar o cliente pretendido.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
