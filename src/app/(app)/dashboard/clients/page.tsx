import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';
import ClientPackageModal from './ClientPackageModal';

export default async function ClientsWalletPage(){
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me) return null;

  // Admin vê tudo; PT só os seus clientes; Cliente vê os seus pacotes
  let rows: any[] = [];
  if (me.role === Role.ADMIN) {
    rows = await prisma.$queryRawUnsafe(
      `select p.*, c.name as client_name, c.email as client_email, t.email as trainer_email
       from client_packages p
       left join users c on c.id = p.client_id
       left join users t on t.id = p.trainer_id
       order by p.created_at desc`
    );
  } else if (me.role === Role.TRAINER) {
    rows = await prisma.$queryRawUnsafe(
      `select p.*, c.name as client_name, c.email as client_email
       from client_packages p
       join users c on c.id = p.client_id
       where p.trainer_id = $1
       order by p.created_at desc`, me.id
    );
  } else {
    rows = await prisma.$queryRawUnsafe(
      `select p.*, t.email as trainer_email
       from client_packages p
       left join users t on t.id = p.trainer_id
       where p.client_id = $1
       order by p.created_at desc`, me.id
    );
  }

  return (
    <div className="card" style={{padding:16}}>
      <div className="card-head">
        <h1 style={{margin:0}}>Carteira de clientes</h1>
        {(me.role === Role.ADMIN || me.role === Role.TRAINER) && (
          <ClientPackageModal />
        )}
      </div>

      {rows.length === 0 ? (
        <div className="muted" style={{padding:'20px 8px'}}>Sem pacotes ainda.</div>
      ) : (
        <table className="table" style={{width:'100%', borderCollapse:'separate', borderSpacing:0}}>
          <thead>
            <tr>
              <th style={{textAlign:'left',padding:8}}>Cliente</th>
              <th style={{textAlign:'left',padding:8}}>Pacote</th>
              <th style={{textAlign:'left',padding:8}}>Sessões</th>
              <th style={{textAlign:'left',padding:8}}>Preço</th>
              <th style={{textAlign:'left',padding:8}}>Estado</th>
              <th style={{textAlign:'left',padding:8}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p:any)=>(
              <tr key={p.id} style={{ borderTop:'1px solid var(--border)'}}>
                <td style={{padding:8}}>{p.client_name ?? p.client_email ?? '—'}</td>
                <td style={{padding:8}}>{p.title}</td>
                <td style={{padding:8}}>{p.sessions_used}/{p.sessions_included}</td>
                <td style={{padding:8}}>{(p.price_cents/100).toFixed(2)} {p.currency}</td>
                <td style={{padding:8}}>{p.status}</td>
                <td style={{padding:8}}>
                  {/* Para simplificar: edição rápida via modal (próprio componente) */}
                  <ClientPackageModal existing={p}/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
