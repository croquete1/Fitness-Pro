import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  const logs = await prisma.planChangeLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      trainer: { select: { name: true, email: true } },
      client: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="card" style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>Registos: Planos de Treino</h1>
      <div style={{ overflow: "auto" }}>
        <table className="table" style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>Quando</th>
              <th style={{ textAlign: "left", padding: 8 }}>Ação</th>
              <th style={{ textAlign: "left", padding: 8 }}>Plano</th>
              <th style={{ textAlign: "left", padding: 8 }}>PT</th>
              <th style={{ textAlign: "left", padding: 8 }}>Cliente</th>
              <th style={{ textAlign: "left", padding: 8 }}>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: 8 }}>{new Date(l.createdAt).toLocaleString()}</td>
                <td style={{ padding: 8 }}>{l.action}</td>
                <td style={{ padding: 8 }}>#{l.planId.slice(0, 6)}</td>
                <td style={{ padding: 8 }}>{l.trainer?.name || l.trainer?.email || "—"}</td>
                <td style={{ padding: 8 }}>{l.client?.name || l.client?.email || "—"}</td>
                <td style={{ padding: 8 }}>
                  {l.diff ? (
                    <details>
                      <summary>ver diff</summary>
                      <pre style={{ margin: 0 }}>{JSON.stringify(l.diff, null, 2)}</pre>
                    </details>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
