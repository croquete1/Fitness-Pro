"use client";

import { useEffect, useState } from "react";

type LogRow = {
  id: string;
  when: string;        // ISO
  action: string;
  actor?: string;
  target?: string;
  ip?: string;
  meta?: any;
};

async function fetchFirstOk(urls: string[]): Promise<any[]> {
  for (const u of urls) {
    try {
      const r = await fetch(u, { credentials: "include" });
      if (r.ok) {
        const j = await r.json();
        if (Array.isArray(j)) return j;
        if (Array.isArray((j as any).data)) return (j as any).data;
        if (Array.isArray((j as any).activities)) return (j as any).activities;
      }
    } catch {}
  }
  return [];
}

function coerce(items: any[]): LogRow[] {
  return items.map((x, i) => ({
    id: String(x.id ?? i),
    when: (x.when ?? x.createdAt ?? x.timestamp ?? new Date().toISOString()),
    action: String(x.action ?? x.type ?? x.event ?? "—"),
    actor: x.actor?.name ?? x.user?.name ?? x.userName ?? x.actorName ?? x.by ?? undefined,
    target: x.target?.name ?? x.subject?.name ?? x.entity ?? x.target ?? undefined,
    ip: x.ip ?? x.ipAddress ?? undefined,
    meta: x.meta ?? x.details ?? x.data ?? undefined,
  })).sort((a,b)=> new Date(b.when).getTime() - new Date(a.when).getTime());
}

export default function AuditLogsClient() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchFirstOk([
        "/api/admin/logs",
        "/api/system/logs",
        "/api/admin/notifications?type=audit&limit=100",
        "/api/dashboard/activities?scope=system&limit=100",
      ]);
      setRows(coerce(data));
      setLoading(false);
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ margin: "0 0 12px 0" }}>Logs de auditoria</h1>
      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead style={{ background: "var(--selection)" }}>
            <tr>
              <th style={{ textAlign:"left", padding:12 }}>Quando</th>
              <th style={{ textAlign:"left", padding:12 }}>Ação</th>
              <th style={{ textAlign:"left", padding:12 }}>Utilizador</th>
              <th style={{ textAlign:"left", padding:12 }}>Alvo</th>
              <th style={{ textAlign:"left", padding:12 }}>IP</th>
              <th style={{ textAlign:"left", padding:12, width: "40%" }}>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} style={{ padding:16 }} className="text-muted">A carregar…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={6} style={{ padding:16 }} className="text-muted">Sem registos.</td></tr>
            )}
            {rows.map(r => (
              <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding:12 }}>{new Date(r.when).toLocaleString()}</td>
                <td style={{ padding:12, fontWeight:700 }}>{r.action}</td>
                <td style={{ padding:12 }}>{r.actor ?? "—"}</td>
                <td style={{ padding:12 }}>{r.target ?? "—"}</td>
                <td style={{ padding:12 }}>{r.ip ?? "—"}</td>
                <td style={{ padding:12, fontFamily:"ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", fontSize:12, whiteSpace:"pre-wrap" }}>
                  {r.meta ? JSON.stringify(r.meta, null, 2) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
