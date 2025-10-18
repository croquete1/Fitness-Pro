"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import LineChart from "@/components/dashboard/LineChart";
import type { ReportsData } from "@/lib/reports/types";

const PERIOD_OPTIONS = [
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
  { value: "180", label: "Últimos 6 meses" },
  { value: "365", label: "Últimos 12 meses" },
];

type Props = {
  data: ReportsData;
  supabase: boolean;
  viewerName?: string | null;
};

type MonthlyPoint = { name: string; value: number };

type TrainerSummary = {
  trainerId: string;
  trainerName: string;
  total: number;
  completed: number;
  cancelled: number;
  upcoming: number;
  duration: number;
};

type ProgressDelta = {
  clientId: string;
  clientName: string;
  delta: number;
};

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("pt-PT", { month: "short", year: "2-digit" }).format(date);
}

function formatDayLabel(date: Date): string {
  return new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short" }).format(date);
}

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

function statusKind(value: string | null | undefined): "completed" | "cancelled" | "upcoming" {
  const status = (value ?? "").toLowerCase();
  if (!status) return "upcoming";
  if (status.includes("cancel")) return "cancelled";
  if (status.includes("no_show") || status.includes("no-show")) return "cancelled";
  if (status.includes("falt") || status.includes("aus")) return "cancelled";
  if (status.includes("done") || status.includes("complet") || status.includes("concl")) return "completed";
  if (status.includes("finished")) return "completed";
  return "upcoming";
}

