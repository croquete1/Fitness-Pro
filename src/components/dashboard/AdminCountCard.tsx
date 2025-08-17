"use client";

import React from "react";
import { usePoll } from "@/hooks/usePoll";

type Counts = { pending: number; active: number; suspended: number };

export default function AdminCountCard() {
  const { data, error } = usePoll<Counts>("/api/admin/approvals/count", {
    intervalMs: 30000,
    immediate: true,
    enabled: true,
    parse: async (r) => await r.json(),
  });

  const pending = data?.pending ?? 0;
  const active = data?.active ?? 0;
  const suspended = data?.suspended ?? 0;

  return (
    <div className="card" style={{ padding: 16, borderRadius: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Aprovações</div>
      {error && <div className="badge-danger">Falha ao carregar</div>}
      <div style={{ display: "flex", gap: 12 }}>
        <span className="badge">Pendentes: {pending}</span>
        <span className="badge">Ativos: {active}</span>
        <span className="badge">Suspensos: {suspended}</span>
      </div>
    </div>
  );
}
