'use client';

import * as React from 'react';
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
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import type {
  AdminUserRoleKey,
  AdminUserStatusKey,
  AdminUsersDashboardData,
  AdminUsersRow,
} from '@/lib/users/types';

const RANGE_OPTIONS = [
  { value: '6', label: '6 semanas' },
  { value: '12', label: '12 semanas' },
  { value: '24', label: '24 semanas' },
] as const;

type RangeValue = (typeof RANGE_OPTIONS)[number]['value'];

type DashboardResponse = AdminUsersDashboardData & { ok: boolean; source: 'supabase' | 'fallback' };

const fetcher = async (url: string): Promise<DashboardResponse> => {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Não foi possível sincronizar os utilizadores.');
  }
  const payload = (await response.json()) as DashboardResponse | { ok?: boolean; message?: string };
  if (!payload || typeof payload !== 'object' || !('ok' in payload) || !payload.ok) {
    const message = (payload as any)?.message ?? 'Não foi possível sincronizar os utilizadores.';
    throw new Error(message);
  }
  return payload as DashboardResponse;
};

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatDateTime(value: string | null | undefined): string {
  const date = parseDate(value);
  if (!date) return '—';
  try {
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    console.warn('users-dashboard.formatDateTime', error);
    return '—';
  }
}

function formatRelative(value: string | null | undefined): string {
  const date = parseDate(value);
  if (!date) return '—';
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  if (Math.abs(diffMinutes) < 1) return 'agora mesmo';
  if (Math.abs(diffMinutes) < 60) {
    const label = Math.abs(diffMinutes);
    return diffMinutes > 0 ? `em ${label} min` : `há ${label} min`;
  }
  const diffHours = Math.round(diffMs / 3_600_000);
  if (Math.abs(diffHours) < 24) {
    const label = Math.abs(diffHours);
    return diffHours > 0 ? `em ${label} h` : `há ${label} h`;
  }
  const diffDays = Math.round(diffMs / 86_400_000);
  if (Math.abs(diffDays) < 14) {
    const label = Math.abs(diffDays);
    return diffDays > 0 ? `em ${label} dias` : `há ${label} dias`;
  }
  const diffWeeks = Math.round(diffDays / 7);
  return diffWeeks > 0 ? `em ${diffWeeks} sem` : `há ${Math.abs(diffWeeks)} sem`;
}

function matchesQuery(row: AdminUsersRow, query: string): boolean {
  if (!query) return true;
  const haystack = [
    row.displayName.toLowerCase(),
    row.email?.toLowerCase() ?? '',
    row.roleLabel.toLowerCase(),
    row.statusLabel.toLowerCase(),
    row.id.toLowerCase(),
  ];
  const q = query.toLowerCase();
  return haystack.some((value) => value.includes(q));
}

