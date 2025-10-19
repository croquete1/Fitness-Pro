"use client";

import * as React from "react";
import Button from "@/components/ui/Button";
import LineChart, { type DataPoint } from "@/components/dashboard/LineChart";
import type { MeasurementRecord, ReportsData, TrainerSessionRecord } from "@/lib/reports/types";

const PERIOD_OPTIONS = [
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
  { value: "180", label: "Últimos 6 meses" },
  { value: "365", label: "Últimos 12 meses" },
] as const;

type MetricCard = {
  key: string;
  label: string;
  value: string;
  hint?: string;
  delta?: number | null;
  tone?: "primary" | "positive" | "warning" | "neutral";
};

type SessionKind = "completed" | "cancelled" | "upcoming";

type Props = {
  data: ReportsData;
  supabase: boolean;
  viewerName?: string | null;
};

const relativeFormatter = new Intl.RelativeTimeFormat("pt-PT", { numeric: "auto" });
const dayFormatter = new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short" });
const fullDateFormatter = new Intl.DateTimeFormat("pt-PT", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function safeDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function sessionKind(status: string | null | undefined): SessionKind {
  const normalized = (status ?? "").toLowerCase();
  if (!normalized) return "upcoming";
  if (/(cancel|falt|aus|no[_-]?show)/.test(normalized)) return "cancelled";
  if (/(complete|concl|done|finished|success)/.test(normalized)) return "completed";
  return "upcoming";
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number, fractionDigits = 0) {
  return new Intl.NumberFormat("pt-PT", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}

function formatPercentage(value: number, fractionDigits = 1) {
  return `${formatNumber(value, fractionDigits)}%`;
}

function differenceInDays(later: Date, earlier: Date) {
  const diffMs = later.getTime() - earlier.getTime();
  return Math.round(diffMs / 86_400_000);
}

function formatRelative(target: Date | null, base: Date) {
  if (!target) return "—";
  const diffDays = differenceInDays(target, base);
  if (Math.abs(diffDays) < 1) {
    const diffHours = Math.round((target.getTime() - base.getTime()) / 3_600_000);
    if (Math.abs(diffHours) < 1) {
      const diffMinutes = Math.round((target.getTime() - base.getTime()) / 60_000);
      return relativeFormatter.format(diffMinutes, "minute");
    }
    return relativeFormatter.format(diffHours, "hour");
  }
  return relativeFormatter.format(diffDays, "day");
}

function downloadCSV(rows: string[][], filename: string) {
  if (rows.length === 0) return;
  const csv = rows
    .map((columns) =>
      columns
        .map((value) => {
          const safe = value ?? "";
          if (/[",\n]/.test(safe)) {
            return `"${safe.replace(/"/g, '""')}"`;
          }
          return safe;
        })
        .join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function calcDelta(current: number, previous: number | null | undefined) {
  if (previous == null || previous === 0) return null;
  const delta = ((current - previous) / previous) * 100;
  if (!Number.isFinite(delta)) return null;
  return delta;
}

function calcAverage(values: number[]) {
  if (!values.length) return null;
  const sum = values.reduce((acc, item) => acc + item, 0);
  return sum / values.length;
}

function ensureClientName(
  id: string,
  fallback: string | null | undefined,
  lookup: ReportsData["meta"]["clients"],
) {
  const match = lookup.find((item) => item.id === id);
  if (match) return match.name;
  if (fallback && fallback.trim()) return fallback;
  return "Cliente";
}

export default function ReportsDashboardClient({ data, supabase, viewerName }: Props) {
  const [period, setPeriod] = React.useState<string>(PERIOD_OPTIONS[1].value);
  const [focusTrainer, setFocusTrainer] = React.useState<string>("all");
  const [focusClient, setFocusClient] = React.useState<string>("all");

  const generatedAt = React.useMemo(() => safeDate(data.meta.generatedAt) ?? new Date(), [data.meta.generatedAt]);

  const [rangeStart, rangeEnd] = React.useMemo(() => {
    const days = Number(period) || 90;
    const end = new Date(generatedAt);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));
    return [start, end] as const;
  }, [generatedAt, period]);

  const previousRangeTotals = React.useMemo(() => {
    const durationMs = rangeEnd.getTime() - rangeStart.getTime();
    const prevEnd = new Date(rangeStart.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - durationMs);
    return { start: prevStart, end: prevEnd } as const;
  }, [rangeStart, rangeEnd]);

  const measurementByClient = React.useMemo(() => {
    const map = new Map<string, MeasurementRecord[]>();
    data.measurements.forEach((measurement) => {
      const entries = map.get(measurement.userId) ?? [];
      entries.push(measurement);
      map.set(measurement.userId, entries);
    });
    map.forEach((entries, key) => {
      entries.sort((a, b) => {
        const da = safeDate(a.measuredAt)?.getTime() ?? 0;
        const db = safeDate(b.measuredAt)?.getTime() ?? 0;
        return db - da;
      });
      map.set(key, entries);
    });
    return map;
  }, [data.measurements]);

  const filteredFinancialEntries = React.useMemo(() => {
    return data.financial.entries.filter((entry) => {
      const date = safeDate(entry.date);
      if (!date) return false;
      if (date < rangeStart || date > rangeEnd) return false;
      if (focusClient !== "all" && entry.userId !== focusClient) return false;
      return true;
    });
  }, [data.financial.entries, focusClient, rangeEnd, rangeStart]);

  const previousFinancialTotal = React.useMemo(() => {
    return data.financial.entries.reduce((acc, entry) => {
      const date = safeDate(entry.date);
      if (!date) return acc;
      if (date < previousRangeTotals.start || date > previousRangeTotals.end) return acc;
      if (focusClient !== "all" && entry.userId !== focusClient) return acc;
      return acc + entry.amount;
    }, 0);
  }, [data.financial.entries, focusClient, previousRangeTotals.end, previousRangeTotals.start]);

  const filteredSessions = React.useMemo(() => {
    return data.trainerSessions.filter((session) => {
      const date = safeDate(session.startedAt) ?? safeDate(session.endedAt);
      if (!date) return false;
      if (date < rangeStart || date > rangeEnd) return false;
      if (focusTrainer !== "all" && session.trainerId !== focusTrainer) return false;
      if (focusClient !== "all" && session.clientId !== focusClient) return false;
      return true;
    });
  }, [data.trainerSessions, focusClient, focusTrainer, rangeEnd, rangeStart]);

  const outstandingTotal = React.useMemo(() => {
    return data.financial.balances.reduce((acc, balance) => {
      if (focusClient !== "all" && balance.userId !== focusClient) return acc;
      const value = typeof balance.balance === "number" ? balance.balance : Number(balance.balance ?? 0);
      if (Number.isNaN(value) || value >= 0) return acc;
      return acc + Math.abs(value);
    }, 0);
  }, [data.financial.balances, focusClient]);

  const revenueTotal = React.useMemo(
    () => filteredFinancialEntries.reduce((acc, entry) => acc + entry.amount, 0),
    [filteredFinancialEntries],
  );

  const revenueDelta = React.useMemo(() => calcDelta(revenueTotal, previousFinancialTotal), [revenueTotal, previousFinancialTotal]);

  const revenueSeries = React.useMemo<DataPoint[]>(() => {
    const aggregate = new Map<string, { total: number; date: Date }>();
    filteredFinancialEntries.forEach((entry) => {
      const date = safeDate(entry.date);
      if (!date) return;
      const key = date.toISOString().slice(0, 10);
      const current = aggregate.get(key) ?? { total: 0, date };
      aggregate.set(key, { total: current.total + entry.amount, date: current.date });
    });
    return Array.from(aggregate.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((item) => ({ name: dayFormatter.format(item.date), value: Math.round(item.total) }));
  }, [filteredFinancialEntries]);

  const sessionStats = React.useMemo(() => {
    const counts: Record<SessionKind, number> = { completed: 0, cancelled: 0, upcoming: 0 };
    const durations: number[] = [];
    const trainers = new Set<string>();
    const clients = new Set<string>();
    filteredSessions.forEach((session) => {
      const kind = sessionKind(session.status);
      counts[kind] += 1;
      if (session.durationMin != null && Number.isFinite(Number(session.durationMin))) {
        durations.push(Number(session.durationMin));
      }
      if (session.trainerId) trainers.add(session.trainerId);
      if (session.clientId) clients.add(session.clientId);
    });
    const total = counts.completed + counts.cancelled + counts.upcoming;
    const completionRate = total > 0 ? (counts.completed / total) * 100 : 0;
    return {
      counts,
      total,
      completionRate,
      averageDuration: calcAverage(durations),
      trainers: trainers.size,
      clients: clients.size,
    };
  }, [filteredSessions]);

  const measurementCoverage = React.useMemo(() => {
    const relevantClients = new Set<string>();
    const measuredClients = new Set<string>();
    const baseList = focusClient !== "all" && focusClient ? [focusClient] : data.meta.clients.map((client) => client.id);
    data.measurements.forEach((measurement) => {
      if (focusClient !== "all" && measurement.userId !== focusClient) return;
      relevantClients.add(measurement.userId);
      const date = safeDate(measurement.measuredAt);
      if (!date) return;
      if (date < rangeStart || date > rangeEnd) return;
      measuredClients.add(measurement.userId);
    });
    const totalBase = baseList.length || relevantClients.size || data.meta.clients.length;
    const coverage = totalBase > 0 ? (measuredClients.size / totalBase) * 100 : 0;
    return { coverage, measured: measuredClients.size, base: totalBase };
  }, [data.measurements, data.meta.clients, focusClient, rangeEnd, rangeStart]);

  const measurementRecencyDays = React.useMemo(() => {
    const compute = (clientId: string) => {
      const series = measurementByClient.get(clientId);
      if (!series?.length) return null;
      const latest = safeDate(series[0].measuredAt);
      if (!latest) return null;
      return Math.max(0, differenceInDays(generatedAt, latest));
    };
    if (focusClient !== "all" && focusClient) {
      return compute(focusClient);
    }
    let best: number | null = null;
    measurementByClient.forEach((_, clientId) => {
      const diff = compute(clientId);
      if (diff == null) return;
      if (best == null || diff < best) {
        best = diff;
      }
    });
    return best;
  }, [focusClient, generatedAt, measurementByClient]);

  const trainerLeaderboard = React.useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        total: number;
        completed: number;
        cancelled: number;
        upcoming: number;
        clients: Set<string>;
        durations: number[];
      }
    >();

    const ensureTrainer = (session: TrainerSessionRecord) => {
      const id = session.trainerId ?? "sem_treinador";
      const name = session.trainerName?.trim() || "Sem treinador";
      const current = map.get(id);
      if (current) return current;
      const created = {
        id,
        name,
        total: 0,
        completed: 0,
        cancelled: 0,
        upcoming: 0,
        clients: new Set<string>(),
        durations: [] as number[],
      };
      map.set(id, created);
      return created;
    };

    filteredSessions.forEach((session) => {
      const bucket = ensureTrainer(session);
      bucket.total += 1;
      bucket.clients.add(session.clientId ?? "");
      const kind = sessionKind(session.status);
      bucket[kind] += 1;
      if (session.durationMin != null && Number.isFinite(Number(session.durationMin))) {
        bucket.durations.push(Number(session.durationMin));
      }
    });

    return Array.from(map.values())
      .map((item) => ({
        id: item.id,
        name: item.name,
        total: item.total,
        completed: item.completed,
        cancelled: item.cancelled,
        upcoming: item.upcoming,
        completionRate: item.total > 0 ? (item.completed / item.total) * 100 : 0,
        clients: item.clients.size,
        averageDuration: calcAverage(item.durations),
      }))
      .filter((item) => item.total > 0)
      .sort((a, b) => b.completed - a.completed || b.total - a.total)
      .slice(0, 6);
  }, [filteredSessions]);

  const clientSummaries = React.useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        revenue: number;
        outstanding: number;
        sessions: number;
        completed: number;
        cancelled: number;
        lastMeasurement: string | null;
        weightDelta: number | null;
        fatDelta: number | null;
      }
    >();

    const ensureClient = (id: string, fallbackName: string | null | undefined) => {
      const existing = map.get(id);
      if (existing) return existing;
      const name = ensureClientName(id, fallbackName, data.meta.clients);
      const created = {
        id,
        name,
        revenue: 0,
        outstanding: 0,
        sessions: 0,
        completed: 0,
        cancelled: 0,
        lastMeasurement: null as string | null,
        weightDelta: null as number | null,
        fatDelta: null as number | null,
      };
      map.set(id, created);
      return created;
    };

    filteredFinancialEntries.forEach((entry) => {
      const bucket = ensureClient(entry.userId, entry.userName);
      bucket.revenue += entry.amount;
    });

    filteredSessions.forEach((session) => {
      if (!session.clientId) return;
      const bucket = ensureClient(session.clientId, session.clientName);
      bucket.sessions += 1;
      const kind = sessionKind(session.status);
      if (kind === "completed") bucket.completed += 1;
      if (kind === "cancelled") bucket.cancelled += 1;
    });

    data.financial.balances.forEach((balance) => {
      if (focusClient !== "all" && balance.userId !== focusClient) return;
      const bucket = ensureClient(balance.userId, balance.userName);
      const value = typeof balance.balance === "number" ? balance.balance : Number(balance.balance ?? 0);
      if (!Number.isNaN(value) && value < 0) {
        bucket.outstanding += Math.abs(value);
      }
    });

    measurementByClient.forEach((records, clientId) => {
      if (focusClient !== "all" && clientId !== focusClient) return;
      const bucket = ensureClient(clientId, records[0]?.userName ?? null);
      const latest = records[0];
      const previous = records.find((_, index) => index > 0 && records[index]?.weightKg != null);
      bucket.lastMeasurement = latest?.measuredAt ?? null;
      if (latest?.weightKg != null && previous?.weightKg != null) {
        bucket.weightDelta = Number((latest.weightKg - previous.weightKg).toFixed(1));
      }
      if (latest?.bodyFatPct != null && previous?.bodyFatPct != null) {
        bucket.fatDelta = Number((latest.bodyFatPct - previous.bodyFatPct).toFixed(1));
      }
    });

    return Array.from(map.values())
      .filter((item) => (focusClient === "all" ? true : item.id === focusClient))
      .sort((a, b) => b.revenue - a.revenue || b.outstanding - a.outstanding)
      .slice(0, 6);
  }, [
    data.meta.clients,
    data.financial.balances,
    filteredFinancialEntries,
    filteredSessions,
    focusClient,
    measurementByClient,
  ]);

  const selectedClientId = React.useMemo(() => {
    if (focusClient !== "all" && focusClient) return focusClient;
    if (clientSummaries.length > 0) return clientSummaries[0].id;
    if (data.meta.clients.length > 0) return data.meta.clients[0].id;
    if (data.measurements.length > 0) return data.measurements[0].userId;
    return null;
  }, [clientSummaries, data.meta.clients, data.measurements, focusClient]);

  const measurementSeries = React.useMemo<DataPoint[]>(() => {
    if (!selectedClientId) return [];
    const records = measurementByClient.get(selectedClientId);
    if (!records?.length) return [];
    return [...records]
      .map((record) => ({
        date: safeDate(record.measuredAt),
        weight: record.weightKg,
      }))
      .filter((item) => item.date && typeof item.weight === "number")
      .sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0))
      .map((item) => ({
        name: dayFormatter.format(item.date as Date),
        value: Number((item.weight ?? 0).toFixed(1)),
      }));
  }, [measurementByClient, selectedClientId]);

  const measurementSummary = React.useMemo(() => {
    if (!selectedClientId) return null;
    const records = measurementByClient.get(selectedClientId);
    if (!records?.length) return null;
    const latest = records[0];
    const previous = records.find((_, index) => index > 0 && records[index]?.weightKg != null);
    const latestDate = safeDate(latest.measuredAt);
    const weightDelta =
      latest?.weightKg != null && previous?.weightKg != null
        ? Number((latest.weightKg - previous.weightKg).toFixed(1))
        : null;
    const fatDelta =
      latest?.bodyFatPct != null && previous?.bodyFatPct != null
        ? Number((latest.bodyFatPct - previous.bodyFatPct).toFixed(1))
        : null;
    return {
      latest,
      latestDate,
      weightDelta,
      fatDelta,
    };
  }, [measurementByClient, selectedClientId]);

  const currency = data.financial.currency || "EUR";

  const metricCards = React.useMemo<MetricCard[]>(() => {
    return [
      {
        key: "revenue",
        label: "Receita no período",
        value: formatCurrency(revenueTotal, currency),
        hint:
          revenueDelta == null
            ? "Sem histórico para comparar"
            : `${revenueDelta >= 0 ? "▲" : "▼"} ${formatPercentage(Math.abs(revenueDelta))} vs. período anterior`,
        delta: revenueDelta,
        tone: "primary",
      },
      {
        key: "outstanding",
        label: "Em aberto",
        value: formatCurrency(outstandingTotal, currency),
        hint: outstandingTotal > 0 ? "Clientes com saldo negativo" : "Nenhuma dívida registada",
        tone: outstandingTotal > 0 ? "warning" : "positive",
      },
      {
        key: "completion",
        label: "Taxa de conclusão",
        value: formatPercentage(sessionStats.completionRate),
        hint:
          sessionStats.total > 0
            ? `${formatNumber(sessionStats.counts.completed)} concluídas de ${formatNumber(sessionStats.total)} sessões`
            : "Sem sessões no período",
        tone: sessionStats.completionRate >= 80 ? "positive" : sessionStats.completionRate >= 60 ? "neutral" : "warning",
      },
      {
        key: "coverage",
        label: "Cobertura de avaliações",
        value: formatPercentage(measurementCoverage.coverage),
        hint:
          measurementCoverage.base > 0
            ? `${measurementCoverage.measured} de ${measurementCoverage.base} clientes avaliados`
            : "Sem clientes com medições",
        tone: measurementCoverage.coverage >= 70 ? "positive" : measurementCoverage.coverage >= 40 ? "neutral" : "warning",
      },
    ];
  }, [currency, measurementCoverage, outstandingTotal, revenueDelta, revenueTotal, sessionStats]);

  const periodLabel = React.useMemo(() => {
    const startLabel = dayFormatter.format(rangeStart);
    const endLabel = dayFormatter.format(rangeEnd);
    return `${startLabel} – ${endLabel}`;
  }, [rangeEnd, rangeStart]);

  const handleExport = React.useCallback(() => {
    const rows: string[][] = [["Data", "Cliente", "Valor", "Descrição"]];
    filteredFinancialEntries.forEach((entry) => {
      const date = safeDate(entry.date);
      rows.push([
        date ? fullDateFormatter.format(date) : "—",
        entry.userName || entry.userId,
        formatCurrency(entry.amount, currency),
        entry.description ?? "—",
      ]);
    });
    const safeLabel = periodLabel.replace(/[\s–—]+/g, "-").replace(/-+/g, "-");
    downloadCSV(rows, `relatorio-financeiro-${safeLabel}.csv`);
  }, [currency, filteredFinancialEntries, periodLabel]);

  return (
    <div className="reports-dashboard">
      <section className="neo-panel reports-dashboard__panel" aria-labelledby="reports-heading">
        <header className="reports-dashboard__header">
          <div className="reports-dashboard__heading">
            <h1 id="reports-heading" className="reports-dashboard__title">
              Relatórios &amp; insights
            </h1>
            <p className="reports-dashboard__subtitle">
              {viewerName ? `Olá, ${viewerName}. ` : null}
              Monitorizamos receitas, sessões e avaliações em tempo real.
            </p>
          </div>
          <div className="reports-dashboard__meta">
            <span className="reports-dashboard__supabase" data-online={supabase || undefined}>
              {supabase ? "Dados ao vivo via Supabase" : "Dataset de exemplo offline"}
            </span>
            <span className="reports-dashboard__generated">Actualizado {formatRelative(generatedAt, new Date())}.</span>
          </div>
        </header>

        <div className="reports-dashboard__filters" role="group" aria-label="Filtros do relatório">
          <div className="neo-segmented reports-dashboard__period" role="radiogroup" aria-label="Período analisado">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className="neo-segmented__item"
                data-active={period === option.value || undefined}
                onClick={() => setPeriod(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <label className="neo-input-group reports-dashboard__select">
            <span className="neo-input-group__label">Treinador</span>
            <select value={focusTrainer} onChange={(event) => setFocusTrainer(event.target.value)}>
              <option value="all">Todos</option>
              {data.meta.trainers.map((trainer) => (
                <option key={trainer.id} value={trainer.id}>
                  {trainer.name}
                </option>
              ))}
            </select>
          </label>
          <label className="neo-input-group reports-dashboard__select">
            <span className="neo-input-group__label">Cliente</span>
            <select value={focusClient} onChange={(event) => setFocusClient(event.target.value)}>
              <option value="all">Todos</option>
              {data.meta.clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="reports-dashboard__summary">
          <span className="reports-dashboard__periodLabel">{periodLabel}</span>
          {measurementRecencyDays != null ? (
            <span className="reports-dashboard__recency">Última avaliação registada há {measurementRecencyDays} dias</span>
          ) : (
            <span className="reports-dashboard__recency">Sem avaliações recentes</span>
          )}
        </div>

        <div className="reports-dashboard__metrics neo-grid neo-grid--metricsSm">
          {metricCards.map((card) => (
            <article
              key={card.key}
              className="neo-surface neo-surface--padded reports-dashboard__metric"
              data-tone={card.tone ?? "neutral"}
            >
              <header className="reports-dashboard__metricHeader">
                <span className="reports-dashboard__metricLabel">{card.label}</span>
                {card.delta != null ? (
                  <span
                    className="reports-dashboard__metricDelta"
                    data-positive={card.delta >= 0 || undefined}
                    data-negative={card.delta < 0 || undefined}
                  >
                    {card.delta >= 0 ? "▲" : "▼"} {formatPercentage(Math.abs(card.delta))}
                  </span>
                ) : null}
              </header>
              <div className="reports-dashboard__metricValue">{card.value}</div>
              {card.hint ? <p className="reports-dashboard__metricHint">{card.hint}</p> : null}
            </article>
          ))}
        </div>

        <div className="reports-dashboard__insights neo-grid neo-grid--auto">
          <section className="neo-surface neo-surface--padded reports-dashboard__card" aria-label="Receita e entradas">
            <header className="reports-dashboard__sectionHeader">
              <div>
                <h2 className="reports-dashboard__sectionTitle">Receita consolidada</h2>
                <p className="reports-dashboard__sectionSubtitle">
                  Evolução diária das entradas financeiras para o período seleccionado.
                </p>
              </div>
              <Button variant="secondary" onClick={handleExport}>
                Exportar CSV
              </Button>
            </header>
            {revenueSeries.length > 0 ? (
              <LineChart data={revenueSeries} height={280} />
            ) : (
              <p className="reports-dashboard__empty">Sem entradas financeiras no período.</p>
            )}
          </section>

          <section className="neo-surface neo-surface--padded reports-dashboard__card" aria-label="Performance das sessões">
            <header className="reports-dashboard__sectionHeader">
              <div>
                <h2 className="reports-dashboard__sectionTitle">Sessões e equipa</h2>
                <p className="reports-dashboard__sectionSubtitle">
                  Acompanhamento da produtividade dos treinadores e estados das sessões.
                </p>
              </div>
              <span className="reports-dashboard__badge">{sessionStats.trainers} treinadores activos</span>
            </header>
            <dl className="reports-dashboard__stats">
              <div>
                <dt>Total de sessões</dt>
                <dd>{formatNumber(sessionStats.total)}</dd>
              </div>
              <div>
                <dt>Concluídas</dt>
                <dd>{formatNumber(sessionStats.counts.completed)}</dd>
              </div>
              <div>
                <dt>Canceladas</dt>
                <dd>{formatNumber(sessionStats.counts.cancelled)}</dd>
              </div>
              <div>
                <dt>Agendadas</dt>
                <dd>{formatNumber(sessionStats.counts.upcoming)}</dd>
              </div>
              <div>
                <dt>Duração média</dt>
                <dd>{sessionStats.averageDuration ? `${formatNumber(sessionStats.averageDuration, 1)} min` : "—"}</dd>
              </div>
              <div>
                <dt>Clientes acompanhados</dt>
                <dd>{formatNumber(sessionStats.clients)}</dd>
              </div>
            </dl>
            <div className="reports-dashboard__tableWrapper" role="region" aria-label="Ranking de treinadores">
              <table className="reports-dashboard__table">
                <thead>
                  <tr>
                    <th>Treinador</th>
                    <th>Total</th>
                    <th>Concluídas</th>
                    <th>Canceladas</th>
                    <th>Clientes</th>
                    <th>Taxa</th>
                  </tr>
                </thead>
                <tbody>
                  {trainerLeaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="reports-dashboard__empty">
                        Sem sessões registadas no período.
                      </td>
                    </tr>
                  ) : (
                    trainerLeaderboard.map((trainer) => (
                      <tr key={trainer.id}>
                        <td>{trainer.name}</td>
                        <td>{formatNumber(trainer.total)}</td>
                        <td>{formatNumber(trainer.completed)}</td>
                        <td>{formatNumber(trainer.cancelled)}</td>
                        <td>{formatNumber(trainer.clients)}</td>
                        <td>{formatPercentage(trainer.completionRate)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="neo-surface neo-surface--padded reports-dashboard__card" aria-label="Clientes e receitas">
            <header className="reports-dashboard__sectionHeader">
              <div>
                <h2 className="reports-dashboard__sectionTitle">Clientes em destaque</h2>
                <p className="reports-dashboard__sectionSubtitle">
                  Combinação de receita, sessões realizadas e avaliações recentes.
                </p>
              </div>
            </header>
            <div className="reports-dashboard__tableWrapper" role="region" aria-label="Resumo por cliente">
              <table className="reports-dashboard__table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Receita</th>
                    <th>Em aberto</th>
                    <th>Sessões</th>
                    <th>Última avaliação</th>
                    <th>Peso Δ</th>
                    <th>Gordura Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {clientSummaries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="reports-dashboard__empty">
                        Sem dados para apresentar.
                      </td>
                    </tr>
                  ) : (
                    clientSummaries.map((client) => {
                      const lastDate = safeDate(client.lastMeasurement);
                      return (
                        <tr key={client.id}>
                          <td>{client.name}</td>
                          <td>{formatCurrency(client.revenue, currency)}</td>
                          <td>{formatCurrency(client.outstanding, currency)}</td>
                          <td>
                            {formatNumber(client.sessions)}
                            <span className="reports-dashboard__tableHint">
                              {client.sessions > 0
                                ? `${formatNumber(client.completed)} concluídas`
                                : "—"}
                            </span>
                          </td>
                          <td>{lastDate ? fullDateFormatter.format(lastDate) : "—"}</td>
                          <td>{client.weightDelta != null ? `${client.weightDelta.toFixed(1)} kg` : "—"}</td>
                          <td>{client.fatDelta != null ? `${client.fatDelta.toFixed(1)}%` : "—"}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="neo-surface neo-surface--padded reports-dashboard__card" aria-label="Evolução das avaliações corporais">
            <header className="reports-dashboard__sectionHeader">
              <div>
                <h2 className="reports-dashboard__sectionTitle">Avaliações corporais</h2>
                <p className="reports-dashboard__sectionSubtitle">
                  Selecione um cliente para acompanhar tendências de peso e composição.
                </p>
              </div>
              {selectedClientId ? (
                <span className="reports-dashboard__badge">
                  {ensureClientName(selectedClientId, null, data.meta.clients)}
                </span>
              ) : null}
            </header>
            {measurementSeries.length > 0 ? (
              <LineChart data={measurementSeries} height={260} />
            ) : (
              <p className="reports-dashboard__empty">Sem avaliações para apresentar.</p>
            )}
            {measurementSummary ? (
              <dl className="reports-dashboard__measurementSummary">
                <div>
                  <dt>Última medição</dt>
                  <dd>{measurementSummary.latestDate ? fullDateFormatter.format(measurementSummary.latestDate) : "—"}</dd>
                </div>
                <div>
                  <dt>Peso actual</dt>
                  <dd>
                    {measurementSummary.latest.weightKg != null
                      ? `${formatNumber(measurementSummary.latest.weightKg, 1)} kg`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt>Δ peso</dt>
                  <dd>
                    {measurementSummary.weightDelta != null
                      ? `${measurementSummary.weightDelta >= 0 ? "+" : ""}${measurementSummary.weightDelta.toFixed(1)} kg`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt>Δ gordura</dt>
                  <dd>
                    {measurementSummary.fatDelta != null
                      ? `${measurementSummary.fatDelta >= 0 ? "+" : ""}${measurementSummary.fatDelta.toFixed(1)}%`
                      : "—"}
                  </dd>
                </div>
              </dl>
            ) : null}
          </section>
        </div>
      </section>
    </div>
  );
}
