// src/app/(app)/dashboard/pt/plans/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function listPlans(uid: string, role: Role) {
  const sb = createServerClient();
  let q = sb.from('training_plans').select('id,title,status,client_id,updated_at,created_at,trainer_id').order('updated_at', { ascending: false });
  if (role !== Role.ADMIN) q = q.eq('trainer_id', uid);
  const { data } = await q;
  return data ?? [];
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) redirect('/login');

  const plans = await listPlans(me.id, me.role);

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ margin: 0 }}>Planos</h1>
        <a className="btn chip" href="/dashboard/pt/plans/new">+ Novo plano</a>
      </div>

      <div className="card" style={{ padding: 12 }}>
        {plans.length === 0 ? (
          <div className="text-gray-600">Ainda não tens planos.</div>
        ) : (
          <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{textAlign:'left',padding:8}}>Título</th>
                <th style={{textAlign:'left',padding:8}}>Estado</th>
                <th style={{textAlign:'left',padding:8}}>Atualizado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {plans.map((p: any) => (
                <tr key={p.id} style={{ borderTop:'1px solid var(--border)' }}>
                  <td style={{padding:8}}>{p.title ?? `Plano #${p.id}`}</td>
                  <td style={{padding:8}}><span className="chip">{p.status}</span></td>
                  <td style={{padding:8}}>{p.updated_at ? new Date(p.updated_at).toLocaleString() : '—'}</td>
                  <td style={{padding:8, display:'flex', gap:8}}>
                    <a className="btn chip" href={`/dashboard/pt/plans/${p.id}`}>Abrir</a>
                    <a className="btn chip" href={`/dashboard/pt/plans/${p.id}/edit`}>Editar</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
