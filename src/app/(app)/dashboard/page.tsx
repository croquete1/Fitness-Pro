// src/app/(app)/dashboard/page.tsx
import { absoluteUrl } from "@/lib/absolute-url";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ApiStats = {
  role: "ADMIN" | "TRAINER" | "CLIENT";
  sessionsToday: number;
  sessionsNext7Days: number;
  pendingApprovals: number;
  totals: { clients: number; trainers: number };
  upcoming: { id: string; scheduledAt: string; status: string; client?: { name?: string } }[];
};

async function getStats(): Promise<ApiStats> {
  const url = absoluteUrl("/api/dashboard/stats");
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao carregar estatísticas");
  return res.json();
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions).catch(() => null);
  const name = (session?.user as any)?.name ?? "Utilizador";

  const data = await getStats();
  const isTrainer = data.role === "TRAINER";
  const isAdmin = data.role === "ADMIN";

  return (
    <div className="grid gap-4">
      <h1 style={{ margin: 0 }}>
        Boa tarde, {name} <span aria-hidden>👋</span>
      </h1>

      {/* Cards topo */}
      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12 }}
      >
        <div className="card" style={{ padding: 16 }}>
          <div className="text-muted small">Sessões hoje</div>
          <div style={{ fontWeight: 800, fontSize: 24 }}>{data.sessionsToday}</div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="text-muted small">Próximos 7 dias</div>
          <div style={{ fontWeight: 800, fontSize: 24 }}>{data.sessionsNext7Days}</div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="text-muted small">Clientes</div>
          <div style={{ fontWeight: 800, fontSize: 24 }}>{data.totals?.clients ?? 0}</div>
        </div>

        {/* Para ADMIN mostra treinadores; para TRAINER mantemos mas fica “1 (tu)” já vindo da API */}
        <div className="card" style={{ padding: 16 }}>
          <div className="text-muted small">{isAdmin ? "Treinadores" : "Treinadores (equipa/tu)"}</div>
          <div style={{ fontWeight: 800, fontSize: 24 }}>{data.totals?.trainers ?? 0}</div>
        </div>
      </div>

      {/* Blocos secundários */}
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "2fr 1fr" }}>
        <div className="card" style={{ padding: 16, minHeight: 160 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Próximas sessões</div>
          {(!data.upcoming || data.upcoming.length === 0) && (
            <div className="text-muted">Sem sessões planeadas.</div>
          )}
          {Array.isArray(data.upcoming) && data.upcoming.length > 0 && (
            <div className="grid" style={{ gap: 8 }}>
              {data.upcoming.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    gap: 8,
                    borderTop: "1px solid var(--border)",
                    paddingTop: 8,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{s.client?.name ?? "—"}</div>
                  <div className="text-muted small">
                    {new Date(s.scheduledAt).toLocaleString()}
                  </div>
                  <div className="text-muted small">{s.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 16, minHeight: 160 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            {isAdmin ? "Aprovações pendentes" : "Notas"}
          </div>
          {isAdmin ? (
            <div style={{ fontSize: 28, fontWeight: 800 }}>
              {data.pendingApprovals ?? 0}
            </div>
          ) : (
            <div className="text-muted" style={{ fontSize: 14 }}>
              Tudo a correr bem por aqui.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
