"use client";

import { useMemo } from "react";
import { useMe } from "@/hooks/useMe";
import { usePoll } from "@/hooks/usePoll";
import React from 'react';
import { greetingForDate } from "@/lib/time";

type Stats = {
  clients?: number;
  trainers?: number;
  admins?: number;
  sessions7d?: number;
  sessionsUpcoming?: number;
};

export default function DashboardClient() {
  const { user } = useMe();
  const { data: stats } = usePoll<Stats>("/api/dashboard/stats", { intervalMs: 30000 });


  const s: Stats = stats ?? {};
  const hello = useMemo(() => {
    const { label, emoji } = greetingForDate();
    const baseName = user?.name ?? "Admin";
    return `${emoji} ${label}, ${baseName}!`;
  }, [user?.name]);

  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>{hello}</h1>
        <span className="badge">bem-vindo(a) de volta</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12 }}>
        <div className="card" style={{ padding: 12 }}>
          <div className="text-muted" style={{ fontSize: 12 }}>Clientes</div>
          <div style={{ fontWeight: 800, fontSize: 28 }}>{s.clients ?? 0}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="text-muted" style={{ fontSize: 12 }}>Personal Trainers</div>
          <div style={{ fontWeight: 800, fontSize: 28 }}>{s.trainers ?? 0}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="text-muted" style={{ fontSize: 12 }}>Admins</div>
          <div style={{ fontWeight: 800, fontSize: 28 }}>{s.admins ?? 0}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="text-muted" style={{ fontSize: 12 }}>Sessões (próx. 7d)</div>
          <div style={{ fontWeight: 800, fontSize: 28 }}>{s.sessions7d ?? 0}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Tendência de sessões (7 dias)</div>
          <div className="text-muted">Atualizado em tempo real</div>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Próximas sessões</div>
            <div className="text-muted">Sem sessões marcadas para os próximos dias.</div>
          </div>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Notificações</div>
            <div className="text-muted">Sem novas notificações.</div>
          </div>
        </div>
      </div>
    
    </div>
  );
}
