// Lista de planos (ADMIN vê todos; TRAINER vê os seus)
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import { createServerClient } from '@/lib/supabaseServer';

type Me = { id: string; role: Role };

async function listPlans(me: Me) {
  const sb = createServerClient();
  const q = sb.from('training_plans').select('id,title,status,updated_at,trainer_id,client_id').order('updated_at', { ascending: false });
  if (me.role === Role.TRAINER) q.eq('trainer_id', me.id);
  const { data, error } = await q.limit(50);
  return error ? [] : (data ?? []);
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  const me = session?.user as unknown as Me;
  if (!me?.id) redirect('/login');
  if (me.role !== Role.ADMIN && me.role !== Role.TRAINER) redirect('/dashboard');


  const rows = await listPlans(me);

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Planos de treino</h1>
        <Link href="/dashboard/pt/plans/new" className="btn primary">Novo plano</Link>
      </div>

      <div className="card" style={{ padding: 12 }}>
        {rows.length === 0 ? (
          <div className="text-muted">Sem planos ainda.</div>
        ) : (
          <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8 }}>Título</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Estado</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Atualizado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((p: any) => (
                <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: 8 }}>{p.title ?? `Plano #${p.id}`}</td>
                  <td style={{ padding: 8 }}><span className="chip">{p.status}</span></td>
                  <td style={{ padding: 8 }}>{p.updated_at ? new Date(p.updated_at).toLocaleString() : '—'}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>
                    <Link href={`/dashboard/pt/plans/${p.id}/edit`} className="btn chip">Editar</Link>
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
