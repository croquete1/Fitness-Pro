import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role, Status } from '@prisma/client';
import Badge from '@/components/ui/Badge';

export default async function AdminApprovalsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== Role.ADMIN) return null;

  const rows = await prisma.user.findMany({
    where: { status: Status.PENDING },
    orderBy: { createdAt: 'asc' },
    select: { id:true, name:true, email:true, role:true, createdAt:true }
  });

  return (
    <div className="card" style={{padding:16}}>
      <div className="card-head">
        <h1 style={{margin:0}}>Aprovações</h1>
        <div className="toolbar">
          <Badge variant="info">Pendentes: {rows.length}</Badge>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="muted">Sem pedidos pendentes 🎉</div>
      ) : (
        <table className="table" style={{width:'100%', borderCollapse:'separate', borderSpacing:0}}>
          <thead>
            <tr>
              <th style={{textAlign:'left',padding:8}}>Utilizador</th>
              <th style={{textAlign:'left',padding:8}}>Email</th>
              <th style={{textAlign:'left',padding:8}}>Role</th>
              <th style={{textAlign:'left',padding:8}}>Criado</th>
              <th style={{textAlign:'left',padding:8}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.id} style={{ borderTop:'1px solid var(--border)'}}>
                <td style={{padding:8}}>{r.name ?? '—'}</td>
                <td style={{padding:8}}>{r.email}</td>
                <td style={{padding:8}}>
                  <Badge variant={r.role===Role.TRAINER?'primary':'neutral'}>
                    {r.role}
                  </Badge>
                </td>
                <td style={{padding:8}}>{new Date(r.createdAt).toLocaleString()}</td>
                <td style={{padding:8, display:'flex', gap:8}}>
                  <form action={`/api/admin/approvals/${r.id}`} method="post">
                    <input type="hidden" name="op" value="approve" />
                    <button className="btn chip" type="submit">Aprovar</button>
                  </form>
                  <form action={`/api/admin/approvals/${r.id}`} method="post">
                    <input type="hidden" name="op" value="reject" />
                    <button className="btn chip" type="submit">Rejeitar</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
