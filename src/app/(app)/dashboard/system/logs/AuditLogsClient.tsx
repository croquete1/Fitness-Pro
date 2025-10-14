"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type StatusState = 'ok' | 'warn' | 'down';

type LogRow = {
  id: string;
  when: string;
  action: string;
  actor?: string;
  target?: string;
  ip?: string;
  meta?: any;
};

const ENDPOINTS = [
  "/api/admin/logs",
  "/api/system/logs",
  "/api/admin/notifications?type=audit&limit=100",
  "/api/dashboard/activities?scope=system&limit=100",
];

async function fetchFirstOk(urls: string[]): Promise<any[]> {
  for (const url of urls) {
    try {
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) continue;
      const payload = await response.json();
      if (Array.isArray(payload)) return payload;
      if (Array.isArray((payload as any).data)) return (payload as any).data;
      if (Array.isArray((payload as any).activities)) return (payload as any).activities;
    } catch (error) {
      console.warn(`[audit-logs] Falha ao obter ${url}`, error);
    }
  }
  return [];
}

function coerce(items: any[]): LogRow[] {
  return items
    .map((item, index) => ({
      id: String(item?.id ?? index),
      when: item?.when ?? item?.createdAt ?? item?.timestamp ?? new Date().toISOString(),
      action: String(item?.action ?? item?.type ?? item?.event ?? "—"),
      actor:
        item?.actor?.name ??
        item?.user?.name ??
        item?.userName ??
        item?.actorName ??
        item?.by ??
        undefined,
      target:
        item?.target?.name ??
        item?.subject?.name ??
        item?.entity ??
        item?.target ??
        undefined,
      ip: item?.ip ?? item?.ipAddress ?? undefined,
      meta: item?.meta ?? item?.details ?? item?.data ?? undefined,
    }))
    .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
}

function metaToText(meta: LogRow["meta"]) {
  if (meta == null) return "—";
  if (typeof meta === "string") return meta;
  try {
    return JSON.stringify(meta, null, 2);
  } catch {
    return String(meta);
  }
}

function StatusPill({ state, label }: { state: StatusState; label: string }) {
  return <span className="status-pill" data-state={state}>{label}</span>;
}

export default function AuditLogsClient() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFirstOk(ENDPOINTS);
      setRows(coerce(data));
      setLastUpdated(new Date());
    } catch (err) {
      console.error("[audit-logs] load failed", err);
      setError("Não foi possível carregar os logs.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => {
      const haystack = [
        row.action,
        row.actor,
        row.target,
        row.ip,
        metaToText(row.meta),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [rows, query]);

  const statusLabel = useMemo(() => {
    if (loading) return "A sincronizar…";
    if (error) return error;
    if (filteredRows.length === 0) return "Sem registos visíveis";
    return `${filteredRows.length} registos`;
  }, [filteredRows.length, loading, error]);

  const statusState: StatusState = loading ? 'warn' : error ? 'down' : 'ok';

  return (
    <section className="space-y-6 px-4 py-6 md:px-8 lg:px-12">
      <header className="neo-panel neo-panel--header">
        <div className="space-y-2">
          <span className="caps-tag">Registos do sistema</span>
          <h1 className="heading-solid text-3xl font-extrabold leading-tight">
            Logs de auditoria
          </h1>
          <p className="text-sm text-muted max-w-2xl">
            Monitoriza alterações críticas na plataforma e mantém um trilho de evidências completo para fins de conformidade.
          </p>
          {lastUpdated && (
            <span className="text-xs text-muted">
              Última sincronização: {formatDate(lastUpdated.toISOString())}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill state={statusState} label={statusLabel} />
          <button
            type="button"
            className="btn ghost"
            onClick={() => load()}
            disabled={loading}
          >
            {loading ? 'A actualizar…' : 'Actualizar'}
          </button>
        </div>
      </header>

      <div className="neo-panel space-y-4" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            type="search"
            className="neo-field max-w-xl"
            placeholder="Filtrar por ação, utilizador, IP ou detalhe"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Filtrar logs"
          />
          <span className="text-sm text-muted" aria-live="polite">{statusLabel}</span>
        </div>

        <div className="table-responsive">
          <table className="table table--logs">
            <thead>
              <tr>
                <th>Quando</th>
                <th>Ação</th>
                <th>Utilizador</th>
                <th>Alvo</th>
                <th>IP</th>
                <th>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted">
                    A carregar registos…
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-danger">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted">
                    Sem registos para o filtro aplicado.
                  </td>
                </tr>
              )}

              {!loading && !error && filteredRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 align-top text-muted">{formatDate(row.when)}</td>
                  <td className="px-4 py-3 align-top font-semibold text-fg">{row.action}</td>
                  <td className="px-4 py-3 align-top text-fg">{row.actor ?? '—'}</td>
                  <td className="px-4 py-3 align-top text-fg">{row.target ?? '—'}</td>
                  <td className="px-4 py-3 align-top text-muted">{row.ip ?? '—'}</td>
                  <td className="px-4 py-3 align-top">
                    <code>{metaToText(row.meta)}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
