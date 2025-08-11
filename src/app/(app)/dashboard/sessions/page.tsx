// src/app/(app)/dashboard/sessions/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Role } from "@prisma/client";
import Link from "next/link";

// Geração dinâmica (evita revalidate inválido)
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Search = { trainerId?: string; view?: "list" | "calendar"; week?: string };

export default async function SessionsPage({ searchParams }: { searchParams?: Search }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const role = (session.user as any).role as "ADMIN" | "TRAINER" | "CLIENT";
  const meId = (session.user as any).id as string;

  if (!(role === "ADMIN" || role === "TRAINER")) {
    return (
      <main className="p-6">
        <p className="text-sm text-muted-foreground">Sem permissão para ver esta página.</p>
      </main>
    );
  }

  const view = (searchParams?.view ?? "list") as "list" | "calendar";
  const trainerIdParam = searchParams?.trainerId || "";

  // Admin pode filtrar por treinador; Trainer vê as suas
  const trainerFilter =
    role === "ADMIN"
      ? trainerIdParam
        ? { trainerId: trainerIdParam }
        : {}
      : { trainerId: meId };

  // Dropdown de treinadores (apenas admin)
  const trainers =
    role === "ADMIN"
      ? await prisma.user.findMany({
          where: { role: Role.TRAINER },
          select: { id: true, name: true, email: true },
          orderBy: [{ name: "asc" }, { email: "asc" }],
        })
      : [];

  // ----- Calendário: calcular semana (Seg-Dom)
  const now = new Date();
  const base = searchParams?.week ? safeDate(searchParams.week) ?? now : now;
  const weekStart = startOfWeekMonday(base);
  const weekEnd = addDays(weekStart, 7);

  // Query para LISTA (últimos 30 dias + futuro) ou CALENDÁRIO (semana ativa)
  const whereList =
    view === "list"
      ? {
          ...trainerFilter,
          scheduledAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) },
        }
      : { ...trainerFilter, scheduledAt: { gte: weekStart, lt: weekEnd } };

  const sessions = await prisma.session.findMany({
    where: whereList,
    include: {
      trainer: { select: { id: true, name: true, email: true } },
      client: { select: { id: true, name: true, email: true } },
    },
    orderBy: view === "list" ? [{ scheduledAt: "desc" }] : [{ scheduledAt: "asc" }],
    take: view === "list" ? 100 : 500,
  });

  // Agrupar por dia (para calendário)
  const days = getWeekDays(weekStart); // 7 dias
  const byDay = groupByISODate(sessions);

  // Helpers para links de navegação mantendo filtros
  const qsBase = (extra: Record<string, string>) => {
    const params = new URLSearchParams();
    if (role === "ADMIN" && trainerIdParam) params.set("trainerId", trainerIdParam);
    Object.entries(extra).forEach(([k, v]) => params.set(k, v));
    const s = params.toString();
    return s ? `?${s}` : "";
    };

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Sessões agendadas</h1>
        <Link href="/dashboard" className="text-sm underline underline-offset-4">
          Voltar ao dashboard
        </Link>
      </div>

      {/* Filtros / ações */}
      <div className="flex flex-wrap items-end gap-3">
        {role === "ADMIN" && (
          <form className="flex items-end gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs opacity-70">Filtrar por treinador</label>
              <select
                name="trainerId"
                defaultValue={trainerIdParam}
                className="rounded-md border px-3 py-2 bg-background"
              >
                <option value="">— Todos —</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name ?? t.email}
                  </option>
                ))}
              </select>
            </div>
            <input type="hidden" name="view" value={view} />
            {view === "calendar" && (
              <input type="hidden" name="week" value={toISODate(weekStart)} />
            )}
            <button type="submit" className="rounded-md border px-4 py-2 text-sm hover:shadow">
              Aplicar
            </button>
            {(trainerIdParam || view === "calendar") && (
              <Link href={`/dashboard/sessions${qsBase({ view })}`} className="text-sm underline underline-offset-4 ml-1">
                Limpar
              </Link>
            )}
          </form>
        )}

        <div className="ml-auto flex gap-2">
          <Link
            href={`/dashboard/sessions${qsBase({ view: "list" })}`}
            className={`rounded-md border px-3 py-2 text-sm ${
              view === "list" ? "bg-muted font-medium" : "hover:bg-muted/60"
            }`}
          >
            Lista
          </Link>
          <Link
            href={`/dashboard/sessions${qsBase({ view: "calendar", week: toISODate(weekStart) })}`}
            className={`rounded-md border px-3 py-2 text-sm ${
              view === "calendar" ? "bg-muted font-medium" : "hover:bg-muted/60"
            }`}
          >
            Calendário
          </Link>
        </div>
      </div>

      {/* Conteúdo */}
      {view === "list" ? (
        <div className="rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-3">Data & hora</th>
                <th className="text-left p-3">Treinador</th>
                <th className="text-left p-3">Cliente</th>
                <th className="text-left p-3">Notas</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 && (
                <tr>
                  <td className="p-3 text-muted-foreground" colSpan={4}>
                    Sem sessões a mostrar.
                  </td>
                </tr>
              )}
              {sessions.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-3">{formatDateTime(s.scheduledAt)}</td>
                  <td className="p-3">{s.trainer.name ?? s.trainer.email}</td>
                  <td className="p-3">{s.client.name ?? s.client.email}</td>
                  <td className="p-3">{s.notes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // CALENDÁRIO
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">
              Semana {formatRange(weekStart, addDays(weekStart, 6))}
            </div>
            <div className="flex gap-2">
              <Link
                href={`/dashboard/sessions${qsBase({
                  view: "calendar",
                  week: toISODate(addDays(weekStart, -7)),
                })}`}
                className="rounded-md border px-3 py-2 text-sm hover:bg-muted/60"
              >
                ◀ Semana anterior
              </Link>
              <Link
                href={`/dashboard/sessions${qsBase({
                  view: "calendar",
                  week: toISODate(addDays(weekStart, 7)),
                })}`}
                className="rounded-md border px-3 py-2 text-sm hover:bg-muted/60"
              >
                Próxima semana ▶
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {days.map((d) => {
              const key = toISODate(d);
              const daySessions = byDay.get(key) ?? [];
              return (
                <div key={key} className="rounded-xl border p-3">
                  <div className="text-sm font-medium">
                    {weekdayLabel(d)} <span className="opacity-60">· {toPTDate(d)}</span>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {daySessions.length === 0 && (
                      <li className="text-xs text-muted-foreground">Sem sessões</li>
                    )}
                    {daySessions.map((s) => (
                      <li key={s.id} className="rounded-md border px-3 py-2">
                        <div className="text-sm font-medium">{toPTHour(s.scheduledAt)}</div>
                        <div className="text-xs text-muted-foreground">
                          PT: {s.trainer.name ?? s.trainer.email}
                        </div>
                        <div className="text-xs">
                          Cliente: {s.client.name ?? s.client.email}
                        </div>
                        {s.notes && <div className="text-xs mt-1">{s.notes}</div>}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

/* ---------- helpers ---------- */
function safeDate(v?: string) {
  if (!v) return undefined;
  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : d;
}
function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfWeekMonday(d: Date) {
  const x = startOfDay(d);
  const day = x.getDay(); // 0..6 (0=Dom)
  const diff = day === 0 ? -6 : 1 - day; // mover para segunda
  return addDays(x, diff);
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function toISODate(d: Date) {
  // YYYY-MM-DD em UTC (suficiente para filtros por dia)
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
function getWeekDays(monday: Date) {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}
function groupByISODate(sessions: any[]) {
  const map = new Map<string, any[]>();
  for (const s of sessions) {
    const k = toISODate(new Date(s.scheduledAt));
    const arr = map.get(k) ?? [];
    arr.push(s);
    map.set(k, arr);
  }
  // ordenar por hora dentro do dia
  for (const [k, arr] of map.entries()) {
    arr.sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));
    map.set(k, arr);
  }
  return map;
}
function weekdayLabel(d: Date) {
  return d
    .toLocaleDateString("pt-PT", { weekday: "short" })
    .replace(".", "")
    .replace(/^./, (c) => c.toUpperCase());
}
function toPTDate(d: Date) {
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
}
function toPTHour(d: Date | string) {
  const x = new Date(d);
  return x.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
}
function formatDateTime(d: Date) {
  const x = new Date(d);
  return `${x.toLocaleDateString("pt-PT")} ${x.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}
function formatRange(a: Date, b: Date) {
  const start = a.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
  const end = b.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
  return `${start} — ${end}`;
}
