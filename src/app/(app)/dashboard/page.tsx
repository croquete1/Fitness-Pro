// src/app/(app)/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PTDashboard from "./PTDashboard";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Stats = {
  counts?: { clients?: number; trainers?: number; admins?: number };
  sessions7d?: number;
  pt?: {
    activeClients?: number;
    todaySessions?: number;
    upcomingSessions?: number;
    newClients7d?: number;
    tasksDue?: number;
    messagesUnread?: number;
    sessionsToday?: { id: string; client: string; time?: string; date?: string; type?: string }[];
    upcoming?: { id: string; client: string; time?: string; date?: string; type?: string }[];
  };
};

function getBaseUrl() {
  try {
    const h = headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "https";
    if (host) return `${proto}://${host}`;
  } catch {}
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

async function fetchStats(): Promise<Stats> {
  const base = getBaseUrl();
  try {
    const r = await fetch(`${base}/api/dashboard/stats`, { cache: "no-store" });
    if (r.ok) return r.json();
  } catch {}
  return {};
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions).catch(() => null);
  const role = String(
    (session as any)?.user?.role ?? (session as any)?.role ?? "CLIENT"
  ).toUpperCase();

  const stats = await fetchStats();

  if (role === "TRAINER") {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <h1 style={{ margin: 0 }}>
          Boa tarde, {(session?.user as any)?.name ?? "PT"} <span aria-hidden>👋</span>
        </h1>
        <PTDashboard stats={stats} />
      </div>
    );
  }

  // Admin / outros
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h1 style={{ margin: 0 }}>
        Boa tarde, {(session?.user as any)?.name ?? "Admin"} <span aria-hidden>👋</span>
      </h1>

      <div className="card" style={{ padding: 12 }}>
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(4, minmax(0,1fr))",
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: "var(--muted-fg)" }}>Clientes</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>
              {stats?.counts?.clients ?? 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted-fg)" }}>Treinadores</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>
              {stats?.counts?.trainers ?? 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted-fg)" }}>Admins</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>
              {stats?.counts?.admins ?? 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted-fg)" }}>Sessões (próx. 7d)</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>
              {stats?.sessions7d ?? 0}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 12, minHeight: 160 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>
          Tendência de sessões (7 dias)
        </div>
        <div className="text-muted" style={{ fontSize: 14 }}>
          Atualizado em tempo real
        </div>
      </div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "2fr 1fr" }}>
        <div className="card" style={{ padding: 12, minHeight: 140 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Próximas sessões</div>
          <div className="text-muted" style={{ fontSize: 14 }}>
            {/* Quando houver lista no /api/dashboard/stats para admin, renderiza aqui. */}
            Sem sessões marcadas para os próximos dias.
          </div>
        </div>
        <div className="card" style={{ padding: 12, minHeight: 140 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Notificações</div>
          <div className="text-muted" style={{ fontSize: 14 }}>
            Sem novas notificações.
          </div>
        </div>
      </div>
    </div>
  );
}
