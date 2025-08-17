"use client";

import React, { useEffect, useState } from "react";

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/dashboard/stats", { cache: "no-store" });
        const j = await r.json();
        setStats(j);
      } catch {}
    })();
  }, []);

  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <h1 style={{ margin: 0 }}>Relatórios</h1>

      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div className="card" style={{ padding: 16 }}>
          <div className="text-muted" style={{ fontSize: 12 }}>Sessões (próx. 7d)</div>
          <div style={{ fontWeight: 800, fontSize: 28 }}>{stats?.sessionsUpcoming ?? 0}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="text-muted" style={{ fontSize: 12 }}>Novos registos</div>
          <div style={{ fontWeight: 800, fontSize: 28 }}>{stats?.newSignups ?? 0}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="text-muted" style={{ fontSize: 12 }}>Atividade</div>
          <div style={{ fontWeight: 800, fontSize: 28 }}>{stats?.activity ?? 0}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 16, minHeight: 240 }}>
        <div className="text-muted" style={{ marginBottom: 8 }}>Gráficos e listagens (em construção)</div>
        {/* Aqui podes ligar grafismo real quando tiveres os dados */}
      </div>
    </div>
  );
}
