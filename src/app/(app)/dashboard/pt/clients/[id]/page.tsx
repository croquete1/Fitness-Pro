// src/app/(app)/dashboard/pt/clients/[id]/page.tsx
export const dynamic = 'force-dynamic';

import { redirect, notFound } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole, type AppRole } from '@/lib/roles';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import FitnessQuestionnaireSummary from '@/components/questionnaire/FitnessQuestionnaireSummary';
import { normalizeQuestionnaire } from '@/lib/questionnaire';

type TrainingPlanSummary = {
  id: string;
  title: string | null;
  status: string | null;
  updatedAt: string | null;
};

type SessionSummary = {
  id: string;
  startsAt: string;     // ISO
  durationMin: number;  // por agora fixo (60)
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

function formatDatePT(iso: string | null) {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('pt-PT', {
      dateStyle: 'short',
      timeStyle: 'short',
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return '—';
  }
}

export default async function PTClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = await params;
  // Sessão
  const me = await getSessionUserSafe();
  if (!me?.user?.id) redirect('/login');

  const role = (toAppRole(me.user.role) ?? 'CLIENT') as AppRole;
  if (role !== 'ADMIN' && role !== 'PT') redirect('/dashboard');

  const sb = createServerClient();
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
      .eq('trainer_id', me.user.id)
      .eq('client_id', clientId)
      .maybeSingle();

    if (!link) redirect('/dashboard/pt/clients');
  }

  // 3) Planos do cliente (se PT, apenas os desse PT)
  let plans: TrainingPlanSummary[] = [];
  {
    const base = sb
      .from('training_plans')
      .select('id,title,status,updated_at,client_id,trainer_id')
      .eq('client_id', clientId)
      .order('updated_at', { ascending: false })
      .limit(50);

    const query = role === 'ADMIN' ? base : base.eq('trainer_id', me.user.id);
    const { data: plansRaw } = await query.returns<PlanRow[]>();

    const rows = plansRaw ?? [];
    plans = rows.map((p) => ({
      id: p.id,
      title: p.title ?? null,
      status: p.status ?? null,
      updatedAt: p.updated_at ?? null,
    }));
  }

  // 4) Sessões (se PT, apenas as desse PT)
  let sessions: SessionSummary[] = [];
  {
    const base = sb
      .from('sessions')
      .select('id,scheduled_at,notes,location,trainer_id,client_id')
      .eq('client_id', clientId)
      .order('scheduled_at', { ascending: false })
      .limit(50);

    const query = role === 'ADMIN' ? base : base.eq('trainer_id', me.user.id);
    const { data: sessionsRaw } = await query.returns<SessionRow[]>();

    const rows = sessionsRaw ?? [];
    sessions = rows.map((s) => ({
      id: s.id,
      startsAt: s.scheduled_at
        ? new Date(s.scheduled_at).toISOString()
        : new Date().toISOString(),
      durationMin: 60,
      title: s.notes ?? 'Sessão',
      location: s.location ?? null,
    }));
  }

  // 5) Questionário
  const { data: questionnaireRow } = await sb
    .from('fitness_questionnaire')
    .select('*')
    .eq('user_id', clientId)
    .maybeSingle();

  const questionnaire = normalizeQuestionnaire(questionnaireRow ?? null);

  // 6) UI derivada do cliente
  const ui = {
    id: client.id,
    name: client.name,
    email: client.email,
    role: (toAppRole(client.role) ?? 'CLIENT') as AppRole,
    status: (client.status ?? 'ACTIVE') as 'ACTIVE' | 'PENDING' | 'SUSPENDED' | string,
    createdAt: client.created_at,
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
            <Badge
              variant={
                ui.status === 'ACTIVE'
                  ? 'success'
                  : ui.status === 'PENDING'
                  ? 'warning'
                  : 'neutral'
              }
            >
              {ui.status}
            </Badge>
          </div>
        }
      />

      {/* Card: Questionário */}
      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Avaliação física</h3>
            <Badge variant={questionnaire?.status === 'submitted' ? 'success' : 'warning'}>
              {questionnaire?.status === 'submitted' ? 'Submetido' : 'Pendente'}
            </Badge>
          </div>
          {questionnaire ? (
            <FitnessQuestionnaireSummary data={questionnaire} variant="compact" />
          ) : (
            <p className="text-sm opacity-70">Sem questionário submetido.</p>
          )}
        </CardContent>
      </Card>

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
                      Estado: {p.status ?? '—'} · Atualizado: {formatDatePT(p.updatedAt)}
                    </div>
                  </div>
                  <a href={`/dashboard/pt/plans/${p.id}`} className="btn chip">
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
                      {formatDatePT(s.startsAt)}
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
