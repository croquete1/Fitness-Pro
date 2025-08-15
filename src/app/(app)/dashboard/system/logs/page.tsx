"use client";

import * as React from "react";

type Log = {
  id: string;
  action: string;
  target?: string | null;
  createdAt: string;
  actorEmail?: string | null;
};

export default function LogsPage() {
  const [rows, setRows] = React.useState<Log[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filtros
  const [q, setQ] = React.useState("");
  const [from, setFrom] = React.useState<string>(""); // YYYY-MM-DD
  const [to, setTo] = React.useState<string>("");     // YYYY-MM-DD
  const [limit, setLimit] = React.useState<number>(100);

  async function load(withFilters = true) {
    setLoading(true);
    setError(null);
    try {
      const usp = new URLSearchParams();
      if (withFilters) {
        if (q.trim()) usp.set("q", q.trim());
        if (from) usp.set("from", from);
        if (to) usp.set("to", to);
        if (limit) usp.set("limit", String(limit));
      } else {
        usp.set("limit", "100");
      }

      const res = await fetch(`/api/system/logs?${usp.toString()}`, { cache: "no-store" });
      let json: any = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }
      const data = Array.isArray(json?.data) ? (json.data as Log[]) : [];
      setRows(data);
      if (json && json.ok === false) setError(json.error ?? "Falha a obter logs.");
    } catch {
      setError("Falha a obter logs.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Presets rápidos
  function setPreset(days: number) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    setFrom(start.toISOString().slice(0, 10));
    setTo(end.toISOString().slice(0, 10));
  }

  return (
    <main className="fp-page" style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 6 }}>Logs</h1>

      {/* Barra de filtros */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Procurar por ação, alvo ou email do ator…"
          style={{
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "8px 10px",
            minWidth: 280,
            background: "transparent",
            color: "inherit",
          }}
        />

        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "var(--muted)" }}>De</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 8px", background: "transparent", color: "inherit" }}
          />
        </label>

        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "var(--muted)" }}>Até</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 8px", background: "transparent", color: "inherit" }}
          />
        </label>

        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "var(--muted)" }}>Limite</span>
          <input
            type="number"
            min={1}
            max={200}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={{ width: 80, border: "1px solid var(--border)", borderRadius: 8, padding: "6px 8px", background: "transparent", color: "inherit" }}
          />
        </label>

        <div style={{ display: "inline-flex", gap: 6 }}>
          <button className="fp-pill" onClick={() => void load(true)} title="Aplicar filtros">
            🔍 <span className="label" style={{ marginLeft: 6 }}>Filtrar</span>
          </button>
          <button
            className="fp-pill"
            onClick={() => {
              setQ(""); setFrom(""); setTo(""); setLimit(100);
              void load(false);
            }}
            title="Limpar filtros"
          >
            ♻️ <span className="label" style={{ marginLeft: 6 }}>Limpar</span>
          </button>
        </div>

        <div style={{ display: "inline-flex", gap: 6, marginLeft: "auto" }}>
          <button className="fp-pill" onClick={() => setPreset(1)} title="Hoje">📅 <span className="label" style={{ marginLeft: 6 }}>Hoje</span></button>
          <button className="fp-pill" onClick={() => setPreset(7)} title="Últimos 7 dias">7d</button>
          <button className="fp-pill" onClick={() => setPreset(30)} title="Últimos 30 dias">30d</button>
        </div>
      </div>

      {/* Tabela */}
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 12,
          background: "var(--bg)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead style={{ background: "var(--panel, var(--bg))" }}>
            <tr>
              <Th>Quando</Th>
              <Th>Ação</Th>
              <Th>Ator</Th>
              <Th>Alvo</Th>
            </tr>
          </thead>
          <tbody>
            {loading && <TRow colSpan={4}>A carregar…</TRow>}
            {!loading && error && <TRow colSpan={4}>{error}</TRow>}
            {!loading && !error && rows.length === 0 && <TRow colSpan={4}>Sem logs.</TRow>}
            {!loading &&
              !error &&
              rows.map((l) => (
                <tr key={l.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <Td>{new Date(l.createdAt).toLocaleString("pt-PT")}</Td>
                  <Td>{l.action}</Td>
                  <Td>{l.actorEmail ?? "—"}</Td>
                  <Td>{l.target ?? "—"}</Td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 10 }}>
        <button className="fp-pill" onClick={() => void load(true)}>
          🔄 <span className="label" style={{ marginLeft: 6 }}>Atualizar</span>
        </button>
      </div>
    </main>
  );
}

const Th = (p: any) => (
  <th
    style={{
      textAlign: "left",
      padding: "10px 14px",
      borderBottom: "1px solid var(--border)",
      fontWeight: 700,
    }}
    {...p}
  />
);
const Td = (p: any) => <td style={{ padding: "10px 14px" }} {...p} />;
const TRow = ({ colSpan, children }: any) => (
  <tr>
    <td colSpan={colSpan} style={{ padding: 16, color: "var(--muted)" }}>
      {children}
    </td>
  </tr>
);
