"use client";

import * as React from "react";
import useSWR from "swr";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { useMe } from "@/hooks/useMe";
import { greetingForDate } from "@/lib/time";
import type {
  ClientDashboardResponse,
  ClientHeroMetric,
  ClientHighlight,
  ClientSessionRow,
  ClientTimelinePoint,
  ClientWalletEntry,
} from "@/lib/client/dashboard/types";

const RANGE_OPTIONS = [
  { value: 7, label: "7 dias" },
  { value: 14, label: "14 dias" },
  { value: 30, label: "30 dias" },
  { value: 60, label: "60 dias" },
  { value: 90, label: "90 dias" },
];

const numberFormatter = new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 0 });

function formatCurrency(amount: number, currency?: string | null): string {
  const code = typeof currency === "string" && currency.trim().length === 3 ? currency.toUpperCase() : "EUR";
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

async function fetcher(url: string): Promise<ClientDashboardResponse> {
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) {
    const message = await response.text().catch(() => "Não foi possível carregar o painel.");
    throw new Error(message || "Não foi possível carregar o painel.");
  }
  const json = (await response.json()) as ClientDashboardResponse | { ok?: boolean; message?: string };
  if (!json || typeof json !== "object" || !("ok" in json) || json.ok !== true) {
    throw new Error((json as any)?.message ?? "Não foi possível carregar o painel.");
  }
  return json as ClientDashboardResponse;
}

type ChartDatum = ClientTimelinePoint & { tooltipLabel: string };

type TimelineTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: ChartDatum; value: number; dataKey: keyof ChartDatum; color: string }>;
  label?: string;
};

function TimelineTooltip({ active, payload }: TimelineTooltipProps) {
  if (!active || !payload?.length) return null;
  const datum = payload[0]?.payload;
  if (!datum) return null;
  return (
    <div className="client-dashboard__tooltip" role="status">
      <p className="client-dashboard__tooltipTitle">{datum.tooltipLabel}</p>
      <dl className="client-dashboard__tooltipList">
        <div>
          <dt>Agendadas</dt>
          <dd>{numberFormatter.format(datum.scheduled)}</dd>
        </div>
        <div>
          <dt>Realizadas</dt>
          <dd>{numberFormatter.format(datum.completed)}</dd>
        </div>
        <div>
          <dt>Canceladas</dt>
          <dd>{numberFormatter.format(datum.cancelled)}</dd>
        </div>
      </dl>
    </div>
  );
}

function StatusPill({ tone, label }: { tone: "ok" | "warn"; label: string }) {
  return (
    <span className="status-pill" data-state={tone}>
      {label}
    </span>
  );
}

function HeroMetrics({ metrics }: { metrics: ClientHeroMetric[] }) {
  if (!metrics.length) return null;
  return (
    <div className="client-dashboard__hero" role="list">
      {metrics.map((metric) => (
        <article key={metric.key} className="client-dashboard__heroCard" data-tone={metric.tone ?? "neutral"}>
          <span className="client-dashboard__heroLabel">{metric.label}</span>
          <strong className="client-dashboard__heroValue">{metric.value}</strong>
          {metric.hint ? <span className="client-dashboard__heroHint">{metric.hint}</span> : null}
          {metric.trend ? <span className="client-dashboard__heroTrend">{metric.trend}</span> : null}
        </article>
      ))}
    </div>
  );
}

