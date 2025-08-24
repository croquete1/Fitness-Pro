import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { AuditKind } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  const logs = await prisma.auditLog.findMany({
    where: { kind: { in: [AuditKind.ACCOUNT_APPROVAL, AuditKind.ACCOUNT_STATUS_CHANGE, AuditKind.ACCOUNT_ROLE_CHANGE] } },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: { select: { id: true, name: true, email: true } } },
  });

  return (
    <div className="card" style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>Registos: Alterações de Conta</h1>
      <div style={{ overflow: "auto" }}>
        <table className="table" style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>Quando</th>
              <th style={{ textAlign: "left", padding: 8 }}>Ação</th>
              <th style={{ textAlign: "left", padding: 8 }}>Feita por</th>
              <th style={{ textAlign: "left", padding: 8 }}>Alvo</th>
              <th style={{ textAlign: "left", padding: 8 }}>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: 8 }}>{new Date(l.createdAt).toLocaleString()}</td>
                <td style={{ padding: 8 }}>{l.kind}</td>
                <td style={{ padding: 8 }}>{l.actor?.name || l.actor?.email || "—"}</td>
                <td style={{ padding: 8 }}>{l.targetType} #{l.targetId?.slice(0, 6)}</td>
                <td style={{ padding: 8 }}>
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{l.message}</pre>
                  {l.diff ? (
                    <details style={{ marginTop: 6 }}>
                      <summary>diferenças</summary>
                      <pre style={{ margin: 0 }}>{JSON.stringify(l.diff, null, 2)}</pre>
                    </details>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
