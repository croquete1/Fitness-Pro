// Utilitários tolerantes ao schema para eventos/auditoria + histórico em planos

import prismaAny from "@/lib/prisma";
const prisma: any =
  (prismaAny as any).prisma ??
  (prismaAny as any).default ??
  prismaAny;

export type EventInput = {
  type: "PLAN_CREATED" | "PLAN_UPDATED" | "PLAN_ASSIGNED" | "PLAN_VIEWED";
  actorId?: string | null;
  userId?: string | null;     // utilizador alvo (ex.: cliente)
  trainerId?: string | null;  // PT relacionado
  planId?: string | null;
  meta?: any;
  createdAt?: Date;
};

const CANDIDATE_EVENT_MODELS = ["auditLog", "AuditLog", "eventLog", "EventLog", "event", "Event"];
const CANDIDATE_NOTIFICATION_MODELS = ["notification", "Notification", "adminNotification", "AdminNotification"];
const CANDIDATE_PLAN_MODELS = ["plan", "Plan", "trainingPlan", "TrainingPlan"];
const CANDIDATE_ASSIGNMENT_MODELS = ["planAssignment", "PlanAssignment", "assignment", "Assignment", "clientPlan", "ClientPlan"];

function firstModel(candidates: string[]) {
  for (const name of candidates) {
    const m = (prisma as any)[name];
    if (m && typeof m.findMany === "function") return name;
  }
  return null;
}

/* ================== Events / Notifications ================== */

export async function writeEvent(data: EventInput) {
  const payload = { ...data, createdAt: data.createdAt ?? new Date() };

  // 1) evento/auditoria
  const eventModel = firstModel(CANDIDATE_EVENT_MODELS);
  if (eventModel) {
    await (prisma as any)[eventModel].create({ data: payload }).catch(() => {});
  }

  // 2) notificação (opcional)
  const notifModel = firstModel(CANDIDATE_NOTIFICATION_MODELS);
  if (notifModel) {
    await (prisma as any)[notifModel].create({
      data: {
        type: payload.type,
        userId: payload.userId ?? null,
        trainerId: payload.trainerId ?? null,
        planId: payload.planId ?? null,
        payload: payload,  // JSON, se suportado
        createdAt: payload.createdAt,
        seenAt: null,
      },
    }).catch(() => {});
  }
}

/** Feed de eventos para dashboards (admin/PT) */
export async function fetchEventsSince(
  sinceISO?: string,
  filter?: { trainerId?: string; userId?: string }
) {
  const eventModel = firstModel(CANDIDATE_EVENT_MODELS);
  if (!eventModel) return [];

  const where: any = {};
  if (sinceISO) where.createdAt = { gte: new Date(sinceISO) };
  if (filter?.trainerId) where.trainerId = filter.trainerId;
  if (filter?.userId) where.userId = filter.userId;

  const items = await (prisma as any)[eventModel].findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return items.map((e: any) => ({
    id: e.id ?? `${e.type}-${e.createdAt}`,
    type: e.type,
    userId: e.userId ?? null,
    trainerId: e.trainerId ?? null,
    actorId: e.actorId ?? null,
    planId: e.planId ?? null,
    meta: e.meta ?? null,
    createdAt: e.createdAt,
  }));
}

/* ================== Plans (helpers) ================== */

export async function markPlanViewed(planId: string, clientId?: string | null) {
  const planModel = firstModel(CANDIDATE_PLAN_MODELS);
  if (!planModel) return;
  const now = new Date();

  // tenta campos diretos
  try {
    await (prisma as any)[planModel].update({
      where: { id: planId },
      data: { viewedAt: now, lastViewedById: clientId ?? null },
    });
  } catch {
    // fallback meta JSON
    try {
      const plan = await (prisma as any)[planModel].findUnique({ where: { id: planId } });
      const meta = { ...(plan?.meta ?? {}), viewedAt: now, lastViewedById: clientId ?? null };
      await (prisma as any)[planModel].update({ where: { id: planId }, data: { meta } });
    } catch {}
  }

  await appendPlanHistory(planId, {
    kind: "PLAN_VIEWED",
    when: now.toISOString(),
    text: "Visualizado pelo cliente",
    by: clientId ?? null,
  });
}

export async function appendPlanHistory(
  planId: string,
  entry: { kind: string; when?: string; text: string; by?: string | null; extra?: any }
) {
  const planModel = firstModel(CANDIDATE_PLAN_MODELS);
  if (!planModel) return;
  const now = new Date().toISOString();
  const item = { ...entry, when: entry.when ?? now };

  try {
    const plan = await (prisma as any)[planModel].findUnique({ where: { id: planId } });
    const meta = plan?.meta ?? {};
    const history: any[] = Array.isArray(meta.history) ? meta.history : [];
    history.unshift(item);
    await (prisma as any)[planModel].update({
      where: { id: planId },
      data: { meta: { ...meta, history } },
    });
  } catch {
    // se o schema não suportar meta JSON, ignora
  }
}

/** Tenta manter tabela de atribuições (se existir) */
export async function upsertPlanAssignment(opts: { planId: string; clientId?: string | null; trainerId?: string | null }) {
  const model = firstModel(CANDIDATE_ASSIGNMENT_MODELS);
  if (!model) return;

  const { planId, clientId = null, trainerId = null } = opts;

  try {
    const exists = await (prisma as any)[model].findFirst({ where: { planId, clientId } });
    if (exists?.id) {
      await (prisma as any)[model].update({ where: { id: exists.id }, data: { trainerId } });
    } else {
      await (prisma as any)[model].create({ data: { planId, clientId, trainerId } });
    }
  } catch {
    // esquemas diferentes — ignora
  }
}
