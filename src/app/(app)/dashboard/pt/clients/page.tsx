"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Status = "PENDING" | "ACTIVE" | "SUSPENDED";
type Client = {
  id: string;
  name: string | null;
  email: string | null;
  status?: Status;
  createdAt?: string | null;
};

export default function PTClientsPage() {
  const [rows, setRows] = useState<Client[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const timer = useRef<number | null>(null);
  function debouncedSearch(v: string) {
    setQ(v);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => load(v), 250);
  }

  async function load(query = q) {
    setLoading(true);
    setErr(null);
    try {
      const sp = new URLSearchParams();
      if (query.trim()) sp.set("q", query.trim());
      sp.set("limit", "50");
      const resp = await fetch(`/api/pt/clients?${sp.toString()}`, { cache: "no-store" });
      if (!resp.ok) throw new Error(`Falha ao carregar (${resp.status})`);
      const json = await resp.json();
      setRows(Array.isArray(json.data) ? json.data : []);
    } catch (e: any) {
      setErr(e?.message ?? "Erro ao carregar clientes");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = rows.length;
  const statusCount = useMemo(
    () => ({
      ACTIVE: rows.filter((r) => r.status === "ACTIVE").length,
      PENDING: rows.filter((r) => r.status === "PENDING").length,
      SUSPENDED: rows.filter((r) => r.status === "SUSPENDED").length,
    }),
    [rows]
  );

  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Clientes</h1>
        <input
          type="search"
          placeholder="Pesquisar cliente por nome ou email…"
          defaultValue={q}
          onChange={(e) => debouncedSearch(e.target.value)}
          className="pill"
          style={{ padding: "10px 12px", minWidth: 280 }}
        />
      </div>

      {/* Cards rápidos */}
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <div className="card" style={{ padding: 12 }}><div className="text-muted" style={{ fontSize: 12 }}>Total</div><div style={{ fontWeight: 800, fontSize: 22 }}>{total}</div></div>
        <div className="card" style={{ padding: 12 }}><div className="text-muted" style={{ fontSize: 12 }}>Ativos</div><div style={{ fontWeight: 800, fontSize: 22 }}>{statusCount.ACTIVE}</div></div>
        <div className="card" style={{ padding: 12 }}><div className="text-muted" style={{ fontSize: 12 }}>Pendentes</div><div style={{ fontWeight: 800, fontSize: 22 }}>{statusCount.PENDING}</div></div>
        <div className="card" style={{ padding: 12 }}><div className="text-muted" style={{ fontSize: 12 }}>Suspensos</div><div style={{ fontWeight: 800, fontSize: 22 }}>{statusCount.SUSPENDED}</div></div>
      </div>

      {err && <div className="badge-danger" style={{ padding: 8, borderRadius: 10 }}>{err}</div>}

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr className="text-muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: .3 }}>
              <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>Nome</th>
              <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>Email</th>
              <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>Estado</th>
              <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>Criado</th>
              <th style={{ textAlign: "right", padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 16, textAlign: "center" }} className="text-muted">
                  Sem resultados.
                </td>
              </tr>
            )}
            {rows.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "10px 12px" }}><strong>{c.name ?? "—"}</strong></td>
                <td style={{ padding: "10px 12px" }}>{c.email ?? "—"}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span className="badge" style={{ background: "var(--brand)", color: "#fff", padding: "2px 8px", borderRadius: 999, fontWeight: 800, fontSize: 11 }}>
                    {c.status ?? "ACTIVE"}
                  </span>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <span className="text-muted" style={{ fontSize: 12 }}>
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                  </span>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <a className="pill" href={`/dashboard/pt/clients/${encodeURIComponent(c.id)}`} style={{ padding: "6px 10px" }}>Ver</a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
