// src/app/(app)/dashboard/system/page.tsx
"use client";

import * as React from "react";
type Sys = { node?: string; next?: string; env?: string[]; now: string };

export default function SystemInfoPage() {
  const [data, setData] = React.useState<Sys | null>(null);
  React.useEffect(() => {
    fetch("/api/system/info", { cache: "no-store" }).then(r => r.json()).then(j => setData(j?.data ?? null));
  }, []);
  return (
    <main className="fp-page" style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 6 }}>Sistema</h1>
      <p style={{ color: "var(--muted)", marginBottom: 12 }}>Informação básica de runtime.</p>
      <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg)", padding: 12 }}>
        <div>Node: <b>{data?.node ?? "—"}</b></div>
        <div>Next.js: <b>{data?.next ?? "—"}</b></div>
        <div>Now: <b>{data?.now}</b></div>
      </div>
    </main>
  );
}
