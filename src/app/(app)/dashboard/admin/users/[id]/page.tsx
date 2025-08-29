// Admin -> Ficha do utilizador
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import Empty from '@/components/ui/Empty';

type Me = { id: string; role: Role };

async function loadUser(id: string) {
  const sb = createServerClient();
  // tenta supabase
  const { data: su } = await sb.from('users').select('id,name,email,role,phone').eq('id', id).maybeSingle();
  if (su) return { ...su, source: 'sb' as const };

  // fallback prisma (caso não exista na SB)
  const pu = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });
  if (!pu) return null;
  return { id: pu.id, name: pu.name, email: pu.email, role: pu.role, phone: null, source: 'prisma' as const };
}

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as unknown as Me;
  if (!me?.id) redirect('/login');
  if (me.role !== Role.ADMIN) redirect('/dashboard');

  const u = await loadUser(params.id);
  if (!u) redirect('/dashboard');

  const sb = createServerClient();

  // planos onde é trainer OU client
  const [{ data: plansT }, { data: plansC }] = await Promise.all([
    sb.from('training_plans').select('id,title,status,updated_at,client_id').eq('trainer_id', u.id).order('updated_at', { ascending: false }).limit(20),
    sb.from('training_plans').select('id,title,status,updated_at,trainer_id').eq('client_id', u.id).order('updated_at', { ascending: false }).limit(20),
  ]);

  const { data: packages } = await sb
    .from('client_packages')
    .select('id,package_name,status,trainer_id,client_id,start_date,end_date')
    .or(`trainer_id.eq.${u.id},client_id.eq.${u.id}`)
    .order('start_date', { ascending: false })
    .limit(20);

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div className="card" style={{ padding: 12, display: 'grid', gap: 6 }}>
        <h1 style={{ margin: 0 }}>Utilizador</h1>
        <div style={{ display: 'grid', gap: 4 }}>
          <div><strong>Nome:</strong> {u.name ?? '—'}</div>
          <div><strong>Email:</strong> {u.email ?? '—'}</div>
          <div><strong>Telefone:</strong> {u.phone ?? '—'}</div>
          <div><strong>Role:</strong> <span className="badge">{u.role}</span></div>
        </div>
      </div>

      <div className="card" style={{ padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Planos onde é Treinador</h3>
        {!plansT?.length ? (
          <Empty icon="💤" title="Sem planos" desc="Este utilizador não tem planos como treinador." />
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
              {plansT!.map((p: any) => (
                <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: 8 }}>{p.title ?? `Plano #${p.id}`}</td>
                  <td style={{ padding: 8 }}><span className="chip">{p.status}</span></td>
                  <td style={{ padding: 8 }}>{p.updated_at ? new Date(p.updated_at).toLocaleString() : '—'}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>
                    <Link href={`/dashboard/pt/plans/${p.id}/edit`} className="btn chip">Editar</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Planos onde é Cliente</h3>
        {!plansC?.length ? (
          <Empty icon="🧭" title="Nada por aqui" desc="Sem planos atribuídos a este utilizador como cliente." />
        ) : (
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8 }}>Título</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Estado</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Atualizado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {plansC!.map((p: any) => (
                <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: 8 }}>{p.title ?? `Plano #${p.id}`}</td>
                  <td style={{ padding: 8 }}><span className="chip">{p.status}</span></td>
                  <td style={{ padding: 8 }}>{p.updated_at ? new Date(p.updated_at).toLocaleString() : '—'}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>
                    <Link href={`/dashboard/pt/plans/${p.id}/edit`} className="btn chip">Abrir</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Pacotes</h3>
        {!packages?.length ? (
          <Empty icon="📦" title="Sem pacotes" desc="Não foram encontrados pacotes para este utilizador." />
        ) : (
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8 }}>Pacote</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Estado</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Período</th>
              </tr>
            </thead>
            <tbody>
              {packages!.map((p: any) => (
                <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: 8 }}>{p.package_name}</td>
                  <td style={{ padding: 8 }}><span className="chip">{p.status}</span></td>
                  <td style={{ padding: 8 }}>{p.start_date || '—'} {p.end_date ? `→ ${p.end_date}` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
