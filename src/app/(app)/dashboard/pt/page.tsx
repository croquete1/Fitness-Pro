export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import LiveBanners from '@/components/dashboard/LiveBanners';
import Greeting from '@/components/dashboard/Greeting';
import Link from 'next/link';
import type { Route } from 'next';

type SessionRow = { id: string; start_time: string; title?: string | null; location?: string | null; status?: string | null };
type PlanRow = { id: string; title?: string | null; status?: string | null; updated_at?: string | null };

async function safeCount(sb: ReturnType<typeof createServerClient>, table: string, build?: (q: any) => any) {
  try {
    let q = sb.from(table).select('*', { count: 'exact', head: true });
    if (build) q = build(q);
    const { count } = await q;
    return count ?? 0;
  } catch { return 0; }
}
async function safeSelect<T>(sb: ReturnType<typeof createServerClient>, table: string, build: (q: any) => any): Promise<T[]> {
  try {
    let q = sb.from(table).select('*');
    q = build(q);
    const { data } = await q;
    return (data ?? []) as T[];
  } catch { return []; }
}

export default async function PTDashboard() {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;
  if ((toAppRole(user?.role) ?? 'CLIENT') !== 'PT') {
    redirect('/dashboard' as Route);
  }

  const sb = createServerClient();
  const now = new Date();
  const in7 = new Date(now); in7.setDate(now.getDate() + 7);

  // nº clientes (= clientes com pacote com este PT) — contagem por distinct client_id
  const pkgClients = await safeSelect<{ client_id: string }>(sb, 'client_packages', (q) =>
    q.eq('trainer_id', user.id).select('client_id').limit(5000)
  );
  const clientCount = new Set(pkgClients.map(p => p.client_id).filter(Boolean)).size;

  const sessionsNext7 = await safeCount(sb, 'sessions', (q) =>
    q.eq('trainer_id', user.id)
     .gte('start_time', now.toISOString())
     .lt('start_time', in7.toISOString())
  );

  const plansActive = await safeCount(sb, 'training_plans', (q) =>
    q.eq('trainer_id', user.id).eq('status', 'ACTIVE')
  );

  const upcoming = await safeSelect<SessionRow>(sb, 'sessions', (q) =>
    q.eq('trainer_id', user.id)
     .gte('start_time', now.toISOString())
     .order('start_time', { ascending: true })
     .limit(6)
     .select('id,start_time,title,location,status')
  );

  const recentPlans = await safeSelect<PlanRow>(sb, 'training_plans', (q) =>
    q.eq('trainer_id', user.id)
     .order('updated_at', { ascending: false })
     .limit(5)
     .select('id,title,status,updated_at')
  );

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <Greeting name={user?.name} role="PT" />
      <LiveBanners />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
        <div className="card" style={{ padding: 12 }}>
          <div className="text-muted small">Clientes ativos</div>
          <div style={{ fontSize: 36, fontWeight: 900 }}>{clientCount}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="text-muted small">Planos ativos</div>
          <div style={{ fontSize: 36, fontWeight: 900 }}>{plansActive}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="text-muted small">Sessões (próx. 7 dias)</div>
          <div style={{ fontSize: 36, fontWeight: 900 }}>{sessionsNext7}</div>
        </div>
      </div>

      {/* Próximas sessões */}
      <div className="card" style={{ padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Próximas sessões</h3>
        {upcoming.length === 0 ? (
          <div className="text-muted small">Sem sessões agendadas.</div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
            {upcoming.map((s) => (
              <li key={s.id} style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <div>
                    <strong>{s.title || 'Sessão'}</strong>
                    <div className="text-muted small">
                      {new Date(s.start_time).toLocaleString('pt-PT')}
                      {s.location ? ` · ${s.location}` : ''}
                    </div>
                  </div>
                  <span className="chip">{s.status ?? 'AGENDADA'}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div style={{ marginTop: 10 }}>
          <Link className="btn chip" href={'/dashboard/pt/sessions/calendar' as Route}>📅 Abrir calendário</Link>
        </div>
      </div>

      {/* Últimos planos editados */}
      <div className="card" style={{ padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Últimos planos editados</h3>
        {recentPlans.length === 0 ? (
          <div className="text-muted small">Sem planos recentes.</div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
            {recentPlans.map((p) => (
              <li key={p.id} style={{ borderTop: '1px solid var(--border)', paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{p.title ?? `Plano #${p.id}`}</strong>
                  <span className="chip" style={{ marginInlineStart: 8 }}>{p.status ?? '—'}</span>
                </div>
                <span className="text-muted small">
                  {p.updated_at ? new Date(p.updated_at).toLocaleString('pt-PT') : '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Atalhos */}
      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link className="btn chip" href={'/dashboard/pt/clients' as Route}>🧑‍🤝‍🧑 Clientes</Link>
          <Link className="btn chip" href={'/dashboard/pt/plans' as Route}>📝 Planos</Link>
          <Link className="btn chip" href={'/dashboard/pt/sessions/calendar' as Route}>📅 Calendário</Link>
          <Link className="btn chip" href={'/dashboard/pt/settings' as Route}>⚙️ Definições</Link>
        </div>
      </div>
    </div>
  );
}
