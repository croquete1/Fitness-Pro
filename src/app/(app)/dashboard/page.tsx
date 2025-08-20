import React from "react";

type Stats = {
  role: "admin" | "pt" | "client";
  viewerId: string | null;
  counts: { clients: number; trainers: number; admins: number; sessionsNext7d: number };
  trend7d: Array<{ date: string; sessions: number }>;
  upcomingSessions: Array<any>;
  notifications: Array<any>;
};

async function getStats(): Promise<Stats> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/dashboard/stats`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Falha a carregar estatísticas");
  return res.json();
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1>Boa tarde, {stats.role === "admin" ? "Admin" : stats.role === "pt" ? "Treinador" : "Cliente"} 👋</h1>

      <div className="card" style={{ padding: 16, marginTop: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <Stat label="Clientes" value={stats.counts.clients} />
          <Stat label="Treinadores" value={stats.counts.trainers} />
          <Stat label="Admins" value={stats.counts.admins} />
          <Stat label="Sessões (próx. 7d)" value={stats.counts.sessionsNext7d} />
        </div>
      </div>

      {/* mantém os teus restantes cartões/gráficos */}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800 }}>{value}</div>
    </div>
  );
}
