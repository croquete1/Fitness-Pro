// Lista unificada de sessões (ADMIN/TRAINER/CLIENT) + agrupação Ontem/Hoje/Amanhã
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/rbac";

export const dynamic = "force-dynamic";

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function dayLabel(date: Date) {
  const today = new Date();
  const d0 = ymd(today);
  const d1 = ymd(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1));
  const dm1 = ymd(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1));
  const target = ymd(date);
  if (target === d0) return "Hoje";
  if (target === d1) return "Amanhã";
  if (target === dm1) return "Ontem";
  return date.toLocaleDateString("pt-PT", { weekday: "short", day: "2-digit", month: "short" });
}

export default async function SessionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const meId = (session.user as any).id as string;
  const role = (session.user as any).role as "ADMIN" | "TRAINER" | "CLIENT";

  const where: any = {};
  if (role === "TRAINER") where.trainerId = meId;
  if (role === "CLIENT") where.clientId = meId;
  // ADMIN vê tudo

  const rows = await prisma.session.findMany({
    where,
    include: {
      trainer: { select: { id: true, name: true, email: true } },
      client: { select: { id: true, name: true, email: true } },
    },
    orderBy: [{ scheduledAt: "asc" }],
    take: 200,
  });

  // Agrupar por dia
  const groups = rows.reduce<Record<string, typeof rows>>((acc, s) => {
    const k = ymd(s.scheduledAt);
    (acc[k] ||= []).push(s);
    return acc;
  }, {});

  const days = Object.keys(groups).sort();

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Sessões</h1>

      {days.length === 0 && (
        <div className="rounded-2xl border p-6 text-sm opacity-70">
          Sem sessões encontradas.
        </div>
      )}

      <div className="space-y-6">
        {days.map((k) => {
          const d = new Date(k + "T00:00:00");
          const label = dayLabel(d);
          const list = groups[k];
          return (
            <section key={k} className="rounded-2xl border p-0 overflow-hidden">
              <div className="px-4 py-3 border-b bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                <div className="text-sm font-medium">{label}</div>
              </div>
              <ul className="divide-y">
                {list.map((s) => (
                  <li key={s.id} className="p-4 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">
                        {s.trainer?.name ?? s.trainer?.email} → {s.client?.name ?? s.client?.email}
                      </div>
                      <div className="text-xs opacity-70">
                        {new Date(s.scheduledAt).toLocaleString("pt-PT", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                        })}{" "}
                        • estado: {s.status}
                      </div>
                    </div>
                    {isAdmin(role) || role === "TRAINER" ? (
                      <div className="text-xs opacity-60">{s.notes ?? ""}</div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
