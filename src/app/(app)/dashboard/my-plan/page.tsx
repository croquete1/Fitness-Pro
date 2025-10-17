// src/app/(app)/dashboard/my-plan/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { createServerClient } from "@/lib/supabaseServer";
import { getSessionUserSafe } from "@/lib/session-bridge";
import { toAppRole } from "@/lib/roles";

type Plan = {
  id: string;
  title: string | null;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
};

export default async function MyPlanPage() {
  const sessionUser = await getSessionUserSafe();
  const me = sessionUser?.user;
  if (!me?.id) redirect("/login");
  const role = toAppRole(me.role) ?? "CLIENT";
  if (role !== "CLIENT" && role !== "ADMIN") redirect("/dashboard");

  const sb = createServerClient();

  const { data: plans } = await sb
    .from("training_plans")
    .select("id,title,status,start_date,end_date,created_at")
    .eq("client_id", me.id)
    .order("created_at", { ascending: false })
    .limit(8);

  const rows = (plans ?? []) as Plan[];

  const planIds = rows.map((plan) => plan.id);
  let rawDayRows: Array<{ plan_id: string; day_index: number; exercise_id?: string | null; id?: string | null }> = [];
  if (planIds.length > 0) {
    const { data: dayRows } = await sb
      .from("plan_day_exercises" as any)
      .select("id,plan_id,day_index,exercise_id")
      .in("plan_id", planIds);
    rawDayRows = (dayRows ?? []) as any;

    if (rawDayRows.length === 0) {
      const { data: fallbackRows } = await sb
        .from("plan_day_items" as any)
        .select("id,plan_id,day_index,exercise_id")
        .in("plan_id", planIds);
      rawDayRows = (fallbackRows ?? []) as any;
    }
  }

  const perPlanDay = new Map<string, Map<number, number>>();
  const seen = new Set<string>();
  for (const row of rawDayRows) {
    const planId = row?.plan_id as string | undefined;
    const dayIndex = typeof row?.day_index === "number" ? row.day_index : Number(row?.day_index ?? NaN);
    if (!planId || Number.isNaN(dayIndex) || dayIndex < 0 || dayIndex > 6) continue;
    const uniqKey = `${planId}-${dayIndex}-${row?.exercise_id ?? row?.id ?? ""}`;
    if (seen.has(uniqKey)) continue;
    seen.add(uniqKey);
    const map = perPlanDay.get(planId) ?? new Map<number, number>();
    map.set(dayIndex, (map.get(dayIndex) ?? 0) + 1);
    perPlanDay.set(planId, map);
  }

  const weeklyAgenda = Array.from({ length: 7 }, (_, dayIndex) => {
    const entries = rows
      .map((plan) => {
        const count = perPlanDay.get(plan.id)?.get(dayIndex) ?? 0;
        if (!count) return null;
        return { planId: plan.id, title: plan.title ?? "Plano de treino", status: plan.status, count };
      })
      .filter((entry): entry is { planId: string; title: string; status: string | null; count: number } => Boolean(entry));
    return { dayIndex, entries };
  });

  const hasAgendaEntries = weeklyAgenda.some((day) => day.entries.length > 0);
  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <div className="client-plan-shell">
      <PageHeader
        title="Os meus planos"
        subtitle="Consulta os treinos atribuídos para cada dia e abre rapidamente cada plano."
        sticky={false}
      />

      <section className="neo-panel client-agenda" aria-labelledby="client-agenda-heading">
        <div className="neo-panel__header">
          <div>
            <h2 id="client-agenda-heading" className="neo-panel__title">
              Agenda semanal
            </h2>
            <p className="neo-panel__subtitle">
              {hasAgendaEntries
                ? "Resumo do que está planeado nos próximos dias."
                : "Ainda não existem treinos atribuídos para esta semana."}
            </p>
          </div>
        </div>
        <div className="client-agenda__list">
          {weeklyAgenda.map(({ dayIndex, entries }) => {
            const isToday = dayIndex === todayIndex;
            return (
              <article key={dayIndex} className="client-agenda__day" aria-label={`Dia ${dayIndex + 1}`}>
                <header className="client-agenda__dayHeader">
                  <span className="client-agenda__dayLabel">{dayLabel(dayIndex)}</span>
                  {isToday && (
                    <span className="neo-tag" data-tone="primary">
                      Hoje
                    </span>
                  )}
                  <span className="client-agenda__divider" aria-hidden />
                </header>
                {entries.length > 0 ? (
                  <div className="client-agenda__entries">
                    {entries.map((entry) => (
                      <div key={`${entry.planId}-${dayIndex}`} className="client-agenda__entry neo-surface">
                        <div className="client-agenda__entryBody">
                          <span className="client-agenda__entryTitle">{entry.title}</span>
                          <span className="client-agenda__entryMeta">
                            {entry.count} exercício{entry.count === 1 ? "" : "s"} planeado{entry.count === 1 ? "" : "s"}
                          </span>
                        </div>
                        <Link
                          href={`/dashboard/my-plan/${entry.planId}`}
                          className="btn"
                          data-variant="secondary"
                          data-size="sm"
                        >
                          Abrir
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="client-agenda__empty">Descanso ou sem treino atribuído.</p>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="client-plan-list" aria-label="Planos disponíveis">
        {rows.length === 0 ? (
          <div className="neo-empty">
            <span className="neo-empty__icon" aria-hidden>
              📄
            </span>
            <p className="neo-empty__title">Sem planos atribuídos</p>
            <p className="neo-empty__description">
              Aguarda que o teu treinador publique um plano ou contacta-o para mais informações.
            </p>
          </div>
        ) : (
          <div className="client-plan-grid">
            {rows.map((plan) => {
              const start = plan.start_date ? new Date(plan.start_date) : null;
              const end = plan.end_date ? new Date(plan.end_date) : null;
              const created = plan.created_at ? new Date(plan.created_at) : null;
              return (
                <article key={plan.id} className="neo-surface client-plan-card" data-tone={planTone(plan.status)}>
                  <header className="client-plan-card__header">
                    <div>
                      <h3 className="client-plan-card__title">{plan.title ?? "Plano de treino"}</h3>
                      <p className="client-plan-card__subtitle">
                        {start ? `Início: ${start.toLocaleDateString("pt-PT")}` : "Sem data de início"}
                      </p>
                    </div>
                    <span className="neo-tag" data-tone={tagTone(plan.status)}>
                      {(plan.status ?? "ATIVO").toString().toUpperCase()}
                    </span>
                  </header>
                  <dl className="client-plan-card__meta">
                    <div>
                      <dt>Fim previsto</dt>
                      <dd>{end ? end.toLocaleDateString("pt-PT") : "Sem data definida"}</dd>
                    </div>
                    <div>
                      <dt>Atualização</dt>
                      <dd>{created ? created.toLocaleString("pt-PT") : "—"}</dd>
                    </div>
                  </dl>
                  <p className="client-plan-card__description">
                    Acompanha os exercícios e regista o progresso diariamente para manteres o foco.
                  </p>
                  <div className="client-plan-card__actions">
                    <Link
                      href={`/dashboard/my-plan/${plan.id}`}
                      className="btn"
                      data-variant="primary"
                      data-size="sm"
                    >
                      Abrir plano
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function dayLabel(dayIndex: number) {
  return ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"][dayIndex] ?? `Dia ${dayIndex + 1}`;
}

function planTone(status: string | null | undefined) {
  const normalized = (status ?? "").toString().toUpperCase();
  if (["ATIVO", "ACTIVE", "APPROVED", "LIVE"].includes(normalized)) return "success";
  if (["PAUSADO", "PAUSED", "PENDING", "DRAFT", "WAITING"].includes(normalized)) return "warning";
  if (["CANCELADO", "CANCELLED", "ARCHIVED", "INACTIVE"].includes(normalized)) return "danger";
  return "neutral";
}

function tagTone(status: string | null | undefined) {
  const tone = planTone(status);
  if (tone === "neutral") return "neutral";
  if (tone === "danger") return "danger";
  if (tone === "warning") return "warning";
  return "success";
}
