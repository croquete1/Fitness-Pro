"use client";

import * as React from "react";

type Check = { id: string; label: string; ok: boolean; info?: any; error?: string };
type Result = { ok: boolean; summary: { ok: boolean; failed: string[] }; checks: Check[] };

export default function SystemHealthPage() {
  const [data, setData] = React.useState<Result | null>(null);
  const [loading, setLoading] = React.useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/system/health", { cache: "no-store" });
      const json = (await res.json()) as Result;
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load();
  }, []);

  return (
    <main className="fp-page" style={{ padding: "1rem" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0 }}>Health do Sistema</h1>
        <span
          style={{
            padding: "4px 10px",
            borderRadius: 999,
            fontSize: 12,
            border: "1px solid var(--border)",
            background: data?.ok ? "var(--ok-bg, rgba(16,185,129,.12))" : "var(--err-bg, rgba(239,68,68,.12))",
            color: data?.ok ? "var(--ok-fg, #10b981)" : "var(--err-fg, #ef4444)",
          }}
        >
          {loading ? "A carregar…" : data?.ok ? "OK" : "Intervenção necessária"}
        </span>
        <div style={{ marginLeft: "auto" }}>
          <button className="fp-pill" onClick={() => void load()}>🔄 <span className="label" style={{ marginLeft: 6 }}>Re-testar</span></button>
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gap: 10,
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        }}
      >
        {(loading || !data) && (
          <Card>
            <strong>Checks</strong>
            <div style={{ color: "var(--muted)" }}>A carregar…</div>
          </Card>
        )}

        {data?.checks.map((c) => (
          <Card key={c.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span aria-hidden>{c.ok ? "✅" : "❌"}</span>
              <strong>{c.label}</strong>
            </div>
            {!c.ok && c.error && (
              <div style={{ color: "var(--err-fg, #ef4444)", marginTop: 6, fontSize: 13 }}>{c.error}</div>
            )}
            {c.info && (
              <pre
                style={{
                  marginTop: 8,
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: 8,
                  maxHeight: 220,
                  overflow: "auto",
                  fontSize: 12,
                }}
              >
                {JSON.stringify(c.info, null, 2)}
              </pre>
            )}
          </Card>
        ))}
      </div>
    </main>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section
      style={{
        border: "1px solid var(--border)",
        background: "var(--bg)",
        borderRadius: 12,
        padding: 12,
        minHeight: 90,
      }}
    >
      {children}
    </section>
  );
}
