import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function doSearch(q: string) {
  const sb = createServerClient();
  const like = `%${q}%`;

  const [users, plans, packages] = await Promise.all([
    sb.from('users')
      .select('id,name,email,role')
      .or(`name.ilike.${like},email.ilike.${like}`),
    sb.from('training_plans')
      .select('id,title,status,client_id,trainer_id,updated_at')
      .ilike('title', like),
    sb.from('client_packages')
      .select('id,package_name,status,client_id,trainer_id')
      .ilike('package_name', like),
  ]);

  return {
    users: users.data ?? [],
    plans: plans.data ?? [],
    packages: packages.data ?? [],
  };
}

export default async function Page({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams?.q ?? '').toString().trim();
  const results = q ? await doSearch(q) : { users: [], plans: [], packages: [] };

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1>Resultados de “{q || '—'}”</h1>

      {!q ? (
        <div className="card" style={{ padding:12 }}><div className="text-gray-600">Escreve algo na pesquisa acima.</div></div>
      ) : (
        <>
          <div className="card" style={{ padding:12 }}>
            <h3 style={{ marginTop:0 }}>Utilizadores</h3>
            {results.users.length === 0 ? <div className="text-gray-600">Sem resultados.</div> : (
              <ul style={{ margin:0, paddingLeft:18 }}>
                {results.users.map((u:any) => (
                  <li key={u.id}>
                    {u.name || u.email} — <span className="chip">{u.role}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card" style={{ padding:12 }}>
            <h3 style={{ marginTop:0 }}>Planos</h3>
            {results.plans.length === 0 ? <div className="text-gray-600">Sem resultados.</div> : (
              <ul style={{ margin:0, paddingLeft:18 }}>
                {results.plans.map((p:any) => (
                  <li key={p.id}>
                    <a className="btn chip" href={`/dashboard/pt/plans/${p.id}`}>{p.title || `Plano #${p.id}`}</a>
                    &nbsp; <span className="badge">{p.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card" style={{ padding:12 }}>
            <h3 style={{ marginTop:0 }}>Pacotes</h3>
            {results.packages.length === 0 ? <div className="text-gray-600">Sem resultados.</div> : (
              <ul style={{ margin:0, paddingLeft:18 }}>
                {results.packages.map((p:any) => (
                  <li key={p.id}>
                    {p.package_name} — <a className="btn chip" href={`/dashboard/admin/clients`}>abrir lista</a>
                    &nbsp; <span className="badge">{p.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
