// src/app/(app)/dashboard/pt/clients/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { createServerClient } from '@/lib/supabaseServer';
import PackageEditor from '@/components/packages/PackageEditor';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function listPackagesByTrainer(trainerId: string) {
  const sb = createServerClient();
  const { data, error } = await sb
    .from('client_packages')
    .select('*')
    .eq('trainer_id', trainerId)
    .order('created_at', { ascending: false });

  return error ? [] : (data ?? []);
}

async function usersByIds(ids: string[]) {
  if (!ids.length) return {};
  const sb = createServerClient();
  const { data } = await sb.from('users').select('id,name,email').in('id', ids);
  const map: Record<string, any> = {};
  for (const u of (data ?? [])) map[u.id] = u;
  return map;
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;

  if (!me?.id) redirect('/login');
  // Permitimos TRAINER e ADMIN verem esta área
  if (me.role !== Role.TRAINER && me.role !== Role.ADMIN) redirect('/dashboard');

  const pkgs = await listPackagesByTrainer(me.id);
  const ids = [...new Set(pkgs.flatMap((p: any) => [p.client_id, p.trainer_id]))];
  const mapUsers = await usersByIds(ids);

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ margin: 0 }}>Minha carteira</h1>
        {/* Criar novo pacote para este treinador (sem callbacks server→client) */}
        <PackageEditor mode="create" initial={{ trainerId: me.id }} />
      </div>

      <div className="card" style={{ padding: 12 }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8 }}>Trainer</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Cliente</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Pacote</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Sessões</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Preço</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Período</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {pkgs.map((p: any) => (
              <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: 8 }}>
                  {mapUsers[p.trainer_id]?.name || mapUsers[p.trainer_id]?.email || p.trainer_id}
                </td>
                <td style={{ padding: 8 }}>
                  {mapUsers[p.client_id]?.name || mapUsers[p.client_id]?.email || p.client_id}
                </td>
                <td style={{ padding: 8 }}>{p.package_name}</td>
                <td style={{ padding: 8 }}>
                  {p.sessions_used}/{p.sessions_total}
                </td>
                <td style={{ padding: 8 }}>
                  {((p.price_cents ?? 0) / 100).toFixed(2)} €
                </td>
                <td style={{ padding: 8 }}>
                  {p.start_date || '—'} {p.end_date ? `→ ${p.end_date}` : ''}
                </td>
                <td style={{ padding: 8 }}>
                  <span className="chip">{p.status}</span>
                </td>
                <td style={{ padding: 8 }}>
                  <PackageEditor
                    mode="edit"
                    initial={{
                      id: p.id,
                      trainerId: p.trainer_id,
                      clientId: p.client_id,
                      planId: p.plan_id,
                      packageName: p.package_name,
                      sessionsTotal: p.sessions_total,
                      sessionsUsed: p.sessions_used,
                      priceCents: p.price_cents,
                      startDate: p.start_date,
                      // NOTA: não passamos endDate/status porque não fazem parte do tipo do PackageEditor
                      notes: p.notes,
                    }}
                  />
                </td>
              </tr>
            ))}

            {!pkgs.length && (
              <tr>
                <td colSpan={8} style={{ padding: 16, opacity: 0.7 }}>
                  Ainda não tens clientes/pacotes — usa o botão “Criar pacote” no topo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
