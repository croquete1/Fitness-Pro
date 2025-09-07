// src/app/(app)/dashboard/clients/page.tsx
export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import LiveBanners from '@/components/dashboard/LiveBanners';
import Link from 'next/link';
import type { Route } from 'next';
import GreetingHeader from '@/components/dashboard/GreetingHeader';

type Plan = { id: string; title?: string | null; status?: string | null; updated_at?: string | null };
type SessionRow = { id: string; start_time: string; title?: string | null; location?: string | null; status?: string | null };

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

export default async function ClientDashboardPage() {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;
  if (!user?.id) redirect('/login' as Route);

  const role = toAppRole(user.role) ?? 'CLIENT';
  if (role !== 'CLIENT') redirect('/dashboard' as Route);

  const sb = createServerClient();

  const now = new Date();
  const in7 = new Date(now); in7.setDate(now.getDate() + 7);

  const sessions7d = await safeCount(sb, 'sessions', (q) =>
    q.eq('client_id', user.id).gte('start_time', now.toISOString()).lt('start_time', in7.toISOString())
  );
  const unread = await safeCount(sb, 'messages', (q) => q.eq('to_id', user.id).eq('read', false));
  const plans = await safeSelect<Plan>(sb, 'training_plans', (q) =>
    q.eq('client_id', user.id).order('updated_at', { ascending: false }).limit(1).select('id,title,status,updated_at')
  );
  const activePlan = plans[0];
  const upcoming = await safeSelect<SessionRow>(sb, 'sessions', (q) =>
    q.eq('client_id', user.id).gte('start_time', now.toISOString()).order('start_time', { ascending: true }).limit(6).select('id,start_time,title,location,status')
  );

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <GreetingHeader name={user.name} role="CLIENT" />

      <LiveBanners />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
        <div className="card" style={{ padding: 12 }}>
          <div className="text-muted small">Plano</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>
            {activePlan ? (activePlan.title || `Plano #${activePlan.id}`) : '—'}
          </div>
          <div className="text-muted small" style={{ marginTop: 4 }}>
            {activePlan ? `Estado: ${activePlan.status ?? '—'}` : 'Sem plano associado'}
          </div>
          <div style={{ marginTop: 8 }}>
            <Link className="btn chip" href={'/dashboard/my-plan' as Route}>Abrir plano</Link>
          </div>
        </div>

        <div className="card" style={{ padding: 12 }}>
          <div className="text-muted small">Sessões (próx. 7 dias)</div>
          <div style={{ fontSize: 36, fontWeight: 900 }}>{sessions7d}</div>
          <div style={{ marginTop: 8 }}>
            <Link className="btn chip" href={'/dashboard/sessions' as Route}>Ver sessões</Link>
          </div>
        </div>

        <div className="card" style={{ padding: 12 }}>
          <div className="text-muted small">Mensagens por ler</div>
          <div style={{ fontSize: 36, fontWeight: 900 }}>{unread}</div>
          <div style={{ marginTop: 8 }}>
            <Link className="btn chip" href={'/dashboard/messages' as Route}>Abrir mensagens</Link>
          </div>
        </div>
      </div>

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
      </div>

      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link className="btn chip" href={'/dashboard/profile' as Route}>👤 Perfil</Link>
          <Link className="btn chip" href={'/dashboard/clients' as Route}>📒 Documentação</Link>
          <Link className="btn chip" href={'/dashboard/search' as Route}>🔎 Pesquisar</Link>
        </div>
      </div>
    </div>
  );
}
