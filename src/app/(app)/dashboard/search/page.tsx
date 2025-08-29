// src/app/(app)/dashboard/search/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';

function like(q: string) {
  // escapa % e _ para não “partir” o ilike
  return `%${q.replace(/[%_]/g, (m) => '\\' + m)}%`;
}

async function searchAll(q: string) {
  const sb = createServerClient();
  const qLike = like(q);

  const [plans, users, packages] = await Promise.all([
    sb
      .from('training_plans')
      .select('id,title,notes,status,updated_at,trainer_id,client_id')
      .or(`title.ilike.${qLike},notes.ilike.${qLike}`)
      .order('updated_at', { ascending: false })
      .limit(10),
    sb
      .from('users')
      .select('id,name,email,role')
      .or(`name.ilike.${qLike},email.ilike.${qLike}`)
      .limit(10),
    sb
      .from('client_packages')
      .select('id,package_name,notes,status,client_id,trainer_id,start_date,end_date')
      .or(`package_name.ilike.${qLike},notes.ilike.${qLike}`)
      .order('start_date', { ascending: false })
      .limit(10),
  ]);

  return {
    plans: plans.data ?? [],
    users: users.data ?? [],
    packages: packages.data ?? [],
  };
}

export default async function Page({ searchParams }: { searchParams: { q?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const q = (searchParams?.q ?? '').trim();
  const results = q.length >= 2 ? await searchAll(q) : { plans: [], users: [], packages: [] };

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>Pesquisa</h1>

      <div className="card" style={{ padding: 12 }}>
        <div className="text-muted" style={{ fontSize: 12 }}>
          {q ? (
            <>
              Resultados para <strong>“{q}”</strong>
            </>
          ) : (
            <>Escreve algo na caixa de pesquisa acima (mín. 2 caracteres).</>
          )}
        </div>
      </div>

      {!!q && (
        <>
          {/* Planos */}
          <div className="card" style={{ padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Planos de treino</h3>
            {results.plans.length === 0 ? (
              <div className="text-muted">Sem resultados.</div>
            ) : (
              <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8 }}>Título</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Estado</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Atualizado</th>
                  </tr>
                </thead>
                <tbody>
                  {results.plans.map((p: any) => (
                    <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: 8 }}>{p.title ?? `Plano #${p.id}`}</td>
                      <td style={{ padding: 8 }}>
                        <span className="chip">{p.status}</span>
                      </td>
                      <td style={{ padding: 8 }}>
                        {p.updated_at ? new Date(p.updated_at).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Utilizadores */}
          <div className="card" style={{ padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Utilizadores</h3>
            {results.users.length === 0 ? (
              <div className="text-muted">Sem resultados.</div>
            ) : (
              <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8 }}>Nome</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {results.users.map((u: any) => (
                    <tr key={u.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: 8 }}>{u.name ?? '—'}</td>
                      <td style={{ padding: 8 }}>{u.email}</td>
                      <td style={{ padding: 8 }}>{u.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pacotes */}
          <div className="card" style={{ padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Clientes &amp; Pacotes</h3>
            {results.packages.length === 0 ? (
              <div className="text-muted">Sem resultados.</div>
            ) : (
              <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8 }}>Pacote</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Estado</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Período</th>
                  </tr>
                </thead>
                <tbody>
                  {results.packages.map((p: any) => (
                    <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: 8 }}>{p.package_name}</td>
                      <td style={{ padding: 8 }}>
                        <span className="chip">{p.status}</span>
                      </td>
                      <td style={{ padding: 8 }}>
                        {p.start_date || '—'} {p.end_date ? <>→ {p.end_date}</> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
