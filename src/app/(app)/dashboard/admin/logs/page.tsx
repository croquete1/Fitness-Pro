// src/app/(app)/dashboard/admin/logs/page.tsx
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Search = {
  kind?: string;        // AuditKind
  actor?: string;       // actorId
  targetType?: string;  // 'User' | 'Session' | ...
  targetId?: string;

  planAction?: string;  // PlanAction
  trainer?: string;     // trainerId
  client?: string;      // clientId
  planId?: string;      // planId
};

export default async function AdminLogsPage({ searchParams }: { searchParams: Search }) {
  const [audits, planChanges] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        ...(searchParams.kind ? { kind: searchParams.kind as any } : {}),
        ...(searchParams.actor ? { actorId: searchParams.actor } : {}),
        ...(searchParams.targetType ? { targetType: searchParams.targetType } : {}),
        ...(searchParams.targetId ? { targetId: searchParams.targetId } : {}),
      },
      include: { actor: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.planChangeLog.findMany({
      where: {
        ...(searchParams.planAction ? { action: searchParams.planAction as any } : {}),
        ...(searchParams.trainer ? { trainerId: searchParams.trainer } : {}),
        ...(searchParams.client ? { clientId: searchParams.client } : {}),
        ...(searchParams.planId ? { planId: searchParams.planId } : {}),
      },
      include: {
        trainer: { select: { id: true, name: true, email: true } },
        client:  { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
  ]);

  return (
    <div className="page" style={{ display:'grid', gap:24 }}>
      <h1>Registos</h1>

      {/* AUDITORIA */}
      <section className="card" style={{ padding:16 }}>
        <h2 style={{ marginBottom:12 }}>Auditoria</h2>
        <form action="/dashboard/admin/logs" method="GET"
          style={{ display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:8, marginBottom:12 }}>
          <input name="kind" placeholder="kind (ex: ACCOUNT_STATUS_CHANGE)" defaultValue={searchParams.kind ?? ''}/>
          <input name="actor" placeholder="actorId" defaultValue={searchParams.actor ?? ''}/>
          <input name="targetType" placeholder="targetType (ex: User)" defaultValue={searchParams.targetType ?? ''}/>
          <input name="targetId" placeholder="targetId" defaultValue={searchParams.targetId ?? ''}/>
          <button className="btn" type="submit" style={{ gridColumn:'1/-1' }}>Filtrar</button>
        </form>

        <div style={{ overflow:'auto' }}>
          <table className="table" style={{ width:'100%', borderCollapse:'separate', borderSpacing:0 }}>
            <thead>
              <tr>
                <th style={{textAlign:'left', padding:8}}>Quando</th>
                <th style={{textAlign:'left', padding:8}}>Kind</th>
                <th style={{textAlign:'left', padding:8}}>Mensagem</th>
                <th style={{textAlign:'left', padding:8}}>Ator</th>
                <th style={{textAlign:'left', padding:8}}>Target</th>
                <th style={{textAlign:'left', padding:8}}>Diff</th>
              </tr>
            </thead>
            <tbody>
              {audits.map(a => (
                <tr key={a.id} style={{ borderTop:'1px solid var(--border)' }}>
                  <td style={{ padding:8 }}>{a.createdAt.toISOString()}</td>
                  <td style={{ padding:8 }}>{a.kind}</td>
                  <td style={{ padding:8 }}>{a.message}</td>
                  <td style={{ padding:8 }}>{a.actor ? (a.actor.name ?? a.actor.email ?? a.actor.id) : '—'}</td>
                  <td style={{ padding:8 }}>{a.targetType ?? '—'}{a.targetId ? `#${a.targetId}` : ''}</td>
                  <td style={{ padding:8 }}>
                    <pre style={{ margin:0, whiteSpace:'pre-wrap', maxWidth:520, overflow:'auto' }}>
                      {JSON.stringify(a.diff ?? null, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
              {audits.length === 0 && (
                <tr><td colSpan={6} style={{ padding:8, color:'var(--muted)' }}>Sem registos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* PLANOS */}
      <section className="card" style={{ padding:16 }}>
        <h2 style={{ marginBottom:12 }}>Planos de Treino — Alterações</h2>
        <form action="/dashboard/admin/logs" method="GET"
          style={{ display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:8, marginBottom:12 }}>
          <input name="planAction" placeholder="action (CREATE|UPDATE|DELETE)" defaultValue={searchParams.planAction ?? ''}/>
          <input name="trainer" placeholder="trainerId" defaultValue={searchParams.trainer ?? ''}/>
          <input name="client" placeholder="clientId" defaultValue={searchParams.client ?? ''}/>
          <input name="planId" placeholder="planId" defaultValue={searchParams.planId ?? ''}/>
          <button className="btn" type="submit" style={{ gridColumn:'1/-1' }}>Filtrar</button>
        </form>

        <div style={{ overflow:'auto' }}>
          <table className="table" style={{ width:'100%', borderCollapse:'separate', borderSpacing:0 }}>
            <thead>
              <tr>
                <th style={{textAlign:'left', padding:8}}>Quando</th>
                <th style={{textAlign:'left', padding:8}}>Ação</th>
                <th style={{textAlign:'left', padding:8}}>Plano</th>
                <th style={{textAlign:'left', padding:8}}>PT</th>
                <th style={{textAlign:'left', padding:8}}>Cliente</th>
                <th style={{textAlign:'left', padding:8}}>Diff</th>
              </tr>
            </thead>
            <tbody>
              {planChanges.map(c => (
                <tr key={c.id} style={{ borderTop:'1px solid var(--border)' }}>
                  <td style={{ padding:8 }}>{c.createdAt.toISOString()}</td>
                  <td style={{ padding:8 }}>{c.action}</td>
                  <td style={{ padding:8 }}>{c.planId}</td>
                  <td style={{ padding:8 }}>{c.trainer?.name ?? c.trainer?.email ?? c.trainerId}</td>
                  <td style={{ padding:8 }}>{c.client?.name ?? c.client?.email ?? c.clientId}</td>
                  <td style={{ padding:8 }}>
                    <pre style={{ margin:0, whiteSpace:'pre-wrap', maxWidth:520, overflow:'auto' }}>
                      {JSON.stringify(c.diff, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
              {planChanges.length === 0 && (
                <tr><td colSpan={6} style={{ padding:8, color:'var(--muted)' }}>Sem registos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
