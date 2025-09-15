// src/app/(app)/dashboard/pt/clients/[id]/page.tsx
export const dynamic = 'force-dynamic';

import { redirect, notFound } from 'next/navigation';
import type { Route } from 'next';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole, type AppRole } from '@/lib/roles';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

type TrainingPlanSummary = {
  id: string;
  title: string | null;
  status: string | null;
  updatedAt: string | null;
};

type SessionSummary = {
  id: string;
  startsAt: string;     // ISO
  durationMin: number;  // por enquanto fixo (60)
  title: string;
  location: string | null;
};

type DbUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string | null;
  created_at: string | null;
};

type PlanRow = {
  id: string;
  title: string | null;
  status: string | null;
  updated_at: string | null;
  client_id: string | null;
  trainer_id: string | null;
};

type SessionRow = {
  id: string;
  scheduled_at: string | null;
  notes: string | null;
  location: string | null;
  trainer_id: string | null;
  client_id: string | null;
};

export default async function PTClientDetailPage({ params }: { params: { id: string } }) {
  // Sessão “flat” (sem .user)
  const me = await getSessionUserSafe();
  if (!me?.id) redirect('/login' as Route);

  const role = (toAppRole(me.role) ?? 'CLIENT') as AppRole;
  if (role !== 'ADMIN' && role !== 'PT') redirect('/dashboard' as Route);

  const sb = createServerClient();
  const clientId = params.id;

  // 1) Carregar cliente
  const { data: client, error: clientErr } = await sb
    .from('users')
    .select('id,name,email,role,status,created_at')
    .eq('id', clientId)
    .maybeSingle();

  if (clientErr || !client) return notFound();

  // 2) Se for PT, tem de existir vínculo trainer_clients
  if (role === 'PT') {
    const { data: link } = await sb
      .from('trainer_clients')
      .select('id')
      .eq('trainer_id', me.id)
      .eq('client_id', clientId)
      .maybeSingle();

    if (!link) redirect('/dashboard/pt/clients' as Route);
  }

  // 3) Planos do cliente (se PT, apenas os dele)
  let plans: TrainingPlanSummary[] = [];
  {
    const base = sb
      .from('training_plans')
      .select('id,title,status,updated_at,client_id,trainer_id')
      .eq('client_id', clientId)
      .order('updated_at', { ascending: false })
      .limit(50);

    const { data: plansRaw } =
      role === 'ADMIN' ? await base : await base.eq('trainer_id', me.id);

    const rows = (plansRaw ?? []) as PlanRow[];
    plans = rows.map((p) => ({
      id: p.id,
      title: p.title ?? null,
      status: p.status ?? null,
      updatedAt: p.updated_at ?? null,
    }));
  }

  // 4) Sessões (se PT, apenas as dele)
  let sessions: SessionSummary[] = [];
  {
    const base = sb
      .from('sessions')
      .select('id,scheduled_at,notes,location,trainer_id,client_id')
      .eq('client_id', clientId)
      .order('scheduled_at', { ascending: false })
      .limit(50);

    const { data: sessionsRaw } =
      role === 'ADMIN' ? await base : await base.eq('trainer_id', me.id);

    const rows = (sessionsRaw ?? []) as SessionRow[];
    sessions = rows.map((s) => ({
      id: s.id,
      startsAt: s.scheduled_at ? new Date(s.scheduled_at).toISOString() : new Date().toISOString(),
      durationMin: 60,
      title: s.notes ?? 'Sessão',
      location: s.location ?? null,
    }));
  }

  // 5) UI derivada do cliente
  const cu = client as DbUser;
  const ui = {
    id: cu.id,
    name: cu.name,
    email: cu.email,
    role: (toAppRole(cu.role) ?? 'CLIENT') as AppRole,
    status: (cu.status ?? 'ACTIVE') as 'ACTIVE' | 'PENDING' | 'SUSPENDED' | string,
    createdAt: cu.created_at,
  };

  return (
    <main className="p-4 md:p-6 space-y-4">
      {/* Header com badges */}
      <PageHeader
        title={`🧑‍🤝‍🧑 ${ui.name ?? ui.email}`}
        subtitle={
          <div className="flex gap-2 items-center">
            <Badge variant={ui.role === 'ADMIN' ? 'info' : ui.role === 'PT' ? 'primary' : 'neutral'}>
              {ui.role}
            </Badge>
            <Badge variant={ui.status === 'ACTIVE' ? 'success' : ui.status === 'PENDING' ? 'warning' : 'neutral'}>
              {ui.status}
            </Badge>
          </div>
        }
      />

      {/* Card: Planos */}
      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Planos</h3>
          </div>

          {plans.length === 0 ? (
            <div className="text-sm opacity-70">Sem planos.</div>
          ) : (
            <ul className="grid gap-2">
              {plans.map((p) => (
                <li
                  key={p.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{p.title ?? 'Sem título'}</div>
                    <div className="text-xs opacity-70">
                      Estado: {p.status ?? '—'} · Atualizado:{' '}
                      {p.updatedAt ? new Date(p.updatedAt).toLocaleString('pt-PT') : '—'}
                    </div>
                  </div>
                  <a
                    href={`/dashboard/pt/plans/${p.id}`}
                    className="btn chip"
                  >
                    Abrir
                  </a>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Card: Sessões */}
      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Sessões</h3>
          </div>

          {sessions.length === 0 ? (
            <div className="text-sm opacity-70">Sem sessões.</div>
          ) : (
            <ul className="grid gap-2">
              {sessions.map((s) => (
                <li
                  key={s.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {new Date(s.startsAt).toLocaleString('pt-PT')}
                      <span className="text-xs ml-2 opacity-70">({s.durationMin} min)</span>
                    </div>
                    <div className="text-xs opacity-70">{s.location ?? '—'}</div>
                  </div>
                  <div className="text-sm opacity-80 mt-1">{s.title}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
