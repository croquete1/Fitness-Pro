// src/app/(app)/dashboard/admin/plans/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole, isAdmin } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import AdminPlanForm from '@/components/plans/AdminPlanForm';

type PlanRow = {
  id: string;
  title: string | null;
  status: string | null;
  updated_at: string | null;
  trainer_id: string | null;
  client_id: string | null;
};

async function listAdminTemplates(): Promise<PlanRow[]> {
  const sb = createServerClient();
  // “Template” = sem trainer nem client; fica disponível para atribuir a PTs
  const { data, error } = await sb
    .from('training_plans')
    .select('id,title,status,updated_at,trainer_id,client_id')
    .is('trainer_id', null)
    .is('client_id', null)
    .order('updated_at', { ascending: false })
    .limit(100);

  if (error) return [];
  return data ?? [];
}

export default async function AdminPlansPage() {
  const user = await getSessionUser();
  const role = user ? toAppRole((user as any).role) : null;
  if (!user?.id) redirect('/login');
  if (!role || !isAdmin(role)) redirect('/dashboard');

  const templates = await listAdminTemplates();

  return (
    <div style={{ padding: 16, display: 'grid', gap: 16 }}>
      <div className="card" style={{ padding: 12 }}>
        <h1 style={{ margin: 0 }}>Planos (Admin)</h1>
        <p style={{ marginTop: 8, color: 'var(--muted)' }}>
          Cria templates de planos (sem PT/cliente) para os personal trainers usarem e clonarem.
        </p>
      </div>

      <div className="card" style={{ padding: 12 }}>
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Novo template de plano</h2>
        <AdminPlanForm />
      </div>

      <div className="card" style={{ padding: 12 }}>
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Templates existentes</h2>

        {templates.length === 0 ? (
          <div style={{ color: 'var(--muted)' }}>Ainda não tens templates.</div>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: 8,
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            }}
          >
            {templates.map((p) => (
              <div
                key={p.id}
                className="card"
                style={{ padding: 12, border: '1px solid var(--border)' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>
                    {p.title || `Template #${p.id.slice(0, 6)}`}
                  </div>
                  <span className="chip">{p.status || 'ACTIVE'}</span>
                </div>
                <div style={{ marginTop: 6, color: 'var(--muted)', fontSize: 12 }}>
                  Atualizado:{' '}
                  {p.updated_at
                    ? new Date(p.updated_at).toLocaleString('pt-PT')
                    : '—'}
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <a
                    className="btn chip"
                    href={`/dashboard/pt/plans/${p.id}/edit`}
                    title="Editar no editor de planos"
                  >
                    Editar
                  </a>
                  <a
                    className="btn"
                    href={`/dashboard/pt/plans/new?from=${p.id}`}
                    title="Clonar para um PT"
                  >
                    Clonar p/ PT
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}