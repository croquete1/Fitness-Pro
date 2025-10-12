"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
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

  const firstName = useMemo(() => {
    if (!viewerName) return null;
    const parts = viewerName.trim().split(/\s+/);
    return parts[0] ?? viewerName;
  }, [viewerName]);

  return (
    <section className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Relatórios operacionais</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Acompanhe faturamento, progresso dos clientes e desempenho dos Personal Trainers num único painel.
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 font-medium ${
              supabase
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
            }`}
          >
            {supabase ? "Dados em tempo real via Supabase" : "Dados demonstrativos — configure o Supabase"}
          </span>
          {firstName && <span>Olá, {firstName}! 👋</span>}
          <span>Período analisado: {startRange.toLocaleDateString("pt-PT")}</span>
          <span>até {endRange.toLocaleDateString("pt-PT")}</span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px,1fr] xl:grid-cols-[280px,1fr]">
        <aside className="card space-y-5 p-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Período</p>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900"
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

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Personal Trainer</p>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900"
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

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cliente</p>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900"
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

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={handleExportCSV}>
              Exportar CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={handlePrint}>
              Exportar PDF
            </Button>
          </div>

          <p className="text-xs leading-relaxed text-slate-500">
            Combine filtros para investigar situações específicas. A exportação CSV respeita o período e os filtros ativos.
          </p>
        </aside>

        <div className="space-y-6">
          <Card className="card">
            <CardHeader className="flex flex-col gap-1">
              <div>
                <h2 className="text-lg font-semibold">Resumo financeiro</h2>
                <p className="text-sm text-slate-500">
                  Volume faturado e pendências por cliente no período selecionado.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl bg-indigo-50 p-4 text-indigo-900 dark:bg-indigo-900/40 dark:text-indigo-100">
                  <p className="text-xs uppercase tracking-wide opacity-80">Faturamento no período</p>
                  <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalRevenue, currency)}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-4 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100">
                  <p className="text-xs uppercase tracking-wide opacity-80">Média mensal</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {financialSeries.length
                      ? formatCurrency(totalRevenue / financialSeries.length, currency)
                      : formatCurrency(0, currency)}
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 p-4 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
                  <p className="text-xs uppercase tracking-wide opacity-80">Pendências</p>
                  <p className="mt-2 text-2xl font-semibold">{formatCurrency(pendingTotal, currency)}</p>
                </div>
                <div className="rounded-xl bg-slate-100 p-4 text-slate-900 dark:bg-slate-800/80 dark:text-slate-100">
                  <p className="text-xs uppercase tracking-wide opacity-80">Registos analisados</p>
                  <p className="mt-2 text-2xl font-semibold">{filteredFinancialEntries.length}</p>
                </div>
              </div>

              <div>
                {financialSeries.length > 0 ? (
                  <LineChart data={financialSeries} height={260} />
                ) : (
                  <p className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-700">
                    Nenhuma movimentação financeira encontrada para os filtros aplicados.
                  </p>
                )}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Top clientes por faturamento
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {topClients.length > 0 ? (
                      topClients.map((client) => (
                        <li key={client.id} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-900/40">
                          <span>{client.name}</span>
                          <span className="font-medium">{formatCurrency(client.total, currency)}</span>
                        </li>
                      ))
                    ) : (
                      <li className="rounded-md border border-dashed border-slate-200 px-3 py-4 text-center text-slate-500 dark:border-slate-700">
                        Sem faturamento no período selecionado.
                      </li>
                    )}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Pendências de pagamento</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {outstandingBalances.length > 0 ? (
                      outstandingBalances.map((balance) => (
                        <li key={balance.userId} className="flex items-center justify-between rounded-md bg-rose-50 px-3 py-2 text-rose-900 dark:bg-rose-900/40 dark:text-rose-100">
                          <span>{balance.userName}</span>
                          <span className="font-medium">{formatCurrency(Math.abs(balance.balance ?? 0), currency)}</span>
                        </li>
                      ))
                    ) : (
                      <li className="rounded-md border border-dashed border-slate-200 px-3 py-4 text-center text-slate-500 dark:border-slate-700">
                        Nenhuma pendência identificada.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card">
            <CardHeader className="flex flex-col gap-1">
              <div>
                <h2 className="text-lg font-semibold">Progresso dos clientes</h2>
                <p className="text-sm text-slate-500">
                  Registos de avaliações corporais para monitorizar evolução de peso.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Cliente em foco</p>
                  <p className="text-base font-semibold">{selectedClientName || "Selecione um cliente"}</p>
                </div>
                {selectedClientSeries.length === 0 && (
                  <p className="text-xs text-slate-500">
                    Sem avaliações registadas no período para este cliente.
                  </p>
                )}
              </div>

              <div>
                {selectedClientSeries.length > 0 ? (
                  <LineChart data={selectedClientSeries} height={240} />
                ) : (
                  <p className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-700">
                    Recolha novas medições para acompanhar o progresso.
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Maiores reduções de peso (Δ)
                </h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {progressLeaders.length > 0 ? (
                    progressLeaders.map((item) => (
                      <li key={item.clientId} className="flex items-center justify-between rounded-md bg-emerald-50 px-3 py-2 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100">
                        <span>{item.clientName}</span>
                        <span className="font-medium">{item.delta.toFixed(1)} kg</span>
                      </li>
                    ))
                  ) : (
                    <li className="rounded-md border border-dashed border-slate-200 px-3 py-4 text-center text-slate-500 dark:border-slate-700">
                      Ainda não há dados suficientes para calcular o progresso.
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="card">
            <CardHeader className="flex flex-col gap-1">
              <div>
                <h2 className="text-lg font-semibold">Performance dos Personal Trainers</h2>
                <p className="text-sm text-slate-500">
                  Sessões concluídas, canceladas e futuras por Personal Trainer.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-emerald-50 p-4 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100">
                  <p className="text-xs uppercase tracking-wide opacity-80">Taxa média de conclusão</p>
                  <p className="mt-2 text-2xl font-semibold">{formatPercentage(completionAverage)}</p>
                </div>
                <div className="rounded-xl bg-indigo-50 p-4 text-indigo-900 dark:bg-indigo-900/40 dark:text-indigo-100">
                  <p className="text-xs uppercase tracking-wide opacity-80">Sessões filtradas</p>
                  <p className="mt-2 text-2xl font-semibold">{filteredSessions.length}</p>
                </div>
                <div className="rounded-xl bg-slate-100 p-4 text-slate-900 dark:bg-slate-800/80 dark:text-slate-100">
                  <p className="text-xs uppercase tracking-wide opacity-80">Personal Trainers em análise</p>
                  <p className="mt-2 text-2xl font-semibold">{trainerSummaries.length}</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/80 dark:text-slate-300">
                    <tr>
                      <th className="px-3 py-2">Personal Trainer</th>
                      <th className="px-3 py-2">Concluídas</th>
                      <th className="px-3 py-2">Canceladas</th>
                      <th className="px-3 py-2">Agendadas</th>
                      <th className="px-3 py-2">Total</th>
                      <th className="px-3 py-2">Duração média</th>
                      <th className="px-3 py-2">Taxa de conclusão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainerSummaries.length > 0 ? (
                      trainerSummaries.map((trainer) => {
                        const avgDuration = trainer.total ? trainer.duration / trainer.total : 0;
                        const completionRate = trainer.total ? (trainer.completed / trainer.total) * 100 : 0;
                        return (
                          <tr key={trainer.trainerId} className="border-t border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-200">
                            <td className="px-3 py-2 font-medium">{trainer.trainerName}</td>
                            <td className="px-3 py-2">{trainer.completed}</td>
                            <td className="px-3 py-2">{trainer.cancelled}</td>
                            <td className="px-3 py-2">{trainer.upcoming}</td>
                            <td className="px-3 py-2">{trainer.total}</td>
                            <td className="px-3 py-2">{Math.round(avgDuration)} min</td>
                            <td className="px-3 py-2">{formatPercentage(completionRate)}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td className="px-3 py-4 text-center text-slate-500" colSpan={7}>
                          Nenhuma sessão encontrada para os filtros aplicados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
