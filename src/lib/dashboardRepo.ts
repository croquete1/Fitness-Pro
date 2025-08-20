/**
 * Ligação de estatísticas ao Prisma, com fallback para nomes de modelos/campos.
 *
 * ⚙️ Ajusta aqui se o teu schema tiver outros nomes:
 *  - MODELOS:
 *      USERS_MODEL            → "user"
 *      SESSIONS_MODELS_TRY    → ["trainingSession","session","workoutSession","appointment","booking"]
 *      NOTIFICATIONS_TRY      → ["notification","notifications"]
 *  - CAMPOS DE DATA DA SESSÃO (usados para filtros por intervalo):
 *      SESSION_DATE_FIELDS_TRY → ["date","startAt","startsAt","scheduledAt","start","dateTime"]
 */

import { prisma } from "./prisma";

// ----- CONFIG AJUSTÁVEL -----
const USERS_MODEL = "user";
const SESSIONS_MODELS_TRY = [
  "trainingSession",
  "session",
  "workoutSession",
  "appointment",
  "booking",
];
const NOTIFICATIONS_TRY = ["notification", "notifications"];
const SESSION_DATE_FIELDS_TRY = [
  "date",
  "startAt",
  "startsAt",
  "scheduledAt",
  "start",
  "dateTime",
];

// Helpers básicos
type DateRange = { from: Date; to: Date };
const addDays = (d: Date, days: number) =>
  new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const iso = (d: Date) => d.toISOString().slice(0, 10);

// Detecta primeiro modelo existente
function pickModel(candidates: string[]) {
  const db = prisma as any;
  for (const name of candidates) {
    const m = db?.[name];
    if (m && typeof m.count === "function") return name;
  }
  return undefined;
}

// Testa qual campo de data existe num modelo de sessões
async function pickDateField(sessionModel: string): Promise<string | undefined> {
  const db = prisma as any;
  for (const f of SESSION_DATE_FIELDS_TRY) {
    try {
      await db[sessionModel].count({ where: { [f]: { not: null } } });
      return f;
    } catch {
      /* next */
    }
  }
  return undefined;
}

// COUNT genérico
async function countSessionsBetween(
  sessionModel: string,
  dateField: string,
  range: DateRange,
  whereExtra: Record<string, any> = {}
): Promise<number> {
  const db = prisma as any;
  try {
    const n = await db[sessionModel].count({
      where: {
        [dateField]: { gte: range.from, lt: range.to },
        ...whereExtra,
      },
    });
    return n ?? 0;
  } catch {
    return 0;
  }
}

// LIST próximas sessões (máx N)
async function listUpcomingSessions(
  sessionModel: string,
  dateField: string,
  from: Date,
  whereExtra: Record<string, any> = {},
  take = 5
): Promise<Array<{ id: string; date: string; title?: string }>> {
  const db = prisma as any;
  try {
    const rows: any[] = await db[sessionModel].findMany({
      where: { [dateField]: { gte: from }, ...whereExtra },
      orderBy: { [dateField]: "asc" },
      take,
      select: {
        id: true,
        [dateField]: true,
        client: { select: { name: true } },
        coach: { select: { name: true } },
        title: true,
      },
    });

    return rows.map((r) => ({
      id: String(r.id),
      date: new Date(r[dateField]).toISOString(),
      title: r.title ?? r?.client?.name ?? r?.coach?.name ?? undefined,
    }));
  } catch {
    return [];
  }
}

// NOTIFICAÇÕES por utilizador
async function listNotifications(userId: string, notifModel?: string, take = 5) {
  if (!notifModel) return [];
  const db = prisma as any;
  try {
    const rows: any[] = await db[notifModel].findMany({
      where: { userId },
      take,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, createdAt: true },
    });
    return rows.map((n) => ({
      id: String(n.id),
      title: n.title ?? "Notificação",
      createdAt: new Date(n.createdAt).toISOString(),
    }));
  } catch {
    return [];
  }
}

// CONTAGENS de utilizadores por role
async function countUsersByRole() {
  const db = prisma as any;
  try {
    const [admins, trainers, clients] = await Promise.all([
      db[USERS_MODEL]?.count?.({ where: { role: "admin" } }) ?? 0,
      db[USERS_MODEL]?.count?.({ where: { role: "pt" } }) ?? 0,
      db[USERS_MODEL]?.count?.({ where: { role: "client" } }) ?? 0,
    ]);
    return { admins: admins ?? 0, trainers: trainers ?? 0, clients: clients ?? 0 };
  } catch {
    return { admins: 0, trainers: 0, clients: 0 };
  }
}

