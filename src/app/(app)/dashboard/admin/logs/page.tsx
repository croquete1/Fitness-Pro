// server component
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';

export default async function AdminLogsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== Role.ADMIN) {
    redirect('/login');
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { actor: { select: { id: true, name: true, email: true } } },
  });

  return (
    <div className="card" style={{ padding: 16 }}>
      <h1>Audit Logs</h1>
      <table className="table" style={{ width:'100%', borderCollapse:'separate', borderSpacing:0 }}>
        <thead>
          <tr>
            <th style={{textAlign:'left',padding:8}}>Quando</th>
            <th style={{textAlign:'left',padding:8}}>Quem</th>
            <th style={{textAlign:'left',padding:8}}>Kind</th>
            <th style={{textAlign:'left',padding:8}}>Mensagem</th>
            <th style={{textAlign:'left',padding:8}}>Target</th>
            <th style={{textAlign:'left',padding:8}}>Diff</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(a => (
            <tr key={a.id} style={{ borderTop:'1px solid var(--border)' }}>
              <td style={{padding:8}}>{new Date(a.createdAt).toLocaleString()}</td>
              <td style={{padding:8}}>
                {a.actor?.name ?? a.actor?.email ?? '—'}
              </td>
              <td style={{padding:8}}>{a.kind}</td>
              <td style={{padding:8}}>{a.message}</td>
              <td style={{padding:8}}>
                {a.targetType ? `${a.targetType}:${a.targetId ?? a.target ?? ''}` : (a.target ?? '—')}
              </td>
              <td style={{padding:8}}>
                <pre style={{margin:0,whiteSpace:'pre-wrap',maxWidth:420,overflow:'auto'}}>
                  {JSON.stringify(a.diff ?? null, null, 2)}
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
