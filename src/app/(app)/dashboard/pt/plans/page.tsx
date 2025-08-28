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

async function listPlansFor(me: { id: string; role: Role }) {
  const sb = createServerClient();

  if (me.role === Role.ADMIN) {
    const { data, error } = await sb
      .from<SBPlan>('training_plans')
      .select('*')
      .order('updated_at', { ascending: false });
    return error ? [] : (data ?? []);
  }

  // TRAINER: só os seus planos
  const { data, error } = await sb
    .from<SBPlan>('training_plans')
    .select('*')
    .eq('trainer_id', me.id)
    .order('updated_at', { ascending: false });

  return error ? [] : (data ?? []);
}

async function usersByIds(ids: string[]) {
  if (!ids.length) return {} as Record<string, { id: string; name: string | null; email: string | null }>;
  const sb = createServerClient();
  const { data } = await sb.from('users').select('id,name,email').in('id', ids);
  const map: Record<string, { id: string; name: string | null; email: string | null }> = {};
  for (const u of (data ?? []) as any[]) map[u.id] = u;
  return map;
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;

  if (!me?.id) redirect('/login');
  // ✅ Permitir TRAINER e ADMIN nesta página
  if (me.role !== Role.TRAINER && me.role !== Role.ADMIN) redirect('/dashboard');

  const plans = await listPlansFor({ id: me.id, role: me.role });
  const uidSet = new Set<string>();
  for (const p of plans) {
    uidSet.add(p.trainer_id);
    uidSet.add(p.client_id);
  }
  const mapUsers = await usersByIds([...uidSet]);

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ margin: 0 }}>Planos de treino</h1>

        {/* Botão de criar (se já tiveres rota /dashboard/pt/plans/new) */}
        <Link href="/dashboard/pt/plans/new" className="btn">
          + Novo plano
        </Link>
      </div>

      <div className="card" style={{ padding: 12 }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8 }}>Título</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Cliente</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Trainer</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Estado</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Atualizado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => {
              const client =
                mapUsers[p.client_id]?.name ||
                mapUsers[p.client_id]?.email ||
                p.client_id;
              const trainer =
                mapUsers[p.trainer_id]?.name ||
                mapUsers[p.trainer_id]?.email ||
                p.trainer_id;
              const updated =
                p.updated_at ? new Date(p.updated_at).toLocaleString() : '—';

              return (
                <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: 8 }}>{p.title ?? `Plano #${p.id.slice(0, 6)}`}</td>
                  <td style={{ padding: 8 }}>{client}</td>
                  <td style={{ padding: 8 }}>{trainer}</td>
                  <td style={{ padding: 8 }}>
                    <span className="chip">{p.status ?? '—'}</span>
                  </td>
                  <td style={{ padding: 8 }}>{updated}</td>
                  <td style={{ padding: 8, whiteSpace: 'nowrap' }}>
                    <Link href={`/dashboard/pt/plans/${p.id}`} className="btn ghost" style={{ marginRight: 6 }}>
                      Ver
                    </Link>
                    <Link href={`/dashboard/pt/plans/${p.id}/edit`} className="btn">
                      Editar
                    </Link>
                  </td>
                </tr>
              );
            })}

            {!plans.length && (
              <tr>
                <td colSpan={6} style={{ padding: 16, opacity: 0.7 }}>
                  Não há planos ainda. Clica em “Novo plano” para criares o primeiro. 💪
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
