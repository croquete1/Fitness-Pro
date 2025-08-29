// src/app/(app)/dashboard/pt/plans/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import { createServerClient } from '@/lib/supabaseServer';
import { toStatus, statusLabel } from '@/lib/status';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function Page() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) redirect('/login');
  if (![Role.ADMIN, Role.TRAINER].includes(me.role)) redirect('/dashboard');

  const sb = createServerClient();
  let rows: any[] = [];
  if (me.role === Role.ADMIN) {
    const { data } = await sb.from('training_plans').select('*').order('updated_at', { ascending: false });
    rows = data ?? [];
  } else {
    const { data } = await sb
      .from('training_plans')
      .select('*')
      .eq('trainer_id', me.id)
      .order('updated_at', { ascending: false });
    rows = data ?? [];
  }

  const plans = rows.map((p) => ({
    id: String(p.id),
    title: String(p.title ?? ''),
    trainerId: String(p.trainer_id ?? ''),
    clientId: String(p.client_id ?? ''),
    status: toStatus(p.status),
    updatedAt: p.updated_at as string | null,
    createdAt: p.created_at as string | null,
  }));

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ margin: 0 }}>Planos de treino</h1>
        <Link href="/dashboard/pt/plans/new" className="btn primary">Novo plano</Link>
      </div>

      <div className="card" style={{ padding: 12 }}>
        {plans.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📝</div>
            <div className="empty-title">Ainda não tens planos</div>
            <div className="empty-sub">Cria o primeiro plano para um cliente.</div>
            <Link href="/dashboard/pt/plans/new" className="btn primary">Criar plano</Link>
          </div>
        ) : (
          <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th className="th">Título</th>
                <th className="th">Cliente</th>
                <th className="th">Estado</th>
                <th className="th">Atualizado</th>
                <th className="th" />
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className="tr">
                  <td className="td">{p.title || `Plano #${p.id.slice(0, 6)}`}</td>
                  <td className="td mono">{p.clientId || '—'}</td>
                  <td className="td">
                    <span className={`chip ${p.status === 'ACTIVE' ? 'chip-success' : p.status === 'PENDING' ? 'chip-warn' : 'chip-danger'}`}>
                      {statusLabel(p.status)}
                    </span>
                  </td>
                  <td className="td">{p.updatedAt ? new Date(p.updatedAt).toLocaleString() : '—'}</td>
                  <td className="td">
                    <div className="row-actions">
                      <Link href={`/dashboard/pt/plans/${p.id}`} className="btn ghost">Abrir</Link>
                      <Link href={`/dashboard/pt/plans/${p.id}/edit`} className="btn">Editar</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
