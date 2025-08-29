export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { Role } from '@prisma/client';
import Empty from '@/components/ui/Empty';

type Me = { id: string; role: Role };

// Escapa % e _ para usar em ILIKE
function like(q: string) {
  return `%${q.replace(/[%_]/g, (m) => '\\' + m)}%`;
}
// Só dígitos (p/ procurar por telefone em fragmentos)
function onlyDigits(q: string) {
  return q.replace(/\D/g, '');
}

async function searchAdmin(sb: ReturnType<typeof createServerClient>, q: string) {
  const qLike = like(q);
  const digits = onlyDigits(q);

  const [plans, users, packages] = await Promise.all([
    sb
      .from('training_plans')
      .select('id,title,notes,status,updated_at,trainer_id,client_id')
      .or(`title.ilike.${qLike},notes.ilike.${qLike}`)
      .order('updated_at', { ascending: false })
      .limit(15),

    // users: nome/email/phone/phone_number
    sb
      .from('users')
      .select('id,name,email,role,phone,phone_number')
      .or(
        [
          `name.ilike.${qLike}`,
          `email.ilike.${qLike}`,
          digits ? `phone.ilike.%${digits}%` : '',
          digits ? `phone_number.ilike.%${digits}%` : '',
        ]
          .filter(Boolean)
          .join(',')
      )
      .limit(20),

    sb
      .from('client_packages')
      .select('id,package_name,notes,status,client_id,trainer_id,start_date,end_date')
      .or(`package_name.ilike.${qLike},notes.ilike.${qLike}`)
      .order('start_date', { ascending: false })
      .limit(15),
  ]);

  return {
    plans: plans.data ?? [],
    users: users.data ?? [],
    packages: packages.data ?? [],
  };
}

async function searchTrainer(sb: ReturnType<typeof createServerClient>, me: Me, q: string) {
  const qLike = like(q);
  const digits = onlyDigits(q);

  // Clientes deste PT (via client_packages)
  const cps = await sb
    .from('client_packages')
    .select('client_id')
    .eq('trainer_id', me.id);

  const clientIds = Array.from(new Set((cps.data ?? []).map((r: any) => r.client_id))).filter(Boolean);

  const [plans, users, packages] = await Promise.all([
    sb
      .from('training_plans')
      .select('id,title,notes,status,updated_at,trainer_id,client_id')
      .eq('trainer_id', me.id)
      .or(`title.ilike.${qLike},notes.ilike.${qLike}`)
      .order('updated_at', { ascending: false })
      .limit(15),

    (async () => {
      // Se não houver clientes, devolve vazio sem erro
      if (clientIds.length === 0) return { data: [] as any[] };
      return sb
        .from('users')
        .select('id,name,email,role,phone,phone_number')
        .in('id', [...clientIds, me.id])
        .or(
          [
            `name.ilike.${qLike}`,
            `email.ilike.${qLike}`,
            digits ? `phone.ilike.%${digits}%` : '',
            digits ? `phone_number.ilike.%${digits}%` : '',
          ]
            .filter(Boolean)
            .join(',')
        )
        .limit(20);
    })(),

    sb
      .from('client_packages')
      .select('id,package_name,notes,status,client_id,trainer_id,start_date,end_date')
      .eq('trainer_id', me.id)
      .or(`package_name.ilike.${qLike},notes.ilike.${qLike}`)
      .order('start_date', { ascending: false })
      .limit(15),
  ]);

  return {
    plans: plans.data ?? [],
    users: (users as any).data ?? [],
    packages: packages.data ?? [],
  };
}

export default async function Page({ searchParams }: { searchParams: { q?: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as unknown as Me;
  if (!me?.id) redirect('/login');

  const sb = createServerClient();

  const q = (searchParams?.q ?? '').trim();
  const hasQuery = q.length >= 2;

  const results = hasQuery
    ? me.role === Role.ADMIN
      ? await searchAdmin(sb, q)
      : await searchTrainer(sb, me, q)
    : { plans: [], users: [], packages: [] };

  const userHref = (id: string) =>
    me.role === Role.ADMIN ? `/dashboard/admin/users/${id}` : `/dashboard/pt/clients?focus=${id}`;

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>Pesquisa</h1>

      <div className="card" style={{ padding: 12 }}>
        <div className="text-muted" style={{ fontSize: 12 }}>
          {hasQuery ? (
            <>Resultados para <strong>“{q}”</strong></>
          ) : (
            <>Escreve pelo menos 2 caracteres para pesquisar por nome, email ou telefone.</>
          )}
        </div>
      </div>

      {!!hasQuery && (
        <>
          {/* Pessoas (Clientes & Treinadores) */}
          <div className="card" style={{ padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Pessoas</h3>
            {results.users.length === 0 ? (
              <Empty icon="🧑‍🤝‍🧑" title="Sem pessoas" desc="Não encontrámos ninguém com esse termo." />
            ) : (
              <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8 }}>Nome</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Telefone</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Role</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {results.users.map((u: any) => (
                    <tr key={u.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: 8 }}>
                        <Link className="link" href={userHref(u.id)} prefetch>
                          {u.name ?? '—'}
                        </Link>
                      </td>
                      <td style={{ padding: 8 }}>
                        <Link className="link" href={userHref(u.id)} prefetch>
                          {u.email ?? '—'}
                        </Link>
                      </td>
                      <td style={{ padding: 8 }}>{u.phone ?? u.phone_number ?? '—'}</td>
                      <td style={{ padding: 8 }}><span className="chip">{u.role}</span></td>
                      <td style={{ padding: 8 }}>
                        <Link className="btn" href={userHref(u.id)} prefetch>Abrir ficha</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Planos de treino */}
          <div className="card" style={{ padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Planos de treino</h3>
            {results.plans.length === 0 ? (
              <Empty icon="📝" title="Sem planos" desc="Tenta outros termos (título/notas)." />
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
                  {results.plans.map((p: any) => (
                    <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: 8 }}>
                        <Link className="link" href={`/dashboard/pt/plans/${p.id}/edit`} prefetch>
                          {p.title ?? `Plano #${p.id}`}
                        </Link>
                      </td>
                      <td style={{ padding: 8 }}><span className="chip">{p.status}</span></td>
                      <td style={{ padding: 8 }}>{p.updated_at ? new Date(p.updated_at).toLocaleString() : '—'}</td>
                      <td style={{ padding: 8 }}>
                        <Link className="btn" href={`/dashboard/pt/plans/${p.id}/edit`} prefetch>Abrir</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Clientes & Pacotes */}
          <div className="card" style={{ padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Clientes &amp; Pacotes</h3>
            {results.packages.length === 0 ? (
              <Empty icon="📦" title="Sem pacotes" desc="Pesquisa pelo nome do pacote ou notas." />
            ) : (
              <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8 }}>Pacote</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Estado</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Período</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {results.packages.map((p: any) => (
                    <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: 8 }}>{p.package_name}</td>
                      <td style={{ padding: 8 }}><span className="chip">{p.status}</span></td>
                      <td style={{ padding: 8 }}>{p.start_date || '—'} {p.end_date ? <>→ {p.end_date}</> : null}</td>
                      <td style={{ padding: 8 }}>
                        <div className="table-actions">
                          {p.client_id && (
                            <Link className="btn chip" href={userHref(p.client_id)} prefetch>Cliente</Link>
                          )}
                          {p.trainer_id && (
                            <Link className="btn chip" href={userHref(p.trainer_id)} prefetch>Treinador</Link>
                          )}
                        </div>
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
