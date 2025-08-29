// src/app/(app)/dashboard/pt/plans/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import { createServerClient } from '@/lib/supabaseServer';

export default async function Page() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) redirect('/login');

  // permitir ADMIN e TRAINER
  if (![Role.ADMIN, Role.TRAINER].includes(me.role)) redirect('/dashboard');

  const sb = createServerClient();

  // Admin = todos; Trainer = só os seus
  let query = sb.from('training_plans').select('id,title,status,updated_at,client_id,trainer_id');
  if (me.role === Role.TRAINER) query = query.eq('trainer_id', me.id);
  const { data } = await query.order('updated_at', { ascending: false }).limit(100);

  const plans = data ?? [];

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ margin: 0 }}>Planos de treino</h1>
        <Link className="btn primary" href="/dashboard/pt/plans/new">Novo plano</Link>
      </div>

      <div className="card" style={{ padding: 12 }}>
        {plans.length === 0 ? (
          <div className="text-muted">Ainda não existem planos.</div>
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
              {plans.map((p: any) => (
                <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: 8 }}>{p.title ?? `Plano #${p.id}`}</td>
                  <td style={{ padding: 8 }}><span className="chip">{p.status}</span></td>
                  <td style={{ padding: 8 }}>{p.updated_at ? new Date(p.updated_at).toLocaleString() : '—'}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>
                    <Link className="btn" href={`/dashboard/pt/plans/${p.id}/edit`}>Abrir</Link>
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