function toCsvValue(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function exportRows(rows: AdminUsersRow[]) {
  const header = [
    'ID',
    'Nome',
    'Email',
    'Perfil',
    'Estado',
    'Criado em',
    'Último login',
    'Última atividade',
    'Online',
  ];
  const csvRows = rows.map((row) => [
    row.id,
    row.displayName,
    row.email ?? '',
    row.roleLabel,
    row.statusLabel,
    formatDateTime(row.createdAt),
    formatDateTime(row.lastLoginAt),
    formatDateTime(row.lastSeenAt),
    row.online ? 'Sim' : 'Não',
  ]);
  const allRows = [header, ...csvRows]
    .map((cols) => cols.map((value) => toCsvValue(value ?? '')).join(','))
    .join('\n');
  const blob = new Blob([allRows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `utilizadores-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function toneToDataTone(tone: AdminUsersRow['statusTone']): 'success' | 'warning' | 'danger' | 'neutral' {
  if (tone === 'positive') return 'success';
  if (tone === 'warning') return 'warning';
  if (tone === 'critical') return 'danger';
  return 'neutral';
}

type Props = {
  initialData: AdminUsersDashboardData;
  viewerName?: string | null;
};

export default function UsersClient({ initialData, viewerName }: Props) {
  const [dashboard, setDashboard] = React.useState(initialData);
  const [source, setSource] = React.useState<'initial' | 'supabase' | 'fallback'>(
    initialData.fallback ? 'fallback' : 'supabase',
  );
  const [search, setSearch] = React.useState('');
  const [role, setRole] = React.useState<'all' | AdminUserRoleKey>('all');
  const [status, setStatus] = React.useState<'all' | AdminUserStatusKey>('all');
  const [onlineOnly, setOnlineOnly] = React.useState(false);
  const [range, setRange] = React.useState<RangeValue>('12');

  const {
    data: remoteData,
    error,
    isLoading,
    mutate,
  } = useSWR<DashboardResponse>('/api/admin/users/dashboard', fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
  });

  React.useEffect(() => {
    if (remoteData?.ok) {
      const { ok: _ok, source: remoteSource, ...rest } = remoteData;
      setDashboard(rest);
      setSource(remoteSource);
    }
  }, [remoteData]);

  const syncError = error ? error.message : null;
  const lastUpdated = formatDateTime(dashboard.updatedAt);
  const fallbackActive = source === 'fallback' || dashboard.fallback;

  const timelineData = React.useMemo(() => {
    const weeks = parseInt(range, 10);
    return dashboard.timeline
      .slice(Math.max(0, dashboard.timeline.length - weeks))
      .map((point) => ({
        name: point.label,
        signups: point.signups,
        active: point.active,
        pending: point.pending,
      }));
  }, [dashboard.timeline, range]);

  const roleOptions = React.useMemo(() => {
    return dashboard.roles.map((item) => ({ value: item.key as AdminUserRoleKey, label: item.label }));
  }, [dashboard.roles]);

  const statusOptions = React.useMemo(() => {
    return dashboard.statuses.map((item) => ({ value: item.key as AdminUserStatusKey, label: item.label }));
  }, [dashboard.statuses]);

  const filteredRows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return dashboard.rows.filter((row) => {
      if (role !== 'all' && row.roleKey !== role) return false;
      if (status !== 'all' && row.statusKey !== status) return false;
      if (onlineOnly && !row.online) return false;
      if (!q) return true;
      return matchesQuery(row, q);
    });
  }, [dashboard.rows, role, status, onlineOnly, search]);

  const emptyStateTitle = dashboard.rows.length > 0 ? 'Sem resultados' : 'Ainda sem utilizadores';
  const emptyStateDescription = dashboard.rows.length > 0
    ? 'Ajusta os filtros ou limpa a pesquisa para voltares a ver a lista completa.'
    : 'Quando um novo utilizador se registar, vais vê-lo automaticamente aqui.';

  const handleRefresh = React.useCallback(() => {
    void mutate();
  }, [mutate]);

  const handleExport = React.useCallback(() => {
    exportRows(filteredRows);
  }, [filteredRows]);

  return (
    <div className="users-dashboard neo-stack neo-stack--lg">
      <PageHeader
        title="Utilizadores"
        subtitle={
          viewerName
            ? `Gestão avançada de contas, aprovações e atividade em tempo real. (${viewerName})`
            : 'Gestão avançada de contas, aprovações e atividade em tempo real.'
        }
        actions={(
          <div className="users-dashboard__headerActions">
            <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
              Atualizar
            </Button>
            <Button size="sm" onClick={handleExport} disabled={filteredRows.length === 0}>
              Exportar CSV
            </Button>
          </div>
        )}
      />

      <section className="neo-panel users-dashboard__hero" aria-labelledby="users-hero-heading">
        <header className="users-dashboard__heroHeader">
          <div>
            <h2 id="users-hero-heading" className="neo-panel__title">
              Visão geral
            </h2>
            <p className="users-dashboard__heroHint">Atualizado {lastUpdated}</p>
          </div>
          <div className="users-dashboard__sync" role="status" aria-live="polite">
            {syncError ? (
              <span className="users-dashboard__sync users-dashboard__sync--error">
                ⚠️ {syncError}
              </span>
            ) : fallbackActive ? (
              <span className="users-dashboard__sync users-dashboard__sync--fallback">
                Dados de demonstração (offline)
              </span>
            ) : (
              <span className="users-dashboard__sync users-dashboard__sync--ok">
                {isLoading ? 'A sincronizar…' : 'Sincronizado com Supabase'}
              </span>
            )}
          </div>
        </header>

        <div className="users-dashboard__heroGrid">
          {dashboard.hero.map((metric) => (
            <article
              key={metric.key}
              className={`users-dashboard__heroCard users-dashboard__heroCard--${metric.tone ?? 'neutral'}`}
            >
              <header className="users-dashboard__heroCardHeader">
                <p className="users-dashboard__heroLabel">{metric.label}</p>
                {metric.hint && <span className="users-dashboard__heroMeta">{metric.hint}</span>}
              </header>
              <p className="users-dashboard__heroValue">{metric.value}</p>
              {metric.trend && <p className="users-dashboard__heroTrend">{metric.trend}</p>}
            </article>
          ))}
        </div>
      </section>

      <section className="users-dashboard__layout" aria-labelledby="users-analytics-heading">
        <article className="neo-panel users-dashboard__timeline" aria-label="Novos registos por semana">
          <header className="users-dashboard__sectionHeader">
            <div>
              <h2 id="users-analytics-heading" className="neo-panel__title">
                Registos recentes
              </h2>
              <p className="users-dashboard__sectionDescription">
                Evolução semanal dos novos utilizadores, com destaque para aprovações pendentes.
              </p>
            </div>
            <label className="neo-input-group users-dashboard__range">
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
          </header>

          <div className="users-dashboard__chart">
            {timelineData.length === 0 ? (
              <div className="users-dashboard__emptyChart">
                <span aria-hidden>📈</span>
                <p>Nenhum registo recente.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={timelineData} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--neo-border-subtle)" />
                  <XAxis dataKey="name" stroke="var(--neo-text-tertiary)" />
                  <YAxis allowDecimals={false} stroke="var(--neo-text-tertiary)" />
                  <Tooltip
                    formatter={(value: number, key: string) => {
                      const label = key === 'signups'
                        ? 'Registos'
                        : key === 'active'
                          ? 'Ativos'
                          : 'Pendentes';
                      return [value, label];
                    }}
                  />
                  <Area type="monotone" dataKey="signups" stroke="#2563eb" fill="rgba(37,99,235,0.28)" />
                  <Area type="monotone" dataKey="active" stroke="#22c55e" fill="rgba(34,197,94,0.25)" />
                  <Area type="monotone" dataKey="pending" stroke="#facc15" fill="rgba(250,204,21,0.25)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <aside className="users-dashboard__aside">
          <div className="neo-panel users-dashboard__asideCard" aria-label="Distribuição por perfil">
            <h3 className="users-dashboard__asideTitle">Perfis</h3>
            <ul className="users-dashboard__distribution">
              {dashboard.roles.map((item) => (
                <li key={item.key}>
                  <div>
                    <span className="users-dashboard__distributionLabel">{item.label}</span>
                    <span className="users-dashboard__distributionValue">{item.total}</span>
                  </div>
                  <div className="users-dashboard__distributionBar">
                    <div style={{ width: `${Math.min(100, Math.round(item.percentage))}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="neo-panel users-dashboard__asideCard" aria-label="Distribuição por estado">
            <h3 className="users-dashboard__asideTitle">Estados</h3>
            <ul className="users-dashboard__distribution">
              {dashboard.statuses.map((item) => (
                <li key={item.key}>
                  <div>
                    <span className="users-dashboard__distributionLabel">{item.label}</span>
                    <span className="users-dashboard__distributionValue">{item.total}</span>
                  </div>
                  <div className={`users-dashboard__distributionBar users-dashboard__distributionBar--${item.tone ?? 'neutral'}`}>
                    <div style={{ width: `${Math.min(100, Math.round(item.percentage))}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      <section className="users-dashboard__highlights" aria-label="Destaques">
        <article className="neo-panel users-dashboard__highlight" aria-label="Online agora">
          <header>
            <h3 className="users-dashboard__highlightTitle">Online agora</h3>
            <p className="users-dashboard__highlightSubtitle">Última atividade registada</p>
          </header>
          {dashboard.online.length === 0 ? (
            <div className="users-dashboard__empty">
              <span aria-hidden>💤</span>
              <p>Sem utilizadores online neste momento.</p>
            </div>
          ) : (
            <ul>
              {dashboard.online.map((user) => (
                <li key={user.id}>
                  <div className="users-dashboard__highlightInfo">
                    <strong>{user.name}</strong>
                    <span>{user.roleLabel}</span>
                  </div>
                  <div className={`users-dashboard__status users-dashboard__status--${user.statusTone}`}>
                    {user.statusLabel}
                  </div>
                  <span className="users-dashboard__highlightMeta">{formatRelative(user.lastSeenAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="neo-panel users-dashboard__highlight" aria-label="Aprovações pendentes">
          <header>
            <h3 className="users-dashboard__highlightTitle">Aprovações pendentes</h3>
            <p className="users-dashboard__highlightSubtitle">Últimas inscrições por validar</p>
          </header>
          {dashboard.approvals.length === 0 ? (
            <div className="users-dashboard__empty">
              <span aria-hidden>✅</span>
              <p>Todas as inscrições estão em dia.</p>
            </div>
          ) : (
            <ul>
              {dashboard.approvals.map((user) => (
                <li key={user.id}>
                  <div className="users-dashboard__highlightInfo">
                    <strong>{user.name}</strong>
                    <span>{user.roleLabel}</span>
                  </div>
                  <div className={`users-dashboard__status users-dashboard__status--${user.statusTone}`}>
                    {user.statusLabel}
                  </div>
                  <span className="users-dashboard__highlightMeta">{formatDateTime(user.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="neo-panel users-dashboard__highlight" aria-label="Novos registos">
          <header>
            <h3 className="users-dashboard__highlightTitle">Novos registos</h3>
            <p className="users-dashboard__highlightSubtitle">Últimos perfis criados</p>
          </header>
          {dashboard.recent.length === 0 ? (
            <div className="users-dashboard__empty">
              <span aria-hidden>🆕</span>
              <p>Sem novos registos nos últimos dias.</p>
            </div>
          ) : (
            <ul>
              {dashboard.recent.map((user) => (
                <li key={user.id}>
                  <div className="users-dashboard__highlightInfo">
                    <strong>{user.name}</strong>
                    <span>{user.roleLabel}</span>
                  </div>
                  <div className={`users-dashboard__status users-dashboard__status--${user.statusTone}`}>
                    {user.statusLabel}
                  </div>
                  <span className="users-dashboard__highlightMeta">{formatDateTime(user.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="neo-panel users-dashboard__table" aria-labelledby="users-table-heading">
        <header className="users-dashboard__tableHeader">
          <div>
            <h2 id="users-table-heading" className="neo-panel__title">
              Todos os utilizadores
            </h2>
            <p className="users-dashboard__sectionDescription">
              Pesquisa avançada, filtros por perfil/estado e exportação para CSV.
            </p>
          </div>
        </header>

        <div className="users-dashboard__filters">
          <label className="neo-input-group users-dashboard__filter">
            <span className="neo-input-group__label">Pesquisa</span>
            <input
              type="search"
              className="neo-input neo-input--compact"
              placeholder="Nome, email ou ID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <label className="neo-input-group users-dashboard__filter">
            <span className="neo-input-group__label">Perfil</span>
            <select
              className="neo-input neo-input--compact"
              value={role}
              onChange={(event) => setRole(event.target.value as 'all' | AdminUserRoleKey)}
            >
              <option value="all">Todos</option>
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="neo-input-group users-dashboard__filter">
            <span className="neo-input-group__label">Estado</span>
            <select
              className="neo-input neo-input--compact"
              value={status}
              onChange={(event) => setStatus(event.target.value as 'all' | AdminUserStatusKey)}
            >
              <option value="all">Todos</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="users-dashboard__toggle">
            <input
              type="checkbox"
              className="neo-checkbox"
              checked={onlineOnly}
              onChange={(event) => setOnlineOnly(event.target.checked)}
            />
            <span>Mostrar apenas online</span>
          </label>
        </div>

        <div className="users-dashboard__tableWrapper" role="region" aria-live="polite">
          <table className="users-dashboard__dataTable">
            <thead>
              <tr>
                <th>Utilizador</th>
                <th>Email</th>
                <th>Perfil</th>
                <th>Estado</th>
                <th>Criado</th>
                <th>Último login</th>
                <th>Última atividade</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="users-dashboard__userCell">
                      <strong>{row.displayName}</strong>
                      <span>{row.id}</span>
                    </div>
                  </td>
                  <td>{row.email ?? '—'}</td>
                  <td>{row.roleLabel}</td>
                  <td>
                    <span className="neo-tag" data-tone={toneToDataTone(row.statusTone)}>
                      {row.statusLabel}
                    </span>
                  </td>
                  <td>{formatDateTime(row.createdAt)}</td>
                  <td>{formatDateTime(row.lastLoginAt)}</td>
                  <td>{formatDateTime(row.lastSeenAt)}</td>
                </tr>
              ))}
              {!filteredRows.length && (
                <tr>
                  <td colSpan={7}>
                    <div className="users-dashboard__empty">
                      <span aria-hidden>🗂️</span>
                      <p className="users-dashboard__emptyTitle">{emptyStateTitle}</p>
                      <p className="users-dashboard__emptyDescription">{emptyStateDescription}</p>
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
