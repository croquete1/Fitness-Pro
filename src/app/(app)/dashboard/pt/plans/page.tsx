// src/app/(app)/dashboard/pt/plans/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

type SBPlan = {
  id: string;
  title: string | null;
  status: string | null;
  trainer_id: string;
  client_id: string;
  updated_at: string | null;
  created_at: string | null;
};

async function listPlans(me: { id: string; role: Role }) {
  const sb = createServerClient();

  if (me.role === Role.ADMIN) {
    const { data, error } = await sb
      .from('training_plans')
      .select('*')
      .order('updated_at', { ascending: false });
    return error ? [] : ((data ?? []) as SBPlan[]);
  }

  if (me.role === Role.TRAINER) {
    const { data, error } = await sb
      .from('training_plans')
      .select('*')
      .eq('trainer_id', me.id)
      .order('updated_at', { ascending: false });
    return error ? [] : ((data ?? []) as SBPlan[]);
  }

  // CLIENT
  const { data, error } = await sb
    .from('training_plans')
    .select('*')
    .eq('client_id', me.id)
    .order('updated_at', { ascending: false });
  return error ? [] : ((data ?? []) as SBPlan[]);
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) redirect('/login');

  const plans = await listPlans({ id: me.id, role: me.role });

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ margin: 0 }}>Planos de treino</h1>
        {(me.role === Role.TRAINER || me.role === Role.ADMIN) && (
          <Link href="/dashboard/pt/plans/new" className="btn primary">+ Novo plano</Link>
        )}
      </div>

      <div className="card" style={{ padding: 12 }}>
        {!plans.length ? (
          <div className="text-muted">Ainda não existem planos.</div>
        ) : (
          <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{textAlign:'left',padding:8}}>Título</th>
                <th style={{textAlign:'left',padding:8}}>Estado</th>
                <th style={{textAlign:'left',padding:8}}>Trainer</th>
                <th style={{textAlign:'left',padding:8}}>Cliente</th>
                <th style={{textAlign:'left',padding:8}}>Atualizado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} style={{ borderTop:'1px solid var(--border)' }}>
                  <td style={{padding:8}}>{p.title || `Plano #${p.id.slice(0,6)}`}</td>
                  <td style={{padding:8}}>
                    <span className={`chip ${p.status === 'ACTIVE' ? 'chip-success' : p.status === 'SUSPENDED' ? 'chip-danger' : ''}`}>
                      {p.status ?? '—'}
                    </span>
                  </td>
                  <td style={{padding:8}}>{p.trainer_id}</td>
                  <td style={{padding:8}}>{p.client_id}</td>
                  <td style={{padding:8}}>{p.updated_at ? new Date(p.updated_at).toLocaleString() : '—'}</td>
                  <td style={{padding:8, textAlign:'right'}}>
                    {(me.role === Role.TRAINER || me.role === Role.ADMIN) ? (
                      <Link href={`/dashboard/pt/plans/${p.id}/edit`} className="btn">Editar</Link>
                    ) : (
                      <Link href={`/dashboard/pt/plans/${p.id}`} className="btn ghost">Ver</Link>
                    )}
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