// Tendência diária (últimos N dias)
async function buildTrend(
  sessionModel: string | undefined,
  dateField: string | undefined,
  days: number,
  whereExtra: Record<string, any> = {}
) {
  const out: Array<{ date: string; sessions: number }> = [];
  if (!sessionModel || !dateField) {
    for (let i = days - 1; i >= 0; i--) {
      const d = startOfDay(addDays(new Date(), -i));
      out.push({ date: iso(d), sessions: 0 });
    }
    return out;
  }

  for (let i = days - 1; i >= 0; i--) {
    const from = startOfDay(addDays(new Date(), -i));
    const to = startOfDay(addDays(new Date(), -i + 1));
    const n = await countSessionsBetween(sessionModel, dateField, { from, to }, whereExtra);
    out.push({ date: iso(from), sessions: n });
  }
  return out;
}

/** ---------- APIs por perfil ---------- */

export async function getAdminStats(rangeDays = 7) {
  const sessionModel = pickModel(SESSIONS_MODELS_TRY);
  // 🔧 removido: const notifModel = pickModel(NOTIFICATIONS_TRY);
  const dateField = sessionModel ? await pickDateField(sessionModel) : undefined;

  const from = startOfDay(new Date());
  const to = addDays(from, rangeDays);

  const [userCounts, sessionsNext7d, trend7d, upcomingSessions] = await Promise.all([
    countUsersByRole(),
    sessionModel && dateField
      ? countSessionsBetween(sessionModel, dateField, { from, to })
      : Promise.resolve(0),
    buildTrend(sessionModel, dateField, rangeDays),
    sessionModel && dateField
      ? listUpcomingSessions(sessionModel, dateField, new Date())
      : Promise.resolve([]),
  ]);

  return {
    counts: {
      clients: userCounts.clients,
      trainers: userCounts.trainers,
      admins: userCounts.admins,
      sessionsNext7d,
    },
    trend7d,
    upcomingSessions,
    notifications: [], // Admin: preenche se tiveres um modelo global
  };
}

export async function getPTStats(viewerId: string, rangeDays = 7) {
  const sessionModel = pickModel(SESSIONS_MODELS_TRY);
  const notifModel = pickModel(NOTIFICATIONS_TRY);
  const dateField = sessionModel ? await pickDateField(sessionModel) : undefined;

  const from = startOfDay(new Date());
  const to = addDays(from, rangeDays);
  const whereCoach = { coachId: viewerId };

  async function countDistinctClients(): Promise<number> {
    const db = prisma as any;
    if (!sessionModel || !dateField) return 0;
    try {
      const rows: Array<{ clientId: string }> = await db[sessionModel].findMany({
        where: whereCoach,
        distinct: ["clientId"],
        select: { clientId: true },
      });
      return rows.length;
    } catch {
      return 0;
    }
  }

  const [clientsCount, sessionsNext7d, trend7d, upcomingSessions, notifications] = await Promise.all([
    countDistinctClients(),
    sessionModel && dateField
      ? countSessionsBetween(sessionModel, dateField, { from, to }, whereCoach)
      : Promise.resolve(0),
    buildTrend(sessionModel, dateField, rangeDays, whereCoach),
    sessionModel && dateField
      ? listUpcomingSessions(sessionModel, dateField, new Date(), whereCoach)
      : Promise.resolve([]),
    viewerId ? listNotifications(viewerId, notifModel) : Promise.resolve([]),
  ]);

  return {
    counts: {
      clients: clientsCount,
      trainers: 1,
      admins: 0,
      sessionsNext7d,
    },
    trend7d,
    upcomingSessions,
    notifications,
  };
}

export async function getClientStats(viewerId: string, rangeDays = 7) {
  const sessionModel = pickModel(SESSIONS_MODELS_TRY);
  const notifModel = pickModel(NOTIFICATIONS_TRY);
  const dateField = sessionModel ? await pickDateField(sessionModel) : undefined;

  const from = startOfDay(new Date());
  const to = addDays(from, rangeDays);
  const whereClient = { clientId: viewerId };

  async function countDistinctTrainers(): Promise<number> {
    const db = prisma as any;
    if (!sessionModel || !dateField) return 0;
    try {
      const rows: Array<{ coachId: string }> = await db[sessionModel].findMany({
        where: whereClient,
        distinct: ["coachId"],
        select: { coachId: true },
      });
      return rows.length;
    } catch {
      return 0;
    }
  }

  const [trainersCount, sessionsNext7d, trend7d, upcomingSessions, notifications] = await Promise.all([
    countDistinctTrainers(),
    sessionModel && dateField
      ? countSessionsBetween(sessionModel, dateField, { from, to }, whereClient)
      : Promise.resolve(0),
    buildTrend(sessionModel, dateField, rangeDays, whereClient),
    sessionModel && dateField
      ? listUpcomingSessions(sessionModel, dateField, new Date(), whereClient)
      : Promise.resolve([]),
    viewerId ? listNotifications(viewerId, notifModel) : Promise.resolve([]),
  ]);

  return {
    counts: {
      clients: 1,
      trainers: trainersCount,
      admins: 0,
      sessionsNext7d,
    },
    trend7d,
    upcomingSessions,
    notifications,
  };
}