function HighlightsList({ highlights }: { highlights: ClientHighlight[] }) {
  if (!highlights.length) {
    return (
      <div className="client-dashboard__empty" role="status">
        <p className="neo-text--muted">Sem destaques no momento.</p>
      </div>
    );
  }

  return (
    <ul className="client-dashboard__highlightList" role="list">
      {highlights.map((highlight) => (
        <li key={highlight.id} className="client-dashboard__highlight" data-tone={highlight.tone}>
          <div className="client-dashboard__highlightMeta">
            {highlight.icon ? (
              <span className="client-dashboard__highlightIcon" aria-hidden>
                {highlight.icon}
              </span>
            ) : null}
            <div>
              <p className="client-dashboard__highlightTitle">{highlight.title}</p>
              <p className="client-dashboard__highlightDescription">{highlight.description}</p>
            </div>
          </div>
          {highlight.meta ? <p className="client-dashboard__highlightMetaLabel">{highlight.meta}</p> : null}
        </li>
      ))}
    </ul>
  );
}

function SessionsList({ sessions }: { sessions: ClientSessionRow[] }) {
  if (!sessions.length) {
    return (
      <div className="client-dashboard__empty" role="status">
        <p className="client-dashboard__emptyTitle">Sem sessões agendadas</p>
        <p className="client-dashboard__emptyText">Agenda uma sessão para manter o ritmo de treinos.</p>
      </div>
    );
  }

  return (
    <ul className="client-dashboard__sessionList" role="list">
      {sessions.map((session) => (
        <li key={session.id} className="client-dashboard__sessionItem">
          <div className="client-dashboard__sessionMeta">
            <span className="client-dashboard__sessionDay">{session.dayLabel}</span>
            <span className="client-dashboard__sessionTime">{session.timeLabel}</span>
          </div>
          <div className="client-dashboard__sessionDetails">
            <span className="client-dashboard__sessionRelative">{session.relative}</span>
            <span className="client-dashboard__sessionLocation">
              {session.location ? `Local: ${session.location}` : "Local a definir"}
            </span>
            {session.trainerName ? (
              <span className="client-dashboard__sessionTrainer">PT: {session.trainerName}</span>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

function WalletEntries({ entries, currency }: { entries: ClientWalletEntry[]; currency: string }) {
  if (!entries.length) {
    return (
      <div className="client-dashboard__empty" role="status">
        <p className="client-dashboard__emptyText">Sem movimentos registados nesta carteira.</p>
      </div>
    );
  }

  return (
    <ul className="client-dashboard__walletEntries" role="list">
      {entries.map((entry) => (
        <li key={entry.id} className="client-dashboard__walletEntry">
          <div>
            <p className="client-dashboard__walletDescription">{entry.description ?? "Movimento"}</p>
            <span className="client-dashboard__walletMeta">{entry.relative}</span>
          </div>
          <strong className="client-dashboard__walletAmount" data-tone={entry.amount >= 0 ? "credit" : "debit"}>
            {entry.amount >= 0 ? "+" : "−"}
            {formatCurrency(Math.abs(entry.amount), currency)}
          </strong>
        </li>
      ))}
    </ul>
  );
}

function MeasurementsTimeline({ points }: { points: ClientDashboardResponse["measurements"]["timeline"] }) {
  if (!points.length) {
    return (
      <div className="client-dashboard__empty" role="status">
        <p className="client-dashboard__emptyText">Sem medições registadas.</p>
      </div>
    );
  }

  return (
    <ul className="client-dashboard__measurementList" role="list">
      {points.map((point) => (
        <li key={point.measuredAt ?? point.label} className="client-dashboard__measurementItem">
          <span className="client-dashboard__measurementLabel">{point.label}</span>
          <div className="client-dashboard__measurementValues">
            <span>{point.weightKg !== null ? `${point.weightKg.toFixed(1)} kg` : "—"}</span>
            <span>{point.bodyFatPct !== null ? `${point.bodyFatPct.toFixed(1)}% gordura` : "—"}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function DashboardClient() {
  const { user } = useMe();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const rangeParam = searchParams?.get("range");
  const range = React.useMemo(() => {
    const parsed = rangeParam ? Number.parseInt(rangeParam, 10) : NaN;
    if (!Number.isFinite(parsed) || parsed <= 0) return 30;
    return parsed;
  }, [rangeParam]);

  const { data, error, isLoading, mutate } = useSWR<ClientDashboardResponse>(
    `/api/client/dashboard?range=${range}`,
    fetcher,
    {
      refreshInterval: 60_000,
    },
  );

  const greetingInfo = React.useMemo(() => greetingForDate(), []);
  const greeting = React.useMemo(() => {
    const baseName = user?.name?.trim() || user?.email?.split("@")[0] || "Cliente";
    return `${greetingInfo.label}, ${baseName}!`;
  }, [greetingInfo.label, user?.email, user?.name]);

  const timelineData: ChartDatum[] = React.useMemo(() => {
    if (!data?.timeline?.length) return [];
    return data.timeline.map((point) => ({
      ...point,
      tooltipLabel: point.label,
    }));
  }, [data?.timeline]);

  const handleRangeChange = React.useCallback(
    (value: number) => {
      const params = new URLSearchParams(searchParams ? searchParams.toString() : undefined);
      params.set("range", String(value));
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const handleRefresh = React.useCallback(() => {
    void mutate();
  }, [mutate]);

  return (
    <div className="client-dashboard neo-stack neo-stack--xl">
      <PageHeader
        sticky={false}
        title={
          <div className="client-dashboard__heroHeader">
            <span className="client-dashboard__heroEmoji" aria-hidden>
              {greetingInfo.emoji}
            </span>
            <span className="client-dashboard__heroTitle">{greeting}</span>
          </div>
        }
        subtitle="Acompanha planos, sessões, medições e recomendações personalizadas num único painel."
        actions={
          <div className="client-dashboard__headerActions">
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              Actualizar
            </Button>
          </div>
        }
      />

      {error ? (
        <Alert tone="warning" title="Não foi possível sincronizar o painel.">
          <p>Tenta novamente em breve ou contacta o teu PT se o problema persistir.</p>
        </Alert>
      ) : null}

      <section className="neo-panel client-dashboard__panel" aria-labelledby="client-metrics-heading">
        <header className="neo-panel__header client-dashboard__panelHeader">
          <div className="neo-panel__meta">
            <h2 id="client-metrics-heading" className="neo-panel__title">
              Indicadores principais
            </h2>
            <p className="neo-panel__subtitle">Actualizados automaticamente com base nos teus dados.</p>
          </div>
          <StatusPill tone={data?.source === "supabase" ? "ok" : "warn"} label={data?.source === "supabase" ? "Sincronizado" : "Modo offline"} />
        </header>
        {isLoading && !data ? (
          <div className="client-dashboard__skeleton" aria-hidden>
            <div className="client-dashboard__skeletonCard" />
            <div className="client-dashboard__skeletonCard" />
            <div className="client-dashboard__skeletonCard" />
            <div className="client-dashboard__skeletonCard" />
          </div>
        ) : (
          <HeroMetrics metrics={data?.hero ?? []} />
        )}
      </section>

      <section className="neo-panel client-dashboard__panel" aria-labelledby="client-timeline-heading">
        <header className="neo-panel__header client-dashboard__panelHeader">
          <div className="neo-panel__meta">
            <h2 id="client-timeline-heading" className="neo-panel__title">
              Evolução de sessões
            </h2>
            <p className="neo-panel__subtitle">Comparação diária de sessões agendadas, realizadas e canceladas.</p>
          </div>
          <div className="client-dashboard__panelActions">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`neo-button neo-button--ghost neo-button--small${range === option.value ? " is-active" : ""}`}
                onClick={() => handleRangeChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </header>
        {timelineData.length ? (
          <div className="client-dashboard__chart">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={timelineData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--neo-border-muted)" />
                <XAxis dataKey="day" tickFormatter={(value: string) => value.slice(5)} stroke="var(--neo-text-muted)" />
                <YAxis allowDecimals={false} stroke="var(--neo-text-muted)" width={32} />
                <Tooltip content={<TimelineTooltip />} />
                <Area type="monotone" dataKey="scheduled" stackId="1" stroke="#7C3AED" fill="rgba(124,58,237,0.18)" name="Agendadas" />
                <Area type="monotone" dataKey="completed" stackId="2" stroke="#22C55E" fill="rgba(34,197,94,0.18)" name="Realizadas" />
                <Area type="monotone" dataKey="cancelled" stackId="3" stroke="#F97316" fill="rgba(249,115,22,0.18)" name="Canceladas" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="client-dashboard__empty" role="status">
            <p className="client-dashboard__emptyText">Sem dados suficientes para mostrar a evolução no período seleccionado.</p>
          </div>
        )}
      </section>

      <div className="client-dashboard__columns">
        <section className="neo-panel client-dashboard__panel" aria-labelledby="client-plan-heading">
          <header className="neo-panel__header client-dashboard__panelHeader">
            <div className="neo-panel__meta">
              <h2 id="client-plan-heading" className="neo-panel__title">
                Plano activo
              </h2>
              <p className="neo-panel__subtitle">Resumo do ciclo em acompanhamento e principais destaques.</p>
            </div>
          </header>
        {data?.plan ? (
          <div className="client-dashboard__plan">
            <div className="client-dashboard__planHeader">
              <h3 className="client-dashboard__planTitle">{data.plan.title}</h3>
              <p className="client-dashboard__planStatus">{data.plan.status}</p>
            </div>
            <dl className="client-dashboard__planStats">
              <div>
                <dt>Início</dt>
                <dd>{data.plan.startDate ? new Date(data.plan.startDate).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" }) : "—"}</dd>
              </div>
              <div>
                <dt>Fim</dt>
                <dd>{data.plan.endDate ? new Date(data.plan.endDate).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" }) : "—"}</dd>
              </div>
              <div>
                <dt>Progresso</dt>
                <dd>{data.plan.progressPct !== null ? `${data.plan.progressPct}%` : "—"}</dd>
              </div>
              <div>
                <dt>PT responsável</dt>
                <dd>{data.plan.trainerName ?? "—"}</dd>
              </div>
            </dl>
            {data.plan.summary ? <p className="client-dashboard__planSummary">{data.plan.summary}</p> : null}
          </div>
        ) : (
          <div className="client-dashboard__empty" role="status">
            <p className="client-dashboard__emptyTitle">Ainda não tens um plano activo.</p>
            <p className="client-dashboard__emptyText">Contacta o teu PT para receberes um novo plano personalizado.</p>
          </div>
        )}
        <HighlightsList highlights={data?.highlights ?? []} />
        </section>

        <section className="neo-panel client-dashboard__panel" aria-labelledby="client-measurements-heading">
          <header className="neo-panel__header client-dashboard__panelHeader">
            <div className="neo-panel__meta">
              <h2 id="client-measurements-heading" className="neo-panel__title">
                Métricas corporais
              </h2>
              <p className="neo-panel__subtitle">Acompanha as últimas medições de peso e composição corporal.</p>
            </div>
          </header>
          {data?.measurements?.current ? (
            <div className="client-dashboard__measurementCurrent">
              <div>
                <p className="client-dashboard__measurementTitle">Última medição</p>
                <p className="client-dashboard__measurementValue">
                  {data.measurements.current.weightKg !== null
                    ? `${data.measurements.current.weightKg.toFixed(1)} kg`
                    : "—"}
                </p>
              </div>
              <div className="client-dashboard__measurementTrend">
                <span>
                  {data.measurements.trend?.weight ?? data.measurements.trend?.bodyFat ?? "Sem variação"}
                </span>
              </div>
            </div>
          ) : null}
          <MeasurementsTimeline points={data?.measurements?.timeline ?? []} />
        </section>
      </div>

      <div className="client-dashboard__columns">
        <section className="neo-panel client-dashboard__panel" aria-labelledby="client-sessions-heading">
          <header className="neo-panel__header client-dashboard__panelHeader">
            <div className="neo-panel__meta">
              <h2 id="client-sessions-heading" className="neo-panel__title">
                Próximas sessões
              </h2>
              <p className="neo-panel__subtitle">Organiza as sessões confirmadas e os próximos passos.</p>
            </div>
          </header>
          <SessionsList sessions={data?.sessions ?? []} />
        </section>

        <section className="neo-panel client-dashboard__panel" aria-labelledby="client-wallet-heading">
          <header className="neo-panel__header client-dashboard__panelHeader">
            <div className="neo-panel__meta">
              <h2 id="client-wallet-heading" className="neo-panel__title">
                Carteira
              </h2>
              <p className="neo-panel__subtitle">Saldo disponível e movimentos recentes para reservas e pacotes.</p>
            </div>
          </header>
          {data?.wallet ? (
            <div className="client-dashboard__wallet">
              <div className="client-dashboard__walletSummary">
                <span className="client-dashboard__walletLabel">Saldo actual</span>
                <span className="client-dashboard__walletValue">{formatCurrency(data.wallet.balance, data.wallet.currency)}</span>
                <span className="client-dashboard__walletHint">
                  Actualizado {data.wallet.updatedAt ? new Date(data.wallet.updatedAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" }) : "recentemente"}
                </span>
              </div>
              <WalletEntries entries={data.wallet.entries} currency={data.wallet.currency ?? "EUR"} />
            </div>
          ) : (
            <div className="client-dashboard__empty" role="status">
              <p className="client-dashboard__emptyText">Sem carteira configurada para este cliente.</p>
            </div>
          )}
        </section>
      </div>

      <section className="neo-panel client-dashboard__panel" aria-labelledby="client-notifications-heading">
        <header className="neo-panel__header client-dashboard__panelHeader">
          <div className="neo-panel__meta">
            <h2 id="client-notifications-heading" className="neo-panel__title">
              Últimas notificações
            </h2>
            <p className="neo-panel__subtitle">Mantém-te a par das novidades enviadas pela tua equipa.</p>
          </div>
        </header>
        {data?.notifications?.items?.length ? (
          <ul className="client-dashboard__notificationList" role="list">
            {data.notifications.items.map((notification) => (
              <li key={notification.id} className="client-dashboard__notification">
                <div>
                  <p className="client-dashboard__notificationTitle">{notification.title}</p>
                  <span className="client-dashboard__notificationMeta">{notification.relative}</span>
                </div>
                <span className="client-dashboard__notificationBadge" data-tone={notification.read ? "muted" : "accent"}>
                  {notification.read ? "Lida" : "Nova"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="client-dashboard__empty" role="status">
            <p className="client-dashboard__emptyText">Sem notificações recentes.</p>
          </div>
        )}
      </section>

      <section className="neo-panel client-dashboard__panel" aria-labelledby="client-recommendations-heading">
        <header className="neo-panel__header client-dashboard__panelHeader">
          <div className="neo-panel__meta">
            <h2 id="client-recommendations-heading" className="neo-panel__title">
              Recomendações
            </h2>
            <p className="neo-panel__subtitle">Próximos passos sugeridos para maximizar resultados.</p>
          </div>
        </header>
        {data?.recommendations?.length ? (
          <ul className="client-dashboard__recommendations" role="list">
            {data.recommendations.map((item) => (
              <li key={item.id} className="client-dashboard__recommendation" data-tone={item.tone}>
                {item.icon ? (
                  <span className="client-dashboard__recommendationIcon" aria-hidden>
                    {item.icon}
                  </span>
                ) : null}
                <p>{item.message}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="client-dashboard__empty" role="status">
            <p className="client-dashboard__emptyText">Sem recomendações adicionais no momento.</p>
          </div>
        )}
      </section>
    </div>
  );
}
