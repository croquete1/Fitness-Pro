import prisma from '@/lib/prisma';
import Badge from '@/components/ui/Badge';
import { AuditKind } from '@prisma/client';

function kindToVariant(k: AuditKind){
  switch(k){
    case 'ACCOUNT_APPROVAL': return 'success';
    case 'ACCOUNT_ROLE_CHANGE': return 'primary';
    case 'ACCOUNT_STATUS_CHANGE': return 'info';
    default: return 'neutral';
  }
}

export default async function AdminLogsPage(){
  const rows = await prisma.auditLog.findMany({
    orderBy: { createdAt:'desc' },
    take: 200,
    include: { actor: { select: { id:true, email:true, name:true } } }
  });

  return (
    <div className="card" style={{padding:16}}>
      <div className="card-head">
        <h1 style={{margin:0}}>Registos</h1>
        <div className="toolbar">
          <Badge variant="info">Últimos {rows.length}</Badge>
        </div>
      </div>

      <table className="table" style={{width:'100%', borderCollapse:'separate', borderSpacing:0}}>
        <thead>
          <tr>
            <th style={{textAlign:'left',padding:8}}>Quando</th>
            <th style={{textAlign:'left',padding:8}}>Quem</th>
            <th style={{textAlign:'left',padding:8}}>Tipo</th>
            <th style={{textAlign:'left',padding:8}}>Mensagem</th>
            <th style={{textAlign:'left',padding:8}}>Diff</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(a=>(
            <tr key={a.id} style={{borderTop:'1px solid var(--border)'}}>
              <td style={{padding:8}}>{new Date(a.createdAt).toLocaleString()}</td>
              <td style={{padding:8}}>{a.actor?.name ?? a.actor?.email ?? '—'}</td>
              <td style={{padding:8}}>
                <Badge variant={kindToVariant(a.kind)}>{a.kind}</Badge>
              </td>
              <td style={{padding:8}}>{a.message}</td>
              <td style={{padding:8}}>
                <pre style={{margin:0, whiteSpace:'pre-wrap', maxWidth:420, overflow:'auto'}}>
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
