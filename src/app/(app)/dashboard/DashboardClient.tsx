"use client";

import { useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
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
  const classes = ["neo-surface", "client-dashboard__metricCard"];
  const interactive = Boolean(href && !loading);
  if (interactive) {
    classes.push("neo-surface--interactive");
  }

  const skeleton = <span className="client-dashboard__metricSkeleton" aria-hidden />;

  const content = (
    <>
      <div className="client-dashboard__metric">
        <div className="client-dashboard__metricCopy">
          <span className="neo-surface__hint uppercase tracking-wide">{label}</span>
          <span className="client-dashboard__metricValue">{loading ? skeleton : value}</span>
          {hint && <p className="client-dashboard__metricHint">{hint}</p>}
        </div>
        {icon && (
          <span className="client-dashboard__metricIcon" aria-hidden>
            {icon}
          </span>
        )}
      </div>
      {interactive && (
        <span className="link-arrow client-dashboard__metricLink">
          Abrir <ArrowTopRightIcon />
        </span>
      )}
    </>
  );

  if (interactive && href) {
    return (
      <Link href={href} prefetch={false} className={classes.join(" ")} data-variant={tone}>
        {content}
      </Link>
    );
  }

  return (
    <div className={classes.join(" ")} data-variant={tone}>
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

  const weightDeltaTone =
    typeof weightDelta === "number"
      ? weightDelta > 0
        ? "up"
        : weightDelta < 0
        ? "down"
        : "flat"
      : undefined;

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
    <div className="client-dashboard">
      <PageHeader
        sticky={false}
        title={
          <div className="client-dashboard__hero">
            <span className="client-dashboard__heroEmoji" aria-hidden>
              {greetingInfo.emoji}
            </span>
            <span className="client-dashboard__heroTitle">{greeting}</span>
          </div>
        }
        subtitle="O teu cockpit pessoal com os próximos passos e evolução recente."
        actions={
          <div className="neo-quick-actions client-dashboard__quickActions">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="btn" prefetch={false}>
                {action.label}
              </Link>
            ))}
          </div>
        }
      />

      {overviewError && (
        <div className="client-dashboard__error" role="alert">
          Não foi possível carregar o resumo do teu painel. Tenta novamente dentro de alguns segundos.
        </div>
      )}

      <section className="neo-panel client-dashboard__panel" aria-labelledby="client-metrics-heading">
        <header className="neo-panel__header">
          <div className="neo-panel__meta">
            <h2 id="client-metrics-heading" className="neo-panel__title">
              Indicadores principais
            </h2>
            <p className="neo-panel__subtitle">Actualizados automaticamente a cada minuto.</p>
          </div>
          <div className="neo-panel__actions">
            <StatusPill tone={statsResponse?.ok ? "ok" : "warn"} label={statsResponse?.ok ? "Sincronizado" : "A sincronizar"} />
          </div>
        </header>
        <div className="client-dashboard__metrics">
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

      <div className="client-dashboard__columns">
        <div className="client-dashboard__column client-dashboard__column--main">
          <section className="neo-panel client-dashboard__panel" aria-labelledby="active-plan-heading">
            <header className="neo-panel__header">
              <div className="neo-panel__meta">
                <h2 id="active-plan-heading" className="neo-panel__title">
                  Plano activo
                </h2>
                <p className="neo-panel__subtitle">Últimas alterações e responsáveis.</p>
              </div>
              {overview?.activePlan && (
                <div className="neo-panel__actions">
                  <StatusPill
                    tone={planTone(overview.activePlan.status)}
                    label={(overview.activePlan.status ?? "Ativo").toString()}
                  />
                </div>
              )}
            </header>

            {overviewLoading ? (
              <div className="client-dashboard__skeletonStack">
                <div className="client-dashboard__skeletonBlock" data-size="lg" />
                <div className="client-dashboard__skeletonBlock" />
                <div className="client-dashboard__skeletonBlock" />
              </div>
            ) : overview?.activePlan ? (
              <div className="client-dashboard__panelBody">
                <div className="client-dashboard__planHeader">
                  <h3 className="client-dashboard__planTitle">
                    {overview.activePlan.title ?? "Plano de treino"}
                  </h3>
                  <p className="client-dashboard__muted">
                    PT responsável: {overview.activePlan.trainer_name ?? overview.activePlan.trainer_id ?? "—"}
                  </p>
                </div>
                <dl className="client-dashboard__planStats">
                  <div className="client-dashboard__planStat">
                    <dt className="neo-surface__hint">Início</dt>
                    <dd className="client-dashboard__summaryValue">
                      {formatDate(overview.activePlan.start_date, { day: "2-digit", month: "short" })}
                    </dd>
                  </div>
                  <div className="client-dashboard__planStat">
                    <dt className="neo-surface__hint">Fim</dt>
                    <dd className="client-dashboard__summaryValue">
                      {formatDate(overview.activePlan.end_date, { day: "2-digit", month: "short" })}
                    </dd>
                  </div>
                  <div className="client-dashboard__planStat">
                    <dt className="neo-surface__hint">Estado</dt>
                    <dd className="client-dashboard__summaryValue">
                      {(overview.activePlan.status ?? "Ativo").toString()}
                    </dd>
                  </div>
                </dl>
                <div className="client-dashboard__actions">
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
              <div className="client-dashboard__panelBody">
                <p className="client-dashboard__headline">Ainda não tens um plano activo.</p>
                <p className="client-dashboard__muted">
                  Assim que o teu Personal Trainer publicar um plano, os detalhes e próximos passos surgem aqui automaticamente.
                </p>
                <Link href="/dashboard/messages" className="btn primary" prefetch={false}>
                  Contactar o PT
                </Link>
              </div>
            )}
          </section>

          <section className="neo-panel client-dashboard__panel" aria-labelledby="upcoming-sessions-heading">
            <header className="neo-panel__header">
              <div className="neo-panel__meta">
                <h2 id="upcoming-sessions-heading" className="neo-panel__title">
                  Próximas sessões
                </h2>
                <p className="neo-panel__subtitle">Acompanhamos a agenda dos próximos 7 dias.</p>
              </div>
              <div className="neo-panel__actions">
                <Link href="/dashboard/sessions" className="btn ghost" prefetch={false}>
                  Ver agenda
                </Link>
              </div>
            </header>

            {overviewLoading ? (
              <div className="client-dashboard__skeletonStack">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="client-dashboard__skeletonBlock" data-size="card" />
                ))}
              </div>
            ) : overview?.upcomingSessions?.length ? (
              <ul className="client-dashboard__list" aria-live="polite">
                {overview.upcomingSessions.map((session) => (
                  <li key={session.id} className="neo-surface client-dashboard__card">
                    <div className="client-dashboard__cardHeader">
                      <span className="client-dashboard__headline client-dashboard__headline--small">
                        {formatDate(session.scheduled_at)}
                      </span>
                      {session.status && (
                        <StatusPill tone={sessionTone(session.status)} label={String(session.status).toUpperCase()} />
                      )}
                    </div>
                    <p className="client-dashboard__muted client-dashboard__muted--small">
                      {session.location ?? "Local a confirmar"} • {session.trainer_name ?? session.trainer_id ?? "PT por atribuir"}
                    </p>
                    <Link href="/dashboard/sessions" className="link-arrow client-dashboard__link" prefetch={false}>
                      Ver detalhes <ArrowTopRightIcon />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="client-dashboard__panelBody">
                <p className="client-dashboard__headline">Sem sessões marcadas nos próximos 7 dias.</p>
                <p className="client-dashboard__muted">
                  Mantém a consistência agendando a próxima sessão ou revendo o teu plano semanal.
                </p>
                <Link href="/dashboard/sessions" className="btn primary" prefetch={false}>
                  Marcar sessão
                </Link>
              </div>
            )}
          </section>
        </div>

        <aside className="client-dashboard__column client-dashboard__column--aside">
          <section className="neo-panel client-dashboard__panel" aria-labelledby="metrics-heading">
            <header className="neo-panel__header">
              <div className="neo-panel__meta">
                <h2 id="metrics-heading" className="neo-panel__title">
                  Evolução física
                </h2>
                <p className="neo-panel__subtitle">Últimos registos submetidos.</p>
              </div>
              <div className="neo-panel__actions">
                <Link href="/dashboard/clients/metrics" className="btn ghost" prefetch={false}>
                  Ver métricas
                </Link>
              </div>
            </header>

            {overviewLoading ? (
              <div className="client-dashboard__skeletonStack">
                <div className="client-dashboard__skeletonBlock" data-size="lg" />
                <div className="client-dashboard__skeletonBlock" />
              </div>
            ) : overview?.lastMeasurement ? (
              <div className="client-dashboard__panelBody">
                <div className="client-dashboard__planHeader">
                  <p className="client-dashboard__muted client-dashboard__muted--small">
                    Registado em {formatDate(overview.lastMeasurement.measured_at, { day: "2-digit", month: "long" })}
                  </p>
                  <p className="client-dashboard__value">
                    Peso actual: {formatMetric(overview.lastMeasurement.weight_kg, " kg")}
                  </p>
                </div>
                <dl className="client-dashboard__metricsSummary">
                  <div className="client-dashboard__metricRow">
                    <dt className="neo-surface__hint">Altura</dt>
                    <dd className="client-dashboard__summaryValue">
                      {formatMetric(overview.lastMeasurement.height_cm, " cm")}
                    </dd>
                  </div>
                  <div className="client-dashboard__metricRow">
                    <dt className="neo-surface__hint">Massa gorda</dt>
                    <dd className="client-dashboard__summaryValue">
                      {formatMetric(overview.lastMeasurement.body_fat_pct, "%")}
                    </dd>
                  </div>
                  <div className="client-dashboard__metricRow">
                    <dt className="neo-surface__hint">IMC</dt>
                    <dd className="client-dashboard__summaryValue">
                      {formatMetric(overview.lastMeasurement.bmi)}
                    </dd>
                  </div>
                </dl>
                {typeof weightDelta === "number" && weightDeltaTone && (
                  <p className="client-dashboard__trend" data-tone={weightDeltaTone}>
                    {weightDelta > 0
                      ? `+${weightDelta} kg vs. última medição`
                      : weightDelta < 0
                      ? `${weightDelta} kg vs. última medição`
                      : "Peso estável desde a medição anterior"}
                  </p>
                )}
                {overview.lastMeasurement.notes && (
                  <p className="client-dashboard__muted client-dashboard__muted--small">
                    Nota: {overview.lastMeasurement.notes}
                  </p>
                )}
              </div>
            ) : (
              <div className="client-dashboard__panelBody">
                <p className="client-dashboard__headline">Ainda não existem registos de métricas.</p>
                <p className="client-dashboard__muted">
                  Guarda o teu peso, altura e notas para acompanhares a evolução junto do teu Personal Trainer.
                </p>
                <Link href="/dashboard/clients/metrics" className="btn primary" prefetch={false}>
                  Registar métricas
                </Link>
              </div>
            )}
          </section>

          <section className="neo-panel client-dashboard__panel" aria-labelledby="quick-actions-heading">
            <header className="neo-panel__header">
              <div className="neo-panel__meta">
                <h2 id="quick-actions-heading" className="neo-panel__title">
                  Ações rápidas
                </h2>
                <p className="neo-panel__subtitle">Agiliza o contacto com o teu PT e histórico.</p>
              </div>
            </header>
            <div className="client-dashboard__quickList">
              <Link href="/dashboard/messages" className="neo-surface neo-surface--interactive client-dashboard__quickLink" prefetch={false}>
                Conversar com o PT
              </Link>
              <Link href="/dashboard/notifications" className="neo-surface neo-surface--interactive client-dashboard__quickLink" prefetch={false}>
                Rever notificações
              </Link>
              <Link href="/dashboard/history" className="neo-surface neo-surface--interactive client-dashboard__quickLink" prefetch={false}>
                Histórico de treinos
              </Link>
            </div>
          </section>

          <section className="neo-panel client-dashboard__panel" aria-labelledby="recommendations-heading">
            <header className="neo-panel__header">
              <div className="neo-panel__meta">
                <h2 id="recommendations-heading" className="neo-panel__title">
                  Recomendações personalizadas
                </h2>
                <p className="neo-panel__subtitle">Sugestões do teu PT para os próximos dias.</p>
              </div>
            </header>
            {overviewLoading ? (
              <div className="client-dashboard__skeletonStack">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="client-dashboard__skeletonBlock" data-size="line" />
                ))}
              </div>
            ) : overview?.recommendations?.length ? (
              <ul className="client-dashboard__recommendations">
                {overview.recommendations.map((rec, idx) => (
                  <li key={idx} className="neo-surface client-dashboard__recommendation" data-variant="success">
                    {rec}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="client-dashboard__muted">
                Tudo em dia! Continua a seguir o plano e mantém o contacto com o teu PT para potenciares os resultados.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

