// src/app/(app)/dashboard/users/[id]/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { createServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';

type Me = { id: string; role: Role };

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as unknown as Me;
  if (!me?.id) redirect('/login');
  if (me.role !== Role.ADMIN && me.role !== Role.TRAINER) redirect('/dashboard');

  const sb = createServerClient();
  const [{ data: uData }, { data: pkgs }, { data: plans }] = await Promise.all([
    sb.from('users').select('id,name,email,role,phone,phone_number').eq('id', params.id).single(),
    sb.from('client_packages').select('id,package_name,status,start_date,end_date,trainer_id').eq('client_id', params.id).order('start_date', { ascending: false }),
    sb.from('training_plans').select('id,title,status,updated_at,trainer_id').eq('client_id', params.id).order('updated_at', { ascending: false }),
  ]);

  const user = uData;
  if (!user) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Utilizador</h1>
        <div className="card" style={{ padding: 12 }}><div className="badge-danger">Utilizador não encontrado.</div></div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>{user.name ?? user.email}</h1>

      <div className="card" style={{ padding: 12 }}>
        <div className="grid" style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(2,minmax(0,1fr))' }}>
          <div><div className="text-muted" style={{ fontSize: 12 }}>Email</div><div>{user.email}</div></div>
          <div><div className="text-muted" style={{ fontSize: 12 }}>Telefone</div><div>{user.phone ?? user.phone_number ?? '—'}</div></div>
          <div><div className="text-muted" style={{ fontSize: 12 }}>Role</div><div><span className="chip">{user.role}</span></div></div>
        </div>
      </div>

      <div className="card" style={{ padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Pacotes</h3>
        {(pkgs ?? []).length === 0 ? (
          <div className="text-muted">Sem pacotes.</div>
        ) : (
          <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead><tr><th style={{textAlign:'left',padding:8}}>Pacote</th><th style={{textAlign:'left',padding:8}}>Estado</th><th style={{textAlign:'left',padding:8}}>Período</th></tr></thead>
            <tbody>
              {(pkgs ?? []).map((p: any) => (
                <tr key={p.id} style={{ borderTop:'1px solid var(--border)' }}>
                  <td style={{ padding:8 }}>{p.package_name}</td>
                  <td style={{ padding:8 }}><span className="chip">{p.status}</span></td>
                  <td style={{ padding:8 }}>{p.start_date || '—'} {p.end_date ? <>→ {p.end_date}</> : null}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Planos</h3>
        {(plans ?? []).length === 0 ? (
          <div className="text-muted">Sem planos.</div>
        ) : (
          <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead><tr><th style={{textAlign:'left',padding:8}}>Título</th><th style={{textAlign:'left',padding:8}}>Estado</th><th style={{textAlign:'left',padding:8}}>Atualizado</th><th/></tr></thead>
            <tbody>
              {(plans ?? []).map((p: any) => (
                <tr key={p.id} style={{ borderTop:'1px solid var(--border)' }}>
                  <td style={{ padding:8 }}>{p.title ?? `Plano #${p.id}`}</td>
                  <td style={{ padding:8 }}><span className="chip">{p.status}</span></td>
                  <td style={{ padding:8 }}>{p.updated_at ? new Date(p.updated_at).toLocaleString() : '—'}</td>
                  <td style={{ padding:8 }}><Link className="btn" href={`/dashboard/pt/plans/${p.id}/edit`}>Abrir</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
