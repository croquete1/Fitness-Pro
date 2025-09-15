// src/app/(app)/dashboard/sessions/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole, type AppRole } from '@/lib/roles';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import KpiCard from '@/components/dashboard/KpiCard';
import Badge from '@/components/ui/Badge';

type SessionRow = {
  id: string;
  scheduled_at: string | null;
  location: string | null;
  notes: string | null;
  trainer_id: string | null;
  client_id: string | null;
};

function fmtDT(iso: string | null) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('pt-PT');
  } catch {
    return '—';
  }
}

export default async function SessionsPage() {
  // Sessão “flat” e guard
  const viewer = await getSessionUserSafe();
  if (!viewer?.id) redirect('/login');

  const role = (toAppRole(viewer.role) ?? 'CLIENT') as AppRole;

  const sb = createServerClient();
  const now = new Date();
  const in7 = new Date(now);
  in7.setDate(now.getDate() + 7);

  // KPI: sessões nos próximos 7 dias
  async function countUpcoming() {
    try {
      let q = sb.from('sessions').select('*', { count: 'exact', head: true })
        .gte('scheduled_at', now.toISOString())
        .lt('scheduled_at', in7.toISOString());

      if (role === 'PT') q = q.eq('trainer_id', viewer.id);
      else if (role === 'CLIENT') q = q.eq('client_id', viewer.id);

      const { count } = await q;
      return count ?? 0;
    } catch {
      return 0;
    }
  }

  // Lista de sessões (próximos 7 dias)
  let sessions: SessionRow[] = [];
  try {
    let base = sb
      .from('sessions')
      .select('id, scheduled_at, location, notes, trainer_id, client_id')
      .gte('scheduled_at', now.toISOString())
      .lt('scheduled_at', in7.toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(50);

    if (role === 'PT') base = base.eq('trainer_id', viewer.id);
    else if (role === 'CLIENT') base = base.eq('client_id', viewer.id);

    const { data, error } = await base;
    sessions = !error && data ? (data as SessionRow[]) : [];
  } catch {
    sessions = [];
  }

  const upcoming = await countUpcoming();

  return (
    <main className="p-4 space-y-4">
      <PageHeader
        title="Sessões"
        subtitle={
          role === 'ADMIN'
            ? 'Visão geral — próximos 7 dias'
            : role === 'PT'
            ? 'As tuas próximas sessões (7 dias)'
            : 'As minhas próximas sessões (7 dias)'
        }
        actions={
          role === 'PT' ? (
            <Link href="/dashboard/pt/sessions/calendar" className="btn chip">
              📅 Abrir calendário
            </Link>
          ) : undefined
        }
      />

      {/* KPIs */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
      >
        <KpiCard label="Próximos 7 dias" value={upcoming} variant="success" />
        {role !== 'CLIENT' && (
          <KpiCard
            label={role === 'PT' ? 'Vista de calendário' : 'Admin - calendário'}
            value={'→'}
            variant="primary"
            footer={<span className="text-xs opacity-70">Ver detalhe</span>}
          />
        )}
      </div>

      {/* Lista de sessões */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-sm opacity-70">Sem sessões marcadas nos próximos 7 dias.</div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {sessions.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="font-semibold truncate">
                    {s.notes?.trim() ? s.notes : 'Sessão'}
                  </div>
                  <div className="text-sm opacity-70">{fmtDT(s.scheduled_at)}</div>
                  {s.location && (
                    <div className="text-sm opacity-70">📍 {s.location}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="neutral">
                    {role === 'CLIENT' ? 'Com o meu PT' : role === 'PT' ? 'Com o cliente' : '—'}
                  </Badge>
                  {role === 'PT' && (
                    <Link
                      href="/dashboard/pt/sessions/calendar"
                      className="btn chip"
                    >
                      Ver no calendário
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
