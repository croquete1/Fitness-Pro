// src/app/(app)/dashboard/search/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { Role } from '@prisma/client';

type Me = { id: string; role: Role };

// Constrói um padrão seguro para ILIKE
function like(q: string) {
  return `%${q.replace(/[%_]/g, (m) => '\\' + m)}%`;
}

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

    // users: nome/email/phone (ajusta o nome da coluna se for 'phone_number')
    sb
      .from('users')
      .select('id,name,email,role,phone')
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

  // Todos os clientes associados a este PT (via client_packages)
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

    // users: apenas clientes deste PT + o próprio PT (útil para auto-pesquisa)
    (async () => {
      const base = sb.from('users').select('id,name,email,role,phone');
      if (clientIds.length === 0) return { data: [] as any[] };
      return base
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
          {/* Utilizadores (Clientes & Treinadores) */}
          <div className="card" style={{ padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Pessoas</h3>
            {results.users.length === 0 ? (
              <div className="text-muted">Sem resultados.</div>
            ) : (
              <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8 }}>Nome</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Telefone</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {results.users.map((u: any) => (
                    <tr key={u.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: 8 }}>{u.name ?? '—'}</td>
                      <td style={{ padding: 8 }}>{u.email ?? '—'}</td>
                      <td style={{ padding: 8 }}>{u.phone ?? u.phone_number ?? '—'}</td>
                      <td style={{ padding: 8 }}>{u.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

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
                      <td style={{ padding: 8 }}><span className="chip">{p.status}</span></td>
                      <td style={{ padding: 8 }}>{p.updated_at ? new Date(p.updated_at).toLocaleString() : '—'}</td>
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
                      <td style={{ padding: 8 }}><span className="chip">{p.status}</span></td>
                      <td style={{ padding: 8 }}>{p.start_date || '—'} {p.end_date ? <>→ {p.end_date}</> : null}</td>
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
