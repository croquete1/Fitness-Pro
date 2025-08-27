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

async function listMyPackages(uid: string) {
  const sb = createServerClient();
  const { data, error } = await sb
    .from('client_packages')
    .select('*')
    .eq('trainer_id', uid)
    .order('created_at', { ascending: false });
  return error ? [] : (data ?? []);
}

async function fetchUsersByIds(ids: string[]) {
  if (ids.length === 0) return {};
  const sb = createServerClient();
  const { data, error } = await sb.from('users').select('id,name,email').in('id', ids);
  if (error) return {};
  const map: Record<string, any> = {};
  for (const u of data) map[u.id] = u;
  return map;
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) redirect('/login');
  if (![Role.TRAINER, Role.ADMIN].includes(me.role)) redirect('/dashboard');

  const pkgs = await listMyPackages(me.id);
  const clientIds = [...new Set(pkgs.map((p: any) => p.client_id))];
  const clients = await fetchUsersByIds(clientIds);

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ margin: 0 }}>Minha carteira</h1>
        {/* Inline dialog de criação */}
        {/* @ts-expect-error Server/Client boundary ok */}
        <PackageEditor initial={{ trainerId: me.id }} mode="create" onClose={() => {}} />
      </div>

      <div className="card" style={{ padding: 12 }}>
        {pkgs.length === 0 ? (
          <div className="text-gray-600">Ainda não tens pacotes registados.</div>
        ) : (
          <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{textAlign:'left',padding:8}}>Cliente</th>
                <th style={{textAlign:'left',padding:8}}>Pacote</th>
                <th style={{textAlign:'left',padding:8}}>Sessões</th>
                <th style={{textAlign:'left',padding:8}}>Preço</th>
                <th style={{textAlign:'left',padding:8}}>Período</th>
                <th style={{textAlign:'left',padding:8}}>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {pkgs.map((p: any) => {
                const c = clients[p.client_id];
                return (
                  <tr key={p.id} style={{ borderTop:'1px solid var(--border)' }}>
                    <td style={{padding:8}}>{c?.name || c?.email || p.client_id}</td>
                    <td style={{padding:8}}>{p.package_name}</td>
                    <td style={{padding:8}}>{p.sessions_used}/{p.sessions_total}</td>
                    <td style={{padding:8}}>{(p.price_cents/100).toFixed(2)} €</td>
                    <td style={{padding:8}}>
                      {p.start_date || '—'} {p.end_date ? `→ ${p.end_date}` : ''}
                    </td>
                    <td style={{padding:8}}>
                      <span className="chip">{p.status}</span>
                    </td>
                    <td style={{padding:8}}>
                      {/* @ts-expect-error Server/Client boundary ok */}
                      <PackageEditor mode="edit" initial={{
                        id: p.id,
                        trainerId: p.trainer_id,
                        clientId: p.client_id,
                        planId: p.plan_id,
                        packageName: p.package_name,
                        sessionsTotal: p.sessions_total,
                        sessionsUsed: p.sessions_used,
                        priceCents: p.price_cents,
                        startDate: p.start_date,
                        endDate: p.end_date,
                        status: p.status,
                        notes: p.notes,
                      }} onClose={() => {}} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
