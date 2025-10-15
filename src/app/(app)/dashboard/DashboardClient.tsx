"use client";

import { useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import clsx from "clsx";
import PageHeader from "@/components/ui/PageHeader";
import { useMe } from "@/hooks/useMe";
import { usePoll } from "@/hooks/usePoll";
import { greetingForDate } from "@/lib/time";

type DashboardStatsResponse = {
  ok: boolean;
  role: string;
  stats: Record<string, number>;
};

type OverviewResponse = {
  ok: true;
  stats: {
    totalPlans: number;
    activePlans: number;
    sessionsUpcoming: number;
    unreadNotifications: number;
  };
  activePlan: {
    id: string;
    title: string | null;
    status: string | null;
    start_date: string | null;
    end_date: string | null;
    trainer_id: string | null;
    trainer_name?: string;
  } | null;
  upcomingSessions: Array<{
    id: string;
    scheduled_at: string | null;
    location: string | null;
    status: string | null;
    trainer_id: string | null;
    trainer_name?: string;
  }>;
  lastMeasurement: {
    measured_at: string | null;
    weight_kg: number | null;
    height_cm: number | null;
    body_fat_pct: number | null;
    bmi: number | null;
    notes?: string | null;
  } | null;
  previousMeasurement: OverviewResponse["lastMeasurement"];
  recommendations: string[];
};

type StatusTone = "ok" | "warn" | "down";

const quickActions = [
  { href: "/dashboard/sessions", label: "Agendar sessão" },
  { href: "/dashboard/my-plan", label: "Ver planos" },
  { href: "/dashboard/notifications", label: "Notificações" },
];

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    throw new Error(`Erro ${res.status}`);
  }
  return res.json();
};

function StatusPill({ tone, label }: { tone: StatusTone; label: string }) {
  return (
    <span className="status-pill" data-state={tone}>
      {label}
    </span>
  );
}

function MetricTile({
  label,
  value,
  hint,
  icon,
  href,
  loading,
  tone = "info",
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon?: string;
  href?: string;
  loading?: boolean;
  tone?: "primary" | "accent" | "info" | "success" | "warning";
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <span className="neo-surface__hint uppercase tracking-wide">{label}</span>
          <span className="neo-surface__value text-2xl font-semibold text-fg">
            {loading ? <span className="block h-6 w-16 animate-pulse rounded-full bg-white/60 dark:bg-slate-800/60" /> : value}
          </span>
          {hint && <p className="text-xs text-muted">{hint}</p>}
        </div>
        {icon && (
          <span className="text-2xl" aria-hidden>
            {icon}
          </span>
        )}
      </div>
      {href && !loading && (
        <span className="link-arrow mt-4 inline-flex items-center gap-1 text-sm font-medium">
          Abrir <ArrowTopRightIcon />
        </span>
      )}
    </>
  );

  const className = clsx(
    "neo-surface p-4 transition-transform duration-200",
    href && !loading && "neo-surface--interactive hover:-translate-y-0.5",
  );

  if (href && !loading) {
    return (
      <Link href={href} prefetch={false} className={className} data-variant={tone}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className} data-variant={tone}>
      {content}
    </div>
  );
}

function ArrowTopRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M7 17L17 7M17 7H9M17 7V15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatDate(iso: string | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("pt-PT", options ?? {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function formatMetric(value: number | null | undefined, suffix = "") {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)}${suffix}`;
}

function planTone(status?: string | null): StatusTone {
  const normalized = (status ?? "").toString().toUpperCase();
  if (["ACTIVE", "APPROVED", "IN_PROGRESS", "LIVE"].includes(normalized)) return "ok";
  if (["PAUSED", "PENDING", "WAITING", "DRAFT"].includes(normalized)) return "warn";
  if (!normalized) return "warn";
  return "down";
}

function sessionTone(status?: string | null): StatusTone {
  const normalized = (status ?? "").toString().toUpperCase();
  if (["CONFIRMED", "COMPLETED", "ACTIVE"].includes(normalized)) return "ok";
  if (["PENDING", "RESCHEDULE", "REQUESTED", "WAITING"].includes(normalized)) return "warn";
  if (!normalized) return "warn";
  return "down";
}

export default function DashboardClient() {
  const { user } = useMe();
  const { data: statsResponse } = usePoll<DashboardStatsResponse>("/api/dashboard/stats", {
    intervalMs: 45000,
  });

  const { data: overview, error: overviewError, isLoading: overviewLoading } = useSWR<OverviewResponse>(
    "/api/dashboard/client/overview",
    fetcher<OverviewResponse>,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
    },
  );

  const greetingInfo = useMemo(() => greetingForDate(), []);
  const greeting = useMemo(() => {
    const baseName = user?.name?.trim() || "Cliente";
    return `${greetingInfo.label}, ${baseName}!`;
  }, [greetingInfo.label, user?.name]);

  const loadingKpis = !statsResponse || overviewLoading;
  const baseStats = statsResponse?.stats ?? {};
  const overviewStats = overview?.stats ?? {
    totalPlans: 0,
    activePlans: 0,
    sessionsUpcoming: 0,
    unreadNotifications: 0,
  };

  const weightDelta = useMemo(() => {
    const current = overview?.lastMeasurement?.weight_kg;
    const previous = overview?.previousMeasurement?.weight_kg;
    if (typeof current !== "number" || typeof previous !== "number") return null;
    const diff = current - previous;
    if (!Number.isFinite(diff) || diff === 0) return 0;
    return Number(diff.toFixed(1));
  }, [overview?.lastMeasurement?.weight_kg, overview?.previousMeasurement?.weight_kg]);

  const kpis = [
    {
      label: "Planos activos",
      value: overviewStats.activePlans ?? baseStats.myPlans ?? 0,
      icon: "🏋️",
      variant: "accent" as const,
      href: "/dashboard/my-plan",
    },
    {
      label: "Sessões nesta semana",
      value: overviewStats.sessionsUpcoming ?? baseStats.myUpcoming ?? baseStats.sessions7d ?? 0,
      icon: "🗓️",
      variant: "success" as const,
      href: "/dashboard/sessions",
    },
    {
      label: "Notificações por ler",
      value: overviewStats.unreadNotifications ?? baseStats.unread ?? 0,
      icon: "🔔",
      variant: "warning" as const,
      href: "/dashboard/notifications",
      hint: "Mantém-te a par das últimas novidades do teu PT.",
    },
    {
      label: "Total de planos",
      value: overviewStats.totalPlans ?? baseStats.myPlans ?? 0,
      icon: "📚",
      variant: "info" as const,
      href: "/dashboard/my-plan",
    },
  ];

  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      <PageHeader
        sticky={false}
        title={
          <span className="flex flex-wrap items-center gap-3">
            <span className="text-3xl" aria-hidden>
              {greetingInfo.emoji}
            </span>
            <span className="heading-solid text-3xl font-extrabold leading-tight text-fg">{greeting}</span>
          </span>
        }
        subtitle="O teu cockpit pessoal com os próximos passos e evolução recente."
        actions={
          <div className="neo-quick-actions">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="btn" prefetch={false}>
                {action.label}
              </Link>
            ))}
          </div>
        }
      />

      {overviewError && (
        <div className="neo-panel neo-panel--compact border border-red-500/30 bg-red-50/40 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
          Não foi possível carregar o resumo do teu painel. Tenta novamente dentro de alguns segundos.
        </div>
      )}

      <section className="neo-panel space-y-5" aria-labelledby="client-metrics-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="client-metrics-heading" className="neo-panel__title">
              Indicadores principais
            </h2>
            <p className="neo-panel__subtitle">Actualizados automaticamente a cada minuto.</p>
          </div>
          <StatusPill tone={statsResponse?.ok ? "ok" : "warn"} label={statsResponse?.ok ? "Sincronizado" : "A sincronizar"} />
        </div>
        <div className="neo-grid auto-fit min-[420px]:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <MetricTile
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              icon={kpi.icon}
              tone={kpi.variant}
              href={kpi.href}
              loading={loadingKpis}
              hint={kpi.hint}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <section className="neo-panel space-y-4" aria-labelledby="active-plan-heading">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="active-plan-heading" className="neo-panel__title">
                  Plano activo
                </h2>
                <p className="neo-panel__subtitle">Últimas alterações e responsáveis.</p>
              </div>
              {overview?.activePlan && (
                <StatusPill
                  tone={planTone(overview.activePlan.status)}
                  label={(overview.activePlan.status ?? "Ativo").toString()}
                />
              )}
            </div>

            {overviewLoading ? (
              <div className="grid gap-3">
                <div className="h-8 animate-pulse rounded-xl bg-white/60 dark:bg-slate-800/50" />
                <div className="h-5 animate-pulse rounded-xl bg-white/50 dark:bg-slate-800/40" />
                <div className="h-5 animate-pulse rounded-xl bg-white/50 dark:bg-slate-800/40" />
              </div>
            ) : overview?.activePlan ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-fg">{overview.activePlan.title ?? "Plano de treino"}</h3>
                  <p className="text-sm text-muted">
                    PT responsável: {overview.activePlan.trainer_name ?? overview.activePlan.trainer_id ?? "—"}
                  </p>
                </div>
                <dl className="grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="neo-surface__hint">Início</dt>
                    <dd className="font-semibold text-fg">
                      {formatDate(overview.activePlan.start_date, { day: "2-digit", month: "short" })}
                    </dd>
                  </div>
                  <div>
                    <dt className="neo-surface__hint">Fim</dt>
                    <dd className="font-semibold text-fg">
                      {formatDate(overview.activePlan.end_date, { day: "2-digit", month: "short" })}
                    </dd>
                  </div>
                  <div>
                    <dt className="neo-surface__hint">Estado</dt>
                    <dd className="font-semibold text-fg">{(overview.activePlan.status ?? "Ativo").toString()}</dd>
                  </div>
                </dl>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/dashboard/my-plan/${overview.activePlan.id}`}
                    className="btn primary"
                    prefetch={false}
                  >
                    Abrir plano
                  </Link>
                  <Link href="/dashboard/sessions" className="btn ghost" prefetch={false}>
                    Ver sessões
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-base font-semibold text-fg">Ainda não tens um plano activo.</p>
                <p className="text-sm text-muted">
                  Assim que o teu Personal Trainer publicar um plano, os detalhes e próximos passos surgem aqui automaticamente.
                </p>
                <Link href="/dashboard/messages" className="btn primary" prefetch={false}>
                  Contactar o PT
                </Link>
              </div>
            )}
          </section>

          <section className="neo-panel space-y-4" aria-labelledby="upcoming-sessions-heading">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="upcoming-sessions-heading" className="neo-panel__title">
                  Próximas sessões
                </h2>
                <p className="neo-panel__subtitle">Acompanhamos a agenda dos próximos 7 dias.</p>
              </div>
              <Link href="/dashboard/sessions" className="btn ghost" prefetch={false}>
                Ver agenda
              </Link>
            </div>

            {overviewLoading ? (
              <div className="grid gap-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-16 animate-pulse rounded-2xl bg-white/60 dark:bg-slate-800/50"
                  />
                ))}
              </div>
            ) : overview?.upcomingSessions?.length ? (
              <ul className="grid gap-3" aria-live="polite">
                {overview.upcomingSessions.map((session) => (
                  <li key={session.id} className="neo-surface p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="font-semibold text-fg">{formatDate(session.scheduled_at)}</span>
                      {session.status && (
                        <StatusPill tone={sessionTone(session.status)} label={String(session.status).toUpperCase()} />
                      )}
                    </div>
                    <p className="text-sm text-muted">
                      {session.location ?? "Local a confirmar"} • {session.trainer_name ?? session.trainer_id ?? "PT por atribuir"}
                    </p>
                    <Link href="/dashboard/sessions" className="link-arrow mt-3 inline-flex" prefetch={false}>
                      Ver detalhes <ArrowTopRightIcon />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="space-y-3">
                <p className="text-base font-semibold text-fg">Sem sessões marcadas nos próximos 7 dias.</p>
                <p className="text-sm text-muted">
                  Mantém a consistência agendando a próxima sessão ou revendo o teu plano semanal.
                </p>
                <Link href="/dashboard/sessions" className="btn primary" prefetch={false}>
                  Marcar sessão
                </Link>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="neo-panel space-y-4" aria-labelledby="metrics-heading">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 id="metrics-heading" className="neo-panel__title">
                  Evolução física
                </h2>
                <p className="neo-panel__subtitle">Últimos registos submetidos.</p>
              </div>
              <Link href="/dashboard/clients/metrics" className="btn ghost" prefetch={false}>
                Ver métricas
              </Link>
            </div>

            {overviewLoading ? (
              <div className="grid gap-3">
                <div className="h-10 animate-pulse rounded-2xl bg-white/60 dark:bg-slate-800/50" />
                <div className="h-6 animate-pulse rounded-2xl bg-white/50 dark:bg-slate-800/40" />
              </div>
            ) : overview?.lastMeasurement ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted">
                    Registado em {formatDate(overview.lastMeasurement.measured_at, { day: "2-digit", month: "long" })}
                  </p>
                  <p className="text-lg font-semibold text-fg">
                    Peso actual: {formatMetric(overview.lastMeasurement.weight_kg, " kg")}
                  </p>
                </div>
                <dl className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="neo-surface__hint">Altura</dt>
                    <dd className="font-semibold text-fg">{formatMetric(overview.lastMeasurement.height_cm, " cm")}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="neo-surface__hint">Massa gorda</dt>
                    <dd className="font-semibold text-fg">{formatMetric(overview.lastMeasurement.body_fat_pct, "%")}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="neo-surface__hint">IMC</dt>
                    <dd className="font-semibold text-fg">{formatMetric(overview.lastMeasurement.bmi)}</dd>
                  </div>
                </dl>
                {typeof weightDelta === "number" && (
                  <p
                    className={clsx(
                      "text-sm font-semibold",
                      weightDelta > 0
                        ? "text-amber-600 dark:text-amber-300"
                        : weightDelta < 0
                        ? "text-emerald-600 dark:text-emerald-300"
                        : "text-muted",
                    )}
                  >
                    {weightDelta > 0
                      ? `+${weightDelta} kg vs. última medição`
                      : weightDelta < 0
                      ? `${weightDelta} kg vs. última medição`
                      : "Peso estável desde a medição anterior"}
                  </p>
                )}
                {overview.lastMeasurement.notes && (
                  <p className="text-sm text-muted">Nota: {overview.lastMeasurement.notes}</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-base font-semibold text-fg">Ainda não existem registos de métricas.</p>
                <p className="text-sm text-muted">
                  Guarda o teu peso, altura e notas para acompanhares a evolução junto do teu Personal Trainer.
                </p>
                <Link href="/dashboard/clients/metrics" className="btn primary" prefetch={false}>
                  Registar métricas
                </Link>
              </div>
            )}
          </section>

          <section className="neo-panel space-y-4" aria-labelledby="quick-actions-heading">
            <div>
              <h2 id="quick-actions-heading" className="neo-panel__title">
                Ações rápidas
              </h2>
              <p className="neo-panel__subtitle">Agiliza o contacto com o teu PT e histórico.</p>
            </div>
            <div className="grid gap-2">
              <Link href="/dashboard/messages" className="neo-surface neo-surface--interactive p-3" prefetch={false}>
                Conversar com o PT
              </Link>
              <Link href="/dashboard/notifications" className="neo-surface neo-surface--interactive p-3" prefetch={false}>
                Rever notificações
              </Link>
              <Link href="/dashboard/history" className="neo-surface neo-surface--interactive p-3" prefetch={false}>
                Histórico de treinos
              </Link>
            </div>
          </section>

          <section className="neo-panel space-y-4" aria-labelledby="recommendations-heading">
            <div>
              <h2 id="recommendations-heading" className="neo-panel__title">
                Recomendações personalizadas
              </h2>
              <p className="neo-panel__subtitle">Sugestões do teu PT para os próximos dias.</p>
            </div>
            {overviewLoading ? (
              <div className="grid gap-2">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-4 animate-pulse rounded-full bg-white/60 dark:bg-slate-800/50"
                  />
                ))}
              </div>
            ) : overview?.recommendations?.length ? (
              <ul className="grid gap-2 text-sm">
                {overview.recommendations.map((rec, idx) => (
                  <li key={idx} className="neo-surface p-3" data-variant="success">
                    {rec}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">
                Tudo em dia! Continua a seguir o plano e mantém o contacto com o teu PT para potenciares os resultados.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