function downloadCSV(rows: string[][], filename: string) {
  if (rows.length === 0) return;
  const csv = rows
    .map((cols) =>
      cols
        .map((value) => {
          const safe = value ?? "";
          if (/[",\n]/.test(safe)) {
            return `"${safe.replace(/"/g, '""')}"`;
          }
          return safe;
        })
        .join(",")
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

export default function ReportsDashboardClient({ data, supabase, viewerName }: Props) {
  const [period, setPeriod] = useState<string>("90");
  const [focusTrainer, setFocusTrainer] = useState<string>("");
  const [focusClient, setFocusClient] = useState<string>("");

  const generatedAt = useMemo(() => toDate(data.meta.generatedAt) ?? new Date(), [data.meta.generatedAt]);

  const [startRange, endRange] = useMemo(() => {
    const end = new Date(generatedAt);
    const start = new Date(end);
    start.setDate(start.getDate() - Number(period));
    return [start, end] as const;
  }, [generatedAt, period]);

  const currency = data.financial.currency || "EUR";

  const filteredFinancialEntries = useMemo(() => {
    return data.financial.entries.filter((entry) => {
      if (focusClient && entry.userId !== focusClient) return false;
      const date = toDate(entry.date);
      if (!date) return false;
      return date >= startRange && date <= endRange;
    });
  }, [data.financial.entries, focusClient, startRange, endRange]);

  const financialSeries: MonthlyPoint[] = useMemo(() => {
    const aggregate = new Map<string, { total: number; date: Date }>();
    filteredFinancialEntries.forEach((entry) => {
      const date = toDate(entry.date);
      if (!date) return;
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const current = aggregate.get(key) ?? { total: 0, date };
      aggregate.set(key, { total: current.total + entry.amount, date: current.date });
    });
    return Array.from(aggregate.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((item) => ({ name: formatMonthLabel(item.date), value: Math.round(item.total) }));
  }, [filteredFinancialEntries]);

  const totalRevenue = useMemo(
    () => filteredFinancialEntries.reduce((acc, entry) => acc + entry.amount, 0),
    [filteredFinancialEntries]
  );

  const topClients = useMemo(() => {
    const totals = new Map<string, { name: string; total: number }>();
    filteredFinancialEntries.forEach((entry) => {
      const current = totals.get(entry.userId) ?? { name: entry.userName, total: 0 };
      totals.set(entry.userId, { name: current.name || entry.userName, total: current.total + entry.amount });
    });
    return Array.from(totals.entries())
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filteredFinancialEntries]);

  const outstandingBalances = useMemo(() => {
    return data.financial.balances.filter((balance) => {
      if (focusClient && balance.userId !== focusClient) return false;
      return (balance.balance ?? 0) < 0;
    });
  }, [data.financial.balances, focusClient]);

  const pendingTotal = useMemo(
    () =>
      outstandingBalances.reduce((acc, balance) => {
        const pending = Math.abs(balance.balance ?? 0);
        return acc + pending;
      }, 0),
    [outstandingBalances]
  );

  const measurementByClient = useMemo(() => {
    const map = new Map<string, typeof data.measurements>();
    data.measurements.forEach((measurement) => {
      const arr = map.get(measurement.userId) ?? [];
      arr.push(measurement);
      map.set(measurement.userId, arr);
    });
    map.forEach((items, key) => {
      items.sort((a, b) => {
        const da = toDate(a.measuredAt)?.getTime() ?? 0;
        const db = toDate(b.measuredAt)?.getTime() ?? 0;
        return da - db;
      });
      map.set(key, items);
    });
    return map;
  }, [data.measurements]);

  const defaultClientId = useMemo(() => {
    if (focusClient) return focusClient;
    if (data.meta.clients.length > 0) return data.meta.clients[0].id;
    if (data.measurements.length > 0) return data.measurements[0].userId;
    return "";
  }, [focusClient, data.meta.clients, data.measurements]);

  const selectedClientSeries = useMemo(() => {
    if (!defaultClientId) return [] as MonthlyPoint[];
    const base = measurementByClient.get(defaultClientId) ?? [];
    const filtered = base.filter((measurement) => {
      const date = toDate(measurement.measuredAt);
      if (!date) return false;
      return date >= startRange && date <= endRange;
    });
    if (!filtered.length) return [];
    return filtered.map((measurement) => {
      const date = toDate(measurement.measuredAt)!;
      return {
        name: formatDayLabel(date),
        value: measurement.weightKg ?? 0,
      };
    });
  }, [defaultClientId, measurementByClient, startRange, endRange]);

  const progressLeaders: ProgressDelta[] = useMemo(() => {
    const deltas: ProgressDelta[] = [];
    measurementByClient.forEach((measurements, clientId) => {
      const filtered = measurements.filter((measurement) => {
        const date = toDate(measurement.measuredAt);
        if (!date) return false;
        return date >= startRange && date <= endRange;
      });
      if (filtered.length < 2) return;
      const first = filtered[0];
      const last = filtered[filtered.length - 1];
      const delta = (first.weightKg ?? 0) - (last.weightKg ?? 0);
      deltas.push({
        clientId,
        clientName: last.userName || first.userName || clientId,
        delta,
      });
    });
    return deltas.sort((a, b) => b.delta - a.delta).slice(0, 5);
  }, [measurementByClient, startRange, endRange]);

  const filteredSessions = useMemo(() => {
    return data.trainerSessions.filter((session) => {
      if (focusTrainer && session.trainerId !== focusTrainer) return false;
      if (focusClient && session.clientId && session.clientId !== focusClient) return false;
      const date = toDate(session.startedAt ?? session.endedAt ?? null) ?? toDate(session.startedAt) ?? toDate(session.endedAt);
      if (!date) return true;
      return date >= startRange && date <= endRange;
    });
  }, [data.trainerSessions, focusTrainer, focusClient, startRange, endRange]);

  const trainerSummaries: TrainerSummary[] = useMemo(() => {
    const map = new Map<string, TrainerSummary>();
    filteredSessions.forEach((session) => {
      const trainerId = session.trainerId ?? "sem-trainer";
      const trainerName = session.trainerName ?? trainerId;
      const summary =
        map.get(trainerId) ??
        ({
          trainerId,
          trainerName,
          total: 0,
          completed: 0,
          cancelled: 0,
          upcoming: 0,
          duration: 0,
        } as TrainerSummary);
      summary.total += 1;
      const kind = statusKind(session.status);
      if (kind === "completed") summary.completed += 1;
      if (kind === "cancelled") summary.cancelled += 1;
      if (kind === "upcoming") summary.upcoming += 1;
      summary.duration += session.durationMin ?? 0;
      map.set(trainerId, summary);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [filteredSessions]);

  const completionAverage = useMemo(() => {
    if (trainerSummaries.length === 0) return 0;
    const totalSessions = trainerSummaries.reduce((acc, trainer) => acc + trainer.total, 0);
    const totalCompleted = trainerSummaries.reduce((acc, trainer) => acc + trainer.completed, 0);
    if (!totalSessions) return 0;
    return (totalCompleted / totalSessions) * 100;
  }, [trainerSummaries]);

  const selectedClientName = useMemo(() => {
    if (!defaultClientId) return "";
    const found = data.meta.clients.find((client) => client.id === defaultClientId);
    if (found) return found.name;
    const measurement = data.measurements.find((item) => item.userId === defaultClientId);
    return measurement?.userName ?? defaultClientId;
  }, [defaultClientId, data.meta.clients, data.measurements]);

  const handleExportCSV = () => {
    const rows = [
      ["Data", "Descrição", "Cliente", "Valor"],
      ...filteredFinancialEntries.map((entry) => [
        toDate(entry.date) ? toDate(entry.date)!.toLocaleDateString("pt-PT") : "",
        entry.description ?? "",
        entry.userName,
        entry.amount.toFixed(2),
      ]),
    ];
    downloadCSV(rows, "relatorio-financeiro.csv");
  };

  const handlePrint = () => {
    if (typeof window === "undefined") return;
    window.print();
  };

  const handleResetFilters = () => {
    setPeriod("90");
    setFocusTrainer("");
    setFocusClient("");
  };

  const firstName = useMemo(() => {
    if (!viewerName) return null;
    const parts = viewerName.trim().split(/\s+/);
    return parts[0] ?? viewerName;
  }, [viewerName]);

  return (
    <section className="reports-dashboard neo-stack neo-stack--xl">
      <header className="neo-panel neo-panel--header reports-dashboard__hero">
        <div className="neo-stack neo-stack--sm">
          <span className="caps-tag">Relatórios</span>
          <h1 className="reports-dashboard__title heading-solid">Relatórios operacionais</h1>
          <p className="neo-text--sm neo-text--muted">
            Acompanhe faturamento, progresso dos clientes e desempenho dos Personal Trainers num único painel.
          </p>
        </div>
        <div className="reports-dashboard__meta neo-inline neo-inline--wrap neo-inline--sm">
          <span className="reports-dashboard__badge" data-state={supabase ? "live" : "demo"}>
            {supabase ? "Dados em tempo real via Supabase" : "Dados demonstrativos — configure o Supabase"}
          </span>
          {firstName && <span>Olá, {firstName}! 👋</span>}
          <span>
            Período analisado: {startRange.toLocaleDateString("pt-PT")} — {endRange.toLocaleDateString("pt-PT")}
          </span>
        </div>
      </header>

      <div className="reports-dashboard__layout">
        <aside className="reports-dashboard__filters neo-panel neo-panel--compact neo-stack neo-stack--lg" aria-label="Filtros do relatório">
          <div className="neo-input-group">
            <div className="neo-input-group__field">
              <label htmlFor="reports-period" className="neo-input-group__label">
                Período
              </label>
              <select
                id="reports-period"
                className="neo-input"
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
              >
                {PERIOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="neo-input-group">
            <div className="neo-input-group__field">
              <label htmlFor="reports-trainer" className="neo-input-group__label">
                Personal Trainer
              </label>
              <select
                id="reports-trainer"
                className="neo-input"
                value={focusTrainer}
                onChange={(event) => setFocusTrainer(event.target.value)}
              >
                <option value="">Todos os Personal Trainers</option>
                {data.meta.trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="neo-input-group">
            <div className="neo-input-group__field">
              <label htmlFor="reports-client" className="neo-input-group__label">
                Cliente
              </label>
              <select
                id="reports-client"
                className="neo-input"
                value={focusClient}
                onChange={(event) => setFocusClient(event.target.value)}
              >
                <option value="">Todos os clientes</option>
                {data.meta.clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="reports-dashboard__actions neo-stack neo-stack--xs">
            <div className="neo-inline neo-inline--wrap neo-inline--sm">
              <Button variant="secondary" size="sm" onClick={handleExportCSV}>
                Exportar CSV
              </Button>
              <Button variant="ghost" size="sm" onClick={handlePrint}>
                Exportar PDF
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={handleResetFilters} className="reports-dashboard__reset">
              Repor filtros
            </Button>
          </div>

          <p className="neo-text--xs neo-text--muted reports-dashboard__hint">
            Combine filtros para investigar situações específicas. A exportação respeita o período e os filtros activos.
          </p>
        </aside>

        <div className="neo-stack neo-stack--lg">
          <section className="neo-panel neo-stack neo-stack--lg" aria-labelledby="reports-financial-heading">
            <div className="neo-stack neo-stack--xs">
              <h2 id="reports-financial-heading" className="reports-dashboard__sectionTitle">
                Resumo financeiro
              </h2>
              <p className="neo-text--sm neo-text--muted">
                Volume faturado e pendências por cliente no período selecionado.
              </p>
            </div>

            <div className="reports-dashboard__metrics neo-grid">
              <article className="neo-surface neo-surface--padded reports-dashboard__metric" data-variant="primary">
                <span className="reports-dashboard__metricLabel">Faturamento no período</span>
                <span className="reports-dashboard__metricValue">{formatCurrency(totalRevenue, currency)}</span>
              </article>
              <article className="neo-surface neo-surface--padded reports-dashboard__metric" data-variant="success">
                <span className="reports-dashboard__metricLabel">Média mensal</span>
                <span className="reports-dashboard__metricValue">
                  {financialSeries.length
                    ? formatCurrency(totalRevenue / financialSeries.length, currency)
                    : formatCurrency(0, currency)}
                </span>
              </article>
              <article className="neo-surface neo-surface--padded reports-dashboard__metric" data-variant="warning">
                <span className="reports-dashboard__metricLabel">Pendências</span>
                <span className="reports-dashboard__metricValue">{formatCurrency(pendingTotal, currency)}</span>
              </article>
              <article className="neo-surface neo-surface--padded reports-dashboard__metric" data-variant="info">
                <span className="reports-dashboard__metricLabel">Registos analisados</span>
                <span className="reports-dashboard__metricValue">{filteredFinancialEntries.length}</span>
              </article>
            </div>

            <div>
              {financialSeries.length > 0 ? (
                <LineChart data={financialSeries} height={260} />
              ) : (
                <div className="neo-empty" role="status">
                  <span className="neo-empty__icon" aria-hidden="true">
                    📉
                  </span>
                  <p className="neo-empty__title">Sem movimentações financeiras</p>
                  <p className="neo-empty__description">
                    Ajuste o período ou os filtros para visualizar entradas com dados disponíveis.
                  </p>
                </div>
              )}
            </div>

            <div className="reports-dashboard__split neo-grid">
              <section className="neo-stack neo-stack--sm" aria-labelledby="reports-top-clients-heading">
                <h3 id="reports-top-clients-heading" className="reports-dashboard__listTitle">
                  Top clientes por faturamento
                </h3>
                <ul className="neo-stack neo-stack--sm" aria-live="polite">
                  {topClients.length > 0 ? (
                    topClients.map((client) => (
                      <li
                        key={client.id}
                        className="neo-surface neo-surface--compact reports-dashboard__listItem"
                        data-tone="neutral"
                      >
                        <span className="reports-dashboard__listName">{client.name}</span>
                        <span className="reports-dashboard__listValue">
                          {formatCurrency(client.total, currency)}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li>
                      <div className="neo-empty" role="status">
                        <span className="neo-empty__icon" aria-hidden="true">
                          👥
                        </span>
                        <p className="neo-empty__title">Sem faturamento</p>
                        <p className="neo-empty__description">
                          Ainda não existem clientes com vendas no período seleccionado.
                        </p>
                      </div>
                    </li>
                  )}
                </ul>
              </section>
              <section className="neo-stack neo-stack--sm" aria-labelledby="reports-outstanding-heading">
                <h3 id="reports-outstanding-heading" className="reports-dashboard__listTitle">
                  Pendências de pagamento
                </h3>
                <ul className="neo-stack neo-stack--sm" aria-live="polite">
                  {outstandingBalances.length > 0 ? (
                    outstandingBalances.map((balance) => (
                      <li
                        key={balance.userId}
                        className="neo-surface neo-surface--compact reports-dashboard__listItem"
                        data-tone="danger"
                      >
                        <span className="reports-dashboard__listName">{balance.userName}</span>
                        <span className="reports-dashboard__listValue">
                          {formatCurrency(Math.abs(balance.balance ?? 0), currency)}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li>
                      <div className="neo-empty" role="status">
                        <span className="neo-empty__icon" aria-hidden="true">
                          ✅
                        </span>
                        <p className="neo-empty__title">Sem pendências</p>
                        <p className="neo-empty__description">
                          Excelente! Todos os pagamentos estão em dia neste período.
                        </p>
                      </div>
                    </li>
                  )}
                </ul>
              </section>
            </div>
          </section>

          <section className="neo-panel neo-stack neo-stack--lg" aria-labelledby="reports-progress-heading">
            <div className="neo-stack neo-stack--xs">
              <h2 id="reports-progress-heading" className="reports-dashboard__sectionTitle">
                Progresso dos clientes
              </h2>
              <p className="neo-text--sm neo-text--muted">
                Registos de avaliações corporais para monitorizar evolução de peso.
              </p>
            </div>

            <div className="reports-dashboard__summary neo-inline neo-inline--between neo-inline--wrap">
              <div className="neo-stack neo-stack--xs">
                <span className="reports-dashboard__summaryLabel">Cliente em foco</span>
                <span className="reports-dashboard__summaryValue">
                  {selectedClientName || "Selecione um cliente"}
                </span>
              </div>
              {selectedClientSeries.length === 0 && (
                <span className="reports-dashboard__summaryHint">Sem avaliações registadas no período.</span>
              )}
            </div>

            <div>
              {selectedClientSeries.length > 0 ? (
                <LineChart data={selectedClientSeries} height={240} />
              ) : (
                <div className="neo-empty" role="status">
                  <span className="neo-empty__icon" aria-hidden="true">
                    📝
                  </span>
                  <p className="neo-empty__title">Recolha medições</p>
                  <p className="neo-empty__description">
                    Agende uma avaliação física para desbloquear a linha temporal deste cliente.
                  </p>
                </div>
              )}
            </div>

            <section className="neo-stack neo-stack--sm" aria-labelledby="reports-progress-leaders">
              <h3 id="reports-progress-leaders" className="reports-dashboard__listTitle">
                Maiores reduções de peso (Δ)
              </h3>
              <ul className="neo-stack neo-stack--sm" aria-live="polite">
                {progressLeaders.length > 0 ? (
                  progressLeaders.map((item) => (
                    <li
                      key={item.clientId}
                      className="neo-surface neo-surface--compact reports-dashboard__listItem"
                      data-tone="success"
                    >
                      <span className="reports-dashboard__listName">{item.clientName}</span>
                      <span className="reports-dashboard__listValue">{item.delta.toFixed(1)} kg</span>
                    </li>
                  ))
                ) : (
                  <li>
                    <div className="neo-empty" role="status">
                      <span className="neo-empty__icon" aria-hidden="true">
                        ⏳
                      </span>
                      <p className="neo-empty__title">Ainda sem dados suficientes</p>
                      <p className="neo-empty__description">
                        Utilize um período maior ou recolha novas medições para comparar resultados.
                      </p>
                    </div>
                  </li>
                )}
              </ul>
            </section>
          </section>

          <section className="neo-panel neo-stack neo-stack--lg" aria-labelledby="reports-trainers-heading">
            <div className="neo-stack neo-stack--xs">
              <h2 id="reports-trainers-heading" className="reports-dashboard__sectionTitle">
                Performance dos Personal Trainers
              </h2>
              <p className="neo-text--sm neo-text--muted">
                Sessões concluídas, canceladas e futuras por Personal Trainer.
              </p>
            </div>

            <div className="reports-dashboard__metrics neo-grid neo-grid--metricsSm">
              <article className="neo-surface neo-surface--padded reports-dashboard__metric" data-variant="success">
                <span className="reports-dashboard__metricLabel">Taxa média de conclusão</span>
                <span className="reports-dashboard__metricValue">{formatPercentage(completionAverage)}</span>
              </article>
              <article className="neo-surface neo-surface--padded reports-dashboard__metric" data-variant="primary">
                <span className="reports-dashboard__metricLabel">Sessões filtradas</span>
                <span className="reports-dashboard__metricValue">{filteredSessions.length}</span>
              </article>
              <article className="neo-surface neo-surface--padded reports-dashboard__metric" data-variant="info">
                <span className="reports-dashboard__metricLabel">Personal Trainers em análise</span>
                <span className="reports-dashboard__metricValue">{trainerSummaries.length}</span>
              </article>
            </div>

            <div className="neo-table-wrapper">
              <table className="neo-table" aria-describedby="reports-trainers-heading">
                <thead>
                  <tr>
                    <th scope="col">Personal Trainer</th>
                    <th scope="col">Concluídas</th>
                    <th scope="col">Canceladas</th>
                    <th scope="col">Agendadas</th>
                    <th scope="col">Total</th>
                    <th scope="col">Duração média</th>
                    <th scope="col">Taxa de conclusão</th>
                  </tr>
                </thead>
                <tbody>
                  {trainerSummaries.length > 0 ? (
                    trainerSummaries.map((trainer) => {
                      const avgDuration = trainer.total ? trainer.duration / trainer.total : 0;
                      const completionRate = trainer.total ? (trainer.completed / trainer.total) * 100 : 0;
                      return (
                        <tr key={trainer.trainerId}>
                          <td className="reports-dashboard__cellName">{trainer.trainerName}</td>
                          <td>{trainer.completed}</td>
                          <td>{trainer.cancelled}</td>
                          <td>{trainer.upcoming}</td>
                          <td>{trainer.total}</td>
                          <td>{Math.round(avgDuration)} min</td>
                          <td>{formatPercentage(completionRate)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7}>
                        <div className="neo-empty" role="status">
                          <span className="neo-empty__icon" aria-hidden="true">
                            🙌
                          </span>
                          <p className="neo-empty__title">Sem sessões para os filtros</p>
                          <p className="neo-empty__description">
                            Ajuste os filtros para visualizar a performance dos Personal Trainers.
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
      </div>
    </section>
  );
}
