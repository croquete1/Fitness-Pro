export const dynamic = 'force-dynamic';

import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import CloneButton from '@/components/plan/CloneButton';
import Link from 'next/link';

export default async function Page() {
  const me = await getSessionUser();
  if (!me) redirect('/login');
  if (toAppRole(me.role) !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();
  const { data: plans } = await sb
    .from('training_plans')
    .select('id,title,updated_at,trainer_id,client_id')
    .order('updated_at', { ascending: false })
    .limit(50);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Planos (Admin)</h1>
        <Link href="/dashboard/admin/plans/new" className="btn primary">Novo plano</Link>
      </div>

      <div className="card" style={{ padding: 12 }}>
        {!plans?.length ? (
          <div className="text-muted">Sem planos.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
            {plans.map((p: any) => (
              <li key={p.id} className="card" style={{ padding: 12, display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.title ?? `Plano #${p.id}`}
                    </div>
                    <div style={{ fontSize: 12, opacity: .7 }}>
                      Atualizado: {p.updated_at ? new Date(p.updated_at).toLocaleString('pt-PT') : '—'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link href={`/dashboard/pt/plans/${p.id}/edit`} className="btn chip">Editar</Link>
                    <CloneButton planId={p.id} title={p.title} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}