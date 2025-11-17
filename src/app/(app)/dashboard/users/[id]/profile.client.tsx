'use client';

import * as React from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ui/ToastProvider';
import type { PlanFeedbackDashboard } from '@/lib/plan-feedback/types';

type Role = 'ADMIN' | 'PT' | 'CLIENT';

export type TrainerOption = {
  id: string;
  name: string;
  email: string | null;
};

export type PlanSummary = {
  id: string;
  title: string | null;
  status: string | null;
  updatedAt: string | null;
  trainerName: string | null;
};

export type SessionSummary = {
  id: string;
  scheduledAt: string | null;
  durationMin: number | null;
  location: string | null;
  notes: string | null;
  trainerName: string | null;
};

export type MeasurementSnapshot = {
  id: string;
  date: string | null;
  weight: number | null;
  height: number | null;
  bodyFatPct: number | null;
  notes: string | null;
  waist: number | null;
  hip: number | null;
  chest: number | null;
  shoulders: number | null;
  neck: number | null;
  arm: number | null;
  thigh: number | null;
  calf: number | null;
};

export type ActivitySnapshot = {
  totalPlans: number;
  activePlans: number;
  draftPlans: number;
  archivedPlans: number;
  upcomingSessions: number;
  lastPlanUpdate: string | null;
  lastSession: string | null;
  lastActivity: string | null;
};

export type ProfileUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  status: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  lastSeenAt: string | null;
  online: boolean;
  avatarUrl: string | null;
  phone: string | null;
  username: string | null;
};

export type Viewer = {
  id: string;
  role: Role;
};

export type TrainerState = {
  current: TrainerOption | null;
  options: TrainerOption[];
  allowEdit: boolean;
};

export type ClientProfilePayload = {
  viewer: Viewer;
  user: ProfileUser;
  trainer: TrainerState;
  plans: PlanSummary[];
  upcomingSessions: SessionSummary[];
  recentSessions: SessionSummary[];
  measurement: MeasurementSnapshot | null;
  activity: ActivitySnapshot;
  planFeedback: PlanFeedbackDashboard;
};

type NoteEntry = {
  id: string;
  createdAt: string;
  author: string;
  text: string;
};

type PackageRecord = {
  id: string;
  name?: string | null;
  status?: string | null;
  startedAt?: string | null;
  endsAt?: string | null;
  sessionsTotal?: number | null;
  sessionsUsed?: number | null;
  notes?: string | null;
};

type PackageState = {
  current: PackageRecord | null;
  history: PackageRecord[];
};

function roleDisplay(role: Role) {
  switch (role) {
    case 'ADMIN':
      return 'Administrador';
    case 'PT':
      return 'Personal Trainer';
    default:
      return 'Cliente';
  }
}

function statusDisplay(status: string | null) {
  if (!status) return '—';
  const normalized = status.toUpperCase();
  switch (normalized) {
    case 'ACTIVE':
      return 'Ativo';
    case 'SUSPENDED':
      return 'Suspenso';
    case 'PENDING':
      return 'Pendente';
    default:
      return normalized;
  }
}

function formatDate(value: string | null, opts?: Intl.DateTimeFormatOptions) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('pt-PT', {
      dateStyle: 'short',
      timeStyle: opts?.timeStyle ?? 'short',
      ...opts,
    }).format(new Date(value));
  } catch {
    return '—';
  }
}

function initialsFromName(name: string | null) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

function bmi(weight: number | null, height: number | null) {
  if (!weight || !height || height === 0) return null;
  const hMeters = height >= 3 ? height / 100 : height;
  const val = weight / (hMeters * hMeters);
  return Number.isFinite(val) ? Math.round(val * 10) / 10 : null;
}

function bmiClassification(value: number | null) {
  if (!value) return null;
  if (value < 18.5) return 'Abaixo do peso';
  if (value < 25) return 'Peso saudável';
  if (value < 30) return 'Pré-obesidade';
  if (value < 35) return 'Obesidade grau I';
  if (value < 40) return 'Obesidade grau II';
  return 'Obesidade grau III';
}

function summarizeMeasurement(measurement: MeasurementSnapshot | null) {
  if (!measurement) return null;
  const bmiValue = bmi(measurement.weight ?? null, measurement.height ?? null);
  return {
    bmi: bmiValue,
    weight: measurement.weight,
    height: measurement.height,
    bodyFat: measurement.bodyFatPct,
    notes: measurement.notes,
    date: measurement.date,
    waist: measurement.waist,
    hip: measurement.hip,
    chest: measurement.chest,
    shoulders: measurement.shoulders,
    neck: measurement.neck,
    arm: measurement.arm,
    thigh: measurement.thigh,
    calf: measurement.calf,
  };
}

function formatMeasurementValue(value: number | null, unit: string) {
  if (value == null) return '—';
  return `${value}${unit}`;
}

function packageStatusLabel(status?: string | null) {
  if (!status) return 'Sem estado';
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return 'Ativo';
    case 'PAUSED':
      return 'Em pausa';
    case 'ENDED':
    case 'CANCELLED':
      return 'Terminado';
    case 'UPCOMING':
      return 'Agendado';
    default:
      return status;
  }
}

function formatSessionsProgress(total?: number | null, used?: number | null) {
  if (total == null && used == null) return null;
  if (total == null) return used == null ? null : `${used} sessões registadas`;
  const safeUsed = Math.max(0, Math.min(used ?? 0, total));
  return `${safeUsed}/${total} sessões utilizadas`;
}

function packageTone(status?: string | null): 'success' | 'warning' | 'neutral' {
  if (!status) return 'neutral';
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return 'success';
    case 'PAUSED':
    case 'UPCOMING':
      return 'warning';
    default:
      return 'neutral';
  }
}

function sessionTitle(session: SessionSummary) {
  if (session.notes) return session.notes.split('\n')[0]?.slice(0, 80) || 'Sessão';
  if (session.trainerName) return `Sessão com ${session.trainerName}`;
  return 'Sessão agendada';
}

function metricTile(label: string, value: React.ReactNode, accent: 'primary' | 'success' | 'warning' | 'neutral', helper?: React.ReactNode) {
  return (
    <div className="client-profile__metric" data-tone={accent}>
      <span className="client-profile__metricLabel">{label}</span>
      <span className="client-profile__metricValue">{value ?? '—'}</span>
      {helper ? <span className="client-profile__metricHelper">{helper}</span> : null}
    </div>
  );
}

export default function ClientProfileClient({
  viewer,
  user,
  trainer,
  plans,
  upcomingSessions,
  recentSessions,
  measurement,
  activity,
  planFeedback,
}: ClientProfilePayload) {
  const toast = useToast();
  const [trainerId, setTrainerId] = React.useState<string>(trainer.current?.id ?? '');
  const [currentTrainer, setCurrentTrainer] = React.useState<TrainerOption | null>(trainer.current);
  const [savingTrainer, setSavingTrainer] = React.useState(false);
  const [packageState, setPackageState] = React.useState<PackageState>({ current: null, history: [] });
  const [loadingPackages, setLoadingPackages] = React.useState(true);
  const [notes, setNotes] = React.useState<NoteEntry[]>([]);
  const [loadingNotes, setLoadingNotes] = React.useState(true);
  const [noteText, setNoteText] = React.useState('');
  const [savingNote, setSavingNote] = React.useState(false);
  const noteTextTrimmed = noteText.trim();
  const viewerIsTrainer = viewer.role === 'PT';
  const viewerIsAdmin = viewer.role === 'ADMIN';
  const viewerIsStaff = viewerIsTrainer || viewerIsAdmin;
  const canMessage = viewerIsStaff;
  const canManagePlans = viewerIsTrainer;

  const measurementSummary = React.useMemo(() => summarizeMeasurement(measurement), [measurement]);
  const metricsHistoryHref = React.useMemo(
    () => `/dashboard/profile?tab=metrics&user=${encodeURIComponent(user.id)}`,
    [user.id],
  );
  const planSectionHref = '#client-plans';
  const sessionsSectionHref = '#client-sessions';
  const measurementsSectionHref = '#client-measurements';
  const currentPackage = packageState.current;
  const packageHistory = packageState.history;
  const circumferenceMetrics = React.useMemo(
    () =>
      measurementSummary
        ? ([
            { key: 'waist', label: 'Cintura', value: measurementSummary.waist },
            { key: 'hip', label: 'Anca', value: measurementSummary.hip },
            { key: 'chest', label: 'Peito', value: measurementSummary.chest },
            { key: 'shoulders', label: 'Ombros', value: measurementSummary.shoulders },
            { key: 'neck', label: 'Pescoço', value: measurementSummary.neck },
            { key: 'arm', label: 'Braço', value: measurementSummary.arm },
            { key: 'thigh', label: 'Coxa', value: measurementSummary.thigh },
            { key: 'calf', label: 'Barriga da perna', value: measurementSummary.calf },
          ] as const)
        : [],
    [measurementSummary],
  );
  const hasCircumferenceData = circumferenceMetrics.some((metric) => metric.value != null);
  const sessionNotes = React.useMemo(() => recentSessions.filter((session) => session.notes), [recentSessions]);
  const hasAutoNotes = Boolean(measurement?.notes || sessionNotes.length);
  const heroSubtitle = React.useMemo(() => {
    const displayName = user.name?.split(' ')[0] ?? user.name ?? user.email ?? 'o cliente';
    const planLabel = activity.activePlans === 1 ? 'plano ativo' : 'planos ativos';
    const sessionLabel = activity.upcomingSessions === 1 ? 'treino presencial' : 'treinos presenciais';
    if (viewerIsTrainer) {
      return `Acompanha ${displayName} com ${activity.activePlans} ${planLabel} e ${activity.upcomingSessions} ${sessionLabel} agendados.`;
    }
    if (viewerIsAdmin) {
      const totalLabel = activity.totalPlans === 1 ? 'plano' : 'planos';
      const lastAccess = user.lastSignInAt ? ` · Último acesso ${formatDate(user.lastSignInAt)}` : '';
      return `Gestão administrativa · ${activity.totalPlans} ${totalLabel} registados${lastAccess}`;
    }
    return 'Resumo completo com dados, planos e progresso.';
  }, [
    activity.activePlans,
    activity.totalPlans,
    activity.upcomingSessions,
    user.email,
    user.lastSignInAt,
    user.name,
    viewerIsAdmin,
    viewerIsTrainer,
  ]);
  const heroStats = React.useMemo(
    () =>
      [
        {
          key: 'plans',
          label: 'Planos ativos',
          value: activity.activePlans,
          helper: `${activity.totalPlans} no total`,
        },
        {
          key: 'sessions',
          label: 'Treinos presenciais',
          value: activity.upcomingSessions,
          helper: `${recentSessions.length} concluídos`,
        },
        {
          key: 'assessment',
          label: 'Última avaliação',
          value: measurementSummary?.date ? formatDate(measurementSummary.date, { dateStyle: 'medium' }) : 'Sem registo',
          helper:
            measurementSummary?.weight != null
              ? `${measurementSummary.weight} kg`
              : measurementSummary?.bodyFat != null
                ? `${measurementSummary.bodyFat}% GC`
                : undefined,
        },
        {
          key: 'trainer',
          label: 'PT responsável',
          value: currentTrainer?.name ?? 'Sem atribuição',
          helper: trainerId ? 'Acompanhamento direto' : 'Adiciona um treinador',
          href: trainer.allowEdit ? '#trainer-management' : undefined,
        },
      ],
    [
      activity.activePlans,
      activity.totalPlans,
      activity.upcomingSessions,
      currentTrainer?.name,
      measurementSummary?.bodyFat,
      measurementSummary?.date,
      measurementSummary?.weight,
      recentSessions.length,
      trainer.allowEdit,
      trainerId,
    ],
  );
  const messageHref = React.useMemo(
    () => `/dashboard/messages?counterpart=${encodeURIComponent(user.id)}#messages-chat`,
    [user.id],
  );
  const quickActions = React.useMemo(() => {
    const base: Array<{ key: string; label: string; href: string; variant: 'primary' | 'ghost' }> = [];
    if (canMessage) {
      base.push({
        key: 'message',
        label: 'Enviar mensagem',
        href: messageHref,
        variant: 'primary',
      });
    }
    if (canManagePlans) {
      base.push({
        key: 'plan',
        label: 'Criar plano',
        href: `/dashboard/pt/plans/new?clientId=${encodeURIComponent(user.id)}`,
        variant: 'ghost',
      });
      base.push({
        key: 'session',
        label: 'Agendar treino presencial',
        href: `/dashboard/pt/sessions/new?clientId=${encodeURIComponent(user.id)}`,
        variant: 'ghost',
      });
    }
    return base;
  }, [canManagePlans, canMessage, messageHref, user.id]);
  const planCoveragePct = React.useMemo(() => {
    if (!activity.totalPlans) return 0;
    return Math.min(100, Math.round((activity.activePlans / Math.max(activity.totalPlans, 1)) * 100));
  }, [activity.activePlans, activity.totalPlans]);
  const planCoverageHelper = React.useMemo(
    () => `${activity.activePlans} de ${activity.totalPlans} planos em execução`,
    [activity.activePlans, activity.totalPlans],
  );
  const adherencePct = React.useMemo(() => {
    const total = activity.upcomingSessions + recentSessions.length;
    if (!total) return 0;
    return Math.min(100, Math.round((recentSessions.length / total) * 100));
  }, [activity.upcomingSessions, recentSessions.length]);
  const adherenceHelper = React.useMemo(
    () => `${recentSessions.length} sessões concluídas · ${activity.upcomingSessions} agendadas`,
    [activity.upcomingSessions, recentSessions.length],
  );
  const lastFeedbackAt = React.useMemo(() => {
    return (
      planFeedback.plan[0]?.createdAt ??
      planFeedback.days[0]?.createdAt ??
      planFeedback.exercises[0]?.createdAt ??
      null
    );
  }, [planFeedback]);
  const [feedbackTab, setFeedbackTab] = React.useState<'plan' | 'days' | 'exercises'>('plan');
  const feedbackEntries = React.useMemo(() => {
    if (feedbackTab === 'plan') return planFeedback.plan;
    if (feedbackTab === 'days') return planFeedback.days;
    return planFeedback.exercises;
  }, [planFeedback, feedbackTab]);
  const feedbackCounters = React.useMemo(
    () => ({
      plan: planFeedback.plan.length,
      days: planFeedback.days.length,
      exercises: planFeedback.exercises.length,
      total: planFeedback.plan.length + planFeedback.days.length + planFeedback.exercises.length,
    }),
    [planFeedback],
  );
  const feedbackUpdatedLabel = React.useMemo(() => {
    if (planFeedback.updatedAt) {
      return `Actualizado ${formatDate(planFeedback.updatedAt)}`;
    }
    if (planFeedback.source === 'fallback') {
      return 'Dados de exemplo';
    }
    return 'Sincronização automática';
  }, [planFeedback]);
  const lastFeedbackLabel = React.useMemo(
    () => (lastFeedbackAt ? formatDate(lastFeedbackAt) : 'Sem feedback registado'),
    [lastFeedbackAt],
  );
  const selectedTrainer = React.useMemo(
    () => trainer.options.find((option) => option.id === trainerId) ?? null,
    [trainer.options, trainerId],
  );

  async function saveTrainerLink() {
    if (!trainer.allowEdit) return;
    setSavingTrainer(true);
    try {
      const res = await fetch('/api/admin/trainer-clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: user.id, trainerId: trainerId || null }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Não foi possível atualizar o vínculo');
      }
      setCurrentTrainer(trainerId ? selectedTrainer ?? null : null);
      toast.success(trainerId ? 'Personal Trainer atualizado com sucesso' : 'Personal Trainer removido deste cliente');
    } catch (error: any) {
      toast.error(error?.message ?? 'Falha ao atualizar Personal Trainer');
    } finally {
      setSavingTrainer(false);
    }
  }

  React.useEffect(() => {
    let active = true;
    async function loadPackages() {
      try {
        setLoadingPackages(true);
        const res = await fetch(`/api/users/${user.id}/packages`);
        if (!res.ok) throw new Error('Não foi possível carregar os pacotes');
        const json = await res.json().catch(() => null);
        if (!active) return;
        const data = (json?.data ?? json ?? { current: null, history: [] }) as PackageState;
        setPackageState({
          current: data.current ?? null,
          history: Array.isArray(data.history) ? data.history : [],
        });
      } catch (error) {
        if (active) {
          setPackageState({ current: null, history: [] });
          toast.error('Não foi possível carregar os pacotes deste cliente');
        }
      } finally {
        if (active) setLoadingPackages(false);
      }
    }
    loadPackages();
    return () => {
      active = false;
    };
  }, [toast, user.id]);

  React.useEffect(() => {
    let active = true;
    async function loadNotes() {
      try {
        setLoadingNotes(true);
        const res = await fetch(`/api/users/${user.id}/notes`);
        if (!res.ok) throw new Error('Falha ao carregar notas');
        const json = await res.json().catch(() => null);
        if (!active) return;
        const list = (json?.data ?? json ?? []) as NoteEntry[];
        setNotes(Array.isArray(list) ? list : []);
      } catch (error) {
        if (active) {
          toast.error('Não foi possível carregar as notas do cliente');
          setNotes([]);
        }
      } finally {
        if (active) setLoadingNotes(false);
      }
    }
    loadNotes();
    return () => {
      active = false;
    };
  }, [toast, user.id]);

  async function submitNote(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const value = noteTextTrimmed;
    if (!value) {
      toast.error('Escreva uma nota antes de guardar');
      return;
    }
    try {
      setSavingNote(true);
      const body = new FormData();
      body.append('text', value);
      const res = await fetch(`/api/users/${user.id}/notes`, {
        method: 'POST',
        body,
      });
      if (!res.ok) throw new Error('Não foi possível guardar a nota');
      const json = await res.json().catch(() => null);
      const note = (json?.data ?? json) as NoteEntry | null;
      if (note) {
        setNotes((prev) => [note, ...prev]);
        setNoteText('');
        toast.success('Nota adicionada');
      }
    } catch (error) {
      toast.error('Falha ao guardar a nota');
    } finally {
      setSavingNote(false);
    }
  }

  return (
    <div className="client-profile neo-stack neo-stack--lg">
      <section className="client-profile__hero neo-panel">
        <div className="client-profile__heroMain">
          <div className="client-profile__avatar" aria-hidden>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" />
            ) : (
              <span>{initialsFromName(user.name)}</span>
            )}
          </div>
          <div className="client-profile__heroInfo">
            <h1 className="client-profile__name">{user.name ?? user.email ?? 'Utilizador'}</h1>
            <div className="client-profile__tags neo-inline neo-inline--sm neo-inline--wrap">
              <span className="neo-tag" data-tone={user.role === 'ADMIN' ? 'warning' : user.role === 'PT' ? 'primary' : 'neutral'}>
                {roleDisplay(user.role)}
              </span>
              <span className="neo-tag" data-tone={user.status?.toUpperCase() === 'ACTIVE' ? 'success' : 'neutral'}>
                {statusDisplay(user.status)}
              </span>
              {user.online ? (
                <span className="neo-tag" data-tone="success">Online agora</span>
              ) : (
                <span className="neo-tag" data-tone="neutral">Offline</span>
              )}
            </div>
            {heroSubtitle ? <p className="client-profile__heroSubtitle">{heroSubtitle}</p> : null}
          </div>
        </div>
        {heroStats.length ? (
          <div className="client-profile__heroStats" role="list">
            {heroStats.map((stat) => {
              const content = (
                <>
                  <span className="client-profile__heroStatLabel">{stat.label}</span>
                  <span className="client-profile__heroStatValue">{stat.value}</span>
                  {stat.helper ? (
                    <span className="client-profile__heroStatHelper">{stat.helper}</span>
                  ) : null}
                </>
              );
              if (stat.href) {
                return (
                  <Link key={stat.key} href={stat.href} className="client-profile__heroStat" role="listitem">
                    {content}
                  </Link>
                );
              }
              return (
                <div key={stat.key} className="client-profile__heroStat" role="listitem">
                  {content}
                </div>
              );
            })}
          </div>
        ) : null}
        {quickActions.length ? (
          <div className="client-profile__heroActions">
            {quickActions.map((action) => (
              <Link
                key={action.key}
                href={action.href}
                className={`neo-button neo-button--${action.variant} neo-button--small`}
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
        <dl className="client-profile__meta">
          <div>
            <dt>Último acesso</dt>
            <dd>{formatDate(user.lastSignInAt)}</dd>
          </div>
          <div>
            <dt>Última vez online</dt>
            <dd>{formatDate(user.lastSeenAt)}</dd>
          </div>
          <div>
            <dt>Conta criada</dt>
            <dd>{formatDate(user.createdAt)}</dd>
          </div>
        </dl>
      </section>

      <div className="client-profile__layout">
        <aside className="client-profile__sidebar neo-stack neo-stack--lg">
          <section className="neo-panel client-profile__card">
            <h2 className="client-profile__sectionTitle">Detalhes do cliente</h2>
            <div className="neo-stack neo-stack--md">
              <InfoRow icon={<MailIcon />} label="Email" value={user.email ?? '—'} href={user.email ? `mailto:${user.email}` : undefined} />
              <InfoRow icon={<PhoneIcon />} label="Telefone" value={user.phone ?? '—'} href={user.phone ? `tel:${user.phone}` : undefined} />
              <InfoRow icon={<UserIcon />} label="Username" value={user.username ?? '—'} />
              <InfoRow icon={<IdIcon />} label="ID do utilizador" value={user.id} copyable />
            </div>
          </section>

          <section className="neo-panel client-profile__card">
            <div className="client-profile__cardHeader">
              <h2 className="client-profile__sectionTitle">Resumo de atividade</h2>
              <span className="client-profile__muted">{activity.lastActivity ? `Atualizado ${formatDate(activity.lastActivity)}` : 'Sem registos recentes'}</span>
            </div>
            <div className="client-profile__metrics neo-grid neo-grid--auto">
              {metricTile('Planos de treino', activity.totalPlans, 'primary', `Ativos: ${activity.activePlans} · Rascunhos: ${activity.draftPlans}`)}
              {metricTile('Sessões futuras', activity.upcomingSessions, 'success', activity.lastSession ? `Última sessão: ${formatDate(activity.lastSession)}` : 'Sem sessões realizadas')}
              {metricTile('Planos arquivados', activity.archivedPlans, 'warning', activity.lastPlanUpdate ? `Última atualização: ${formatDate(activity.lastPlanUpdate)}` : undefined)}
            </div>
          </section>

          <section id="trainer-management" className="neo-panel client-profile__card">
            <div className="client-profile__cardHeader">
              <h2 className="client-profile__sectionTitle">Gestão do PT</h2>
              <span className="client-profile__muted">Controla o vínculo entre o cliente e um treinador principal.</span>
            </div>
            <form className="neo-stack neo-stack--md" onSubmit={(event) => { event.preventDefault(); saveTrainerLink(); }}>
              <label className="neo-input-group__label" htmlFor="trainer-select">
                Personal Trainer
              </label>
              <select
                id="trainer-select"
                className="neo-input"
                value={trainerId}
                onChange={(event) => setTrainerId(event.target.value)}
                disabled={!trainer.allowEdit}
              >
                <option value="">Sem treinador atribuído</option>
                {trainer.options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              {currentTrainer ? (
                <p className="client-profile__muted">Atual: {currentTrainer.name}</p>
              ) : (
                <p className="client-profile__muted">Sem PT definido</p>
              )}
              <button type="submit" className="neo-button neo-button--primary" disabled={savingTrainer || !trainer.allowEdit}>
                {savingTrainer ? 'A guardar…' : 'Guardar alterações'}
              </button>
            </form>
          </section>
        </aside>

        <main className="client-profile__main neo-stack neo-stack--lg">
          {viewerIsTrainer ? (
            <section className="neo-panel client-profile__card client-profile__toolbox" aria-labelledby="trainer-toolbox">
              <div className="client-profile__cardHeader">
                <div>
                  <h2 id="trainer-toolbox" className="client-profile__sectionTitle">
                    Área do treinador
                  </h2>
                  <span className="client-profile__muted">
                    Atalhos para gerir planos, treinos presenciais e comunicação com o cliente.
                  </span>
                </div>
              </div>
              <div className="client-profile__actionGrid">
                <article className="client-profile__actionCard">
                  <header>
                    <div>
                      <h3>Planos de treino</h3>
                      <p>Revê ou ajusta rapidamente os planos ativos deste cliente.</p>
                    </div>
                    <span className="client-profile__actionBadge">{activity.activePlans} ativos</span>
                  </header>
                  <div className="client-profile__actionButtons">
                    <Link href={planSectionHref} className="neo-button neo-button--ghost neo-button--small">
                      Ver planos
                    </Link>
                    <Link
                      href={`/dashboard/pt/plans/new?clientId=${encodeURIComponent(user.id)}`}
                      className="neo-button neo-button--primary neo-button--small"
                    >
                      Criar plano
                    </Link>
                  </div>
                </article>
                <article className="client-profile__actionCard">
                  <header>
                    <div>
                      <h3>Treinos presenciais</h3>
                      <p>Confere as próximas marcações ou agenda uma nova sessão.</p>
                    </div>
                    <span className="client-profile__actionBadge">{activity.upcomingSessions} agendados</span>
                  </header>
                  <div className="client-profile__actionButtons">
                    <Link href={sessionsSectionHref} className="neo-button neo-button--ghost neo-button--small">
                      Consultar sessões
                    </Link>
                    <Link
                      href={`/dashboard/pt/sessions/new?clientId=${encodeURIComponent(user.id)}`}
                      className="neo-button neo-button--primary neo-button--small"
                    >
                      Agendar treino
                    </Link>
                  </div>
                </article>
                <article className="client-profile__actionCard">
                  <header>
                    <div>
                      <h3>Mensagens</h3>
                      <p>Alinha expectativas e envia feedback personalizado.</p>
                    </div>
                    <span className="client-profile__actionBadge">
                      {user.lastSeenAt ? `Última atividade ${formatDate(user.lastSeenAt)}` : 'Sem atividade recente'}
                    </span>
                  </header>
                  <div className="client-profile__actionButtons">
                    <Link href={messageHref} className="neo-button neo-button--primary neo-button--small">
                      Enviar mensagem
                    </Link>
                    <Link href={planSectionHref} className="neo-button neo-button--ghost neo-button--small">
                      Rever plano
                    </Link>
                  </div>
                </article>
                <article className="client-profile__actionCard">
                  <header>
                    <div>
                      <h3>Dados antropométricos</h3>
                      <p>Acompanha peso, medidas e notas da última avaliação.</p>
                    </div>
                    <span className="client-profile__actionBadge">
                      {measurementSummary?.date ? formatDate(measurementSummary.date) : 'Sem registos'}
                    </span>
                  </header>
                  <div className="client-profile__actionButtons">
                    <Link href={measurementsSectionHref} className="neo-button neo-button--ghost neo-button--small">
                      Ver resumo
                    </Link>
                    <Link href={metricsHistoryHref} className="neo-button neo-button--primary neo-button--small">
                      Histórico completo
                    </Link>
                  </div>
                </article>
              </div>
            </section>
          ) : null}
          <section className="neo-panel client-profile__card client-profile__progress">
            <div className="client-profile__cardHeader">
              <div>
                <h2 className="client-profile__sectionTitle">Progresso dos treinos</h2>
                <span className="client-profile__muted">
                  {activity.lastActivity ? `Última actividade ${formatDate(activity.lastActivity)}` : 'Sem histórico recente'}
                </span>
              </div>
            </div>
            <ul className="client-profile__progressList">
              <li>
                <div>
                  <strong>Planos activos</strong>
                  <span>{planCoverageHelper}</span>
                </div>
                <div className="client-profile__progressMeter">
                  <div
                    className="client-profile__progressBar"
                    role="progressbar"
                    aria-valuenow={planCoveragePct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span style={{ width: `${planCoveragePct}%` }} />
                  </div>
                  <span className="client-profile__progressValue">{planCoveragePct}%</span>
                </div>
              </li>
              <li>
                <div>
                  <strong>Aderência semanal</strong>
                  <span>{adherenceHelper}</span>
                </div>
                <div className="client-profile__progressMeter">
                  <div
                    className="client-profile__progressBar"
                    role="progressbar"
                    aria-valuenow={adherencePct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span style={{ width: `${adherencePct}%` }} />
                  </div>
                  <span className="client-profile__progressValue">{adherencePct}%</span>
                </div>
              </li>
              <li className="client-profile__progressNote">
                <div>
                  <strong>Último feedback do cliente</strong>
                  <span>{lastFeedbackLabel}</span>
                </div>
                <Link href="#plan-feedback" className="neo-button neo-button--ghost neo-button--small">
                  Ver comentários
                </Link>
              </li>
            </ul>
          </section>

          <section className="neo-panel client-profile__card" id="client-measurements">
            <div className="client-profile__cardHeader">
              <h2 className="client-profile__sectionTitle">Avaliação física</h2>
              <div className="client-profile__cardMeta">
                <span>{measurementSummary?.date ? formatDate(measurementSummary.date) : 'Sem registos'}</span>
                <Link href={metricsHistoryHref} className="neo-button neo-button--ghost neo-button--small">
                  Ver histórico
                </Link>
              </div>
            </div>
            {measurementSummary ? (
              <div className="neo-stack neo-stack--lg">
                <div className="neo-grid neo-grid--auto client-profile__metricGrid">
                  {metricTile('Peso', measurementSummary.weight ? `${measurementSummary.weight} kg` : '—', 'primary')}
                  {metricTile('Altura', measurementSummary.height ? `${measurementSummary.height} cm` : '—', 'primary', measurementSummary.height && measurementSummary.height >= 3 ? `${Math.round((measurementSummary.height / 100) * 100) / 100} m` : undefined)}
                  {metricTile('IMC', measurementSummary.bmi ?? '—', 'warning', bmiClassification(measurementSummary.bmi ?? null) ?? undefined)}
                  {metricTile('Gordura corporal', measurementSummary.bodyFat != null ? `${measurementSummary.bodyFat}%` : '—', 'success')}
                </div>

                {hasCircumferenceData ? (
                  <div className="neo-stack neo-stack--md">
                    <h3 className="client-profile__subheading">Medidas corporais</h3>
                    <div className="neo-grid neo-grid--auto client-profile__metricGrid">
                      {circumferenceMetrics.map((metric) => (
                        <div key={metric.key} className="client-profile__metric" data-tone="neutral">
                          <span className="client-profile__metricLabel">{metric.label}</span>
                          <span className="client-profile__metricValue">{formatMeasurementValue(metric.value, ' cm')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {measurementSummary.notes ? (
                  <div className="client-profile__noteBox">
                    <h3 className="client-profile__subheading">Observações</h3>
                    <p className="client-profile__noteText">{measurementSummary.notes}</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="client-profile__muted">Ainda não existem medições registadas.</p>
            )}
          </section>

          <section className="neo-panel client-profile__card" id="plan-feedback">
            <div className="client-profile__cardHeader">
              <div>
                <h2 className="client-profile__sectionTitle">Comentários dos planos</h2>
                <span className="client-profile__muted">{feedbackUpdatedLabel}</span>
              </div>
              <div className="client-profile__feedbackTabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  className={feedbackTab === 'plan' ? 'is-active' : ''}
                  aria-selected={feedbackTab === 'plan'}
                  onClick={() => setFeedbackTab('plan')}
                >
                  Plano completo
                </button>
                <button
                  type="button"
                  role="tab"
                  className={feedbackTab === 'days' ? 'is-active' : ''}
                  aria-selected={feedbackTab === 'days'}
                  onClick={() => setFeedbackTab('days')}
                >
                  Dias
                </button>
                <button
                  type="button"
                  role="tab"
                  className={feedbackTab === 'exercises' ? 'is-active' : ''}
                  aria-selected={feedbackTab === 'exercises'}
                  onClick={() => setFeedbackTab('exercises')}
                >
                  Exercícios
                </button>
              </div>
            </div>
            <div className="client-profile__feedbackSummary">
              <div>
                <strong>{feedbackCounters.total ? `${feedbackCounters.total} comentários do cliente` : 'Sem feedback registado'}</strong>
                <span className="client-profile__muted">Último registo: {lastFeedbackLabel}</span>
              </div>
              <div className="client-profile__feedbackPills" role="status">
                <span data-active={feedbackTab === 'plan'}>Plano · {feedbackCounters.plan}</span>
                <span data-active={feedbackTab === 'days'}>Dias · {feedbackCounters.days}</span>
                <span data-active={feedbackTab === 'exercises'}>Exercícios · {feedbackCounters.exercises}</span>
              </div>
              <Link href={planSectionHref} className="neo-button neo-button--ghost neo-button--small">
                Abrir planos
              </Link>
            </div>
            {feedbackEntries.length === 0 ? (
              <p className="client-profile__muted">Ainda não existem comentários para este plano.</p>
            ) : (
              <ul className="client-profile__feedbackList">
                {feedbackEntries.map((entry) => (
                  <li key={entry.id} className="client-profile__feedbackItem" data-tone={entry.mood ?? 'neutral'}>
                    <div>
                      <span className="client-profile__feedbackScope">
                        {entry.targetLabel ?? entry.planTitle ?? 'Plano'} · {entry.planTitle ?? 'Plano sem título'}
                      </span>
                      <p>{entry.comment}</p>
                    </div>
                    <span className="client-profile__muted">
                      {entry.createdAt ? formatDate(entry.createdAt) : 'Sem data'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="neo-panel client-profile__card">
            <div className="client-profile__cardHeader">
              <h2 className="client-profile__sectionTitle">Pacotes de sessões</h2>
              <span className="client-profile__muted">Resumo de pacotes ativos e históricos.</span>
            </div>
            {loadingPackages ? (
              <div className="client-profile__loading">A carregar pacotes…</div>
            ) : currentPackage ? (
              <div className="neo-stack neo-stack--lg">
                <div className="client-profile__package">
                  <div className="client-profile__packageHeader">
                    <div className="client-profile__packageTitle">
                      <span className="client-profile__packageName">{currentPackage.name ?? 'Pacote sem título'}</span>
                      <span className="neo-tag" data-tone={packageTone(currentPackage.status)}>
                        {packageStatusLabel(currentPackage.status)}
                      </span>
                    </div>
                    <span className="client-profile__muted">
                      Iniciado em {formatDate(currentPackage.startedAt)}
                      {currentPackage.endsAt ? ` · Expira em ${formatDate(currentPackage.endsAt)}` : ''}
                    </span>
                  </div>
                  {formatSessionsProgress(currentPackage.sessionsTotal, currentPackage.sessionsUsed) ? (
                    <span className="client-profile__muted">
                      {formatSessionsProgress(currentPackage.sessionsTotal, currentPackage.sessionsUsed)}
                    </span>
                  ) : null}
                  {currentPackage.notes ? (
                    <p className="client-profile__noteText">{currentPackage.notes}</p>
                  ) : null}
                </div>

                {packageHistory.length ? (
                  <div className="neo-stack neo-stack--md">
                    <h3 className="client-profile__subheading">Histórico recente</h3>
                    <div className="neo-stack neo-stack--md">
                      {packageHistory.map((pkg) => (
                        <div key={pkg.id} className="client-profile__package client-profile__package--history">
                          <div className="client-profile__packageTitle">
                            <span className="client-profile__packageName">{pkg.name ?? 'Pacote sem título'}</span>
                            <span className="neo-tag" data-tone={packageTone(pkg.status)}>
                              {packageStatusLabel(pkg.status)}
                            </span>
                          </div>
                          <span className="client-profile__muted">
                            {formatDate(pkg.startedAt)}
                            {pkg.endsAt ? ` → ${formatDate(pkg.endsAt)}` : ''}
                          </span>
                          {formatSessionsProgress(pkg.sessionsTotal, pkg.sessionsUsed) ? (
                            <span className="client-profile__muted">
                              {formatSessionsProgress(pkg.sessionsTotal, pkg.sessionsUsed)}
                            </span>
                          ) : null}
                          {pkg.notes ? <p className="client-profile__noteText">{pkg.notes}</p> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="client-profile__muted">Ainda não existem pacotes registados para este cliente.</p>
            )}
          </section>

          <section className="neo-panel client-profile__card" id="client-plans">
            <div className="client-profile__cardHeader">
              <h2 className="client-profile__sectionTitle">Planos de treino</h2>
              <div className="client-profile__cardHeaderActions">
                <div className="client-profile__cardMeta">
                  <span>{plans.length ? `${plans.length} planos recentes` : 'Sem planos registados'}</span>
                  <span className="client-profile__muted">
                    {activity.activePlans} ativos · {activity.draftPlans} rascunhos · {activity.archivedPlans} arquivados
                  </span>
                </div>
                <div className="client-profile__cardButtons">
                  <Link href="#plan-feedback" className="neo-button neo-button--ghost neo-button--small">
                    Ver feedback
                  </Link>
                  {viewerIsStaff ? (
                    <>
                      <Link href="/dashboard/pt/plans" className="neo-button neo-button--ghost neo-button--small">
                        Gerir planos
                      </Link>
                      {canManagePlans ? (
                        <Link
                          href={`/dashboard/pt/plans/new?clientId=${encodeURIComponent(user.id)}`}
                          className="neo-button neo-button--primary neo-button--small"
                        >
                          Novo plano
                        </Link>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
            {plans.length === 0 ? (
              <p className="client-profile__muted">
                Ainda não existem planos de treino para este cliente. Cria um novo plano para acompanhares a jornada.
              </p>
            ) : (
              <div className="neo-stack neo-stack--md">
                {plans.map((plan) => (
                  <article key={plan.id} className="client-profile__plan">
                    <div className="client-profile__planInfo">
                      <div className="client-profile__planTitle">
                        <span className="client-profile__planName">{plan.title ?? 'Plano sem título'}</span>
                        {plan.status ? <span className="neo-tag" data-tone="neutral">{plan.status}</span> : null}
                      </div>
                      <span className="client-profile__muted">Atualizado em {formatDate(plan.updatedAt)}</span>
                      {plan.trainerName ? (
                        <span className="client-profile__muted">Responsável: {plan.trainerName}</span>
                      ) : null}
                    </div>
                    <Link href={`/dashboard/pt/plans/${plan.id}`} className="neo-button neo-button--ghost neo-button--small">
                      {viewerIsTrainer ? 'Gerir plano' : 'Abrir'}
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="neo-panel client-profile__card" id="client-sessions">
            <div className="client-profile__cardHeader">
              <h2 className="client-profile__sectionTitle">Sessões</h2>
              <div className="client-profile__cardHeaderActions">
                <span className="client-profile__muted">Próximas marcações e histórico recente.</span>
                {viewerIsTrainer ? (
                  <Link
                    href={`/dashboard/pt/sessions/new?clientId=${encodeURIComponent(user.id)}`}
                    className="neo-button neo-button--ghost neo-button--small"
                  >
                    Nova marcação
                  </Link>
                ) : null}
              </div>
            </div>
            <div className="client-profile__sessions">
              <div>
                <h3 className="client-profile__subheading">Próximas sessões</h3>
                {upcomingSessions.length === 0 ? (
                  <p className="client-profile__muted">Não existem sessões agendadas.</p>
                ) : (
                  <ul className="client-profile__sessionList">
                    {upcomingSessions.map((session) => (
                      <li key={session.id}>
                        <span className="client-profile__sessionTitle">{sessionTitle(session)}</span>
                        <span className="client-profile__muted">{formatDate(session.scheduledAt)}</span>
                        {session.location ? <span className="client-profile__muted">Local: {session.location}</span> : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h3 className="client-profile__subheading">Últimas sessões</h3>
                {recentSessions.length === 0 ? (
                  <p className="client-profile__muted">Ainda não existem sessões concluídas.</p>
                ) : (
                  <ul className="client-profile__sessionList">
                    {recentSessions.map((session) => (
                      <li key={session.id}>
                        <span className="client-profile__sessionTitle">{sessionTitle(session)}</span>
                        <span className="client-profile__muted">{formatDate(session.scheduledAt)}</span>
                        {session.location ? <span className="client-profile__muted">Local: {session.location}</span> : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          <section className="neo-panel client-profile__card">
            <div className="client-profile__cardHeader">
              <h2 className="client-profile__sectionTitle">Notas e observações</h2>
              <span className="client-profile__muted">
                {loadingNotes
                  ? 'A carregar notas…'
                  : notes.length
                    ? `${notes.length} nota${notes.length > 1 ? 's' : ''} registada${notes.length > 1 ? 's' : ''}`
                    : 'Sem notas personalizadas'}
              </span>
            </div>
            <div className="neo-stack neo-stack--lg">
              <form className="neo-stack neo-stack--md" onSubmit={submitNote}>
                <label className="neo-input-group__label" htmlFor="note-text">
                  Adicionar nova nota
                </label>
                <textarea
                  id="note-text"
                  className="neo-input neo-input--textarea"
                  placeholder="Registe feedback, progresso ou alertas importantes"
                  value={noteText}
                  onChange={(event) => setNoteText(event.target.value)}
                  rows={4}
                />
                <div className="neo-inline neo-inline--end">
                  <button type="submit" className="neo-button neo-button--primary" disabled={savingNote || !noteTextTrimmed}>
                    {savingNote ? 'A guardar…' : 'Guardar nota'}
                  </button>
                </div>
              </form>

              {loadingNotes ? (
                <div className="client-profile__loading">A carregar notas…</div>
              ) : notes.length ? (
                <div className="neo-stack neo-stack--md">
                  {notes.map((note) => (
                    <article key={note.id} className="client-profile__noteCard">
                      <header className="client-profile__noteHeader">
                        <span className="client-profile__noteAuthor">{note.author || 'Equipa'}</span>
                        <span className="client-profile__muted">{formatDate(note.createdAt)}</span>
                      </header>
                      <p className="client-profile__noteText">{note.text}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="client-profile__muted">Ainda não existem notas registadas para este cliente.</p>
              )}

              {hasAutoNotes ? (
                <div className="neo-stack neo-stack--md">
                  <h3 className="client-profile__subheading">Observações automáticas</h3>
                  {measurement?.notes ? (
                    <article className="client-profile__noteCard client-profile__noteCard--dashed">
                      <header className="client-profile__noteHeader">
                        <span className="client-profile__noteAuthor">Avaliação física ({formatDate(measurement.date)})</span>
                      </header>
                      <p className="client-profile__noteText">{measurement.notes}</p>
                    </article>
                  ) : null}
                  {sessionNotes.map((session) => (
                    <article key={`auto-note-${session.id}`} className="client-profile__noteCard">
                      <header className="client-profile__noteHeader">
                        <span className="client-profile__noteAuthor">Sessão de {formatDate(session.scheduledAt)}</span>
                        {session.trainerName ? (
                          <span className="client-profile__muted">Personal Trainer: {session.trainerName}</span>
                        ) : null}
                      </header>
                      <p className="client-profile__noteText">{session.notes}</p>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

type InfoRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  copyable?: boolean;
};

function InfoRow({ icon, label, value, href, copyable }: InfoRowProps) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const content = (
    <div className="client-profile__infoRow">
      <span className="client-profile__infoIcon" aria-hidden>
        {icon}
      </span>
      <div className="client-profile__infoBody">
        <span className="client-profile__infoLabel">{label}</span>
        <span className="client-profile__infoValue">{value || '—'}</span>
      </div>
      {copyable && value ? (
        <button type="button" className="client-profile__iconButton" onClick={copy} aria-live="polite">
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span className="sr-only">{copied ? 'Valor copiado' : 'Copiar valor'}</span>
        </button>
      ) : null}
    </div>
  );

  if (href && value && value !== '—') {
    const external = href.startsWith('http');
    return (
      <a className="client-profile__infoLink" href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
        {content}
      </a>
    );
  }

  return content;
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M3.75 4h16.5A1.75 1.75 0 0 1 22 5.75v12.5A1.75 1.75 0 0 1 20.25 20H3.75A1.75 1.75 0 0 1 2 18.25V5.75A1.75 1.75 0 0 1 3.75 4Zm0 1.5a.25.25 0 0 0-.25.25v.34l8.27 5.17 8.23-5.17V5.75a.25.25 0 0 0-.25-.25H3.75Zm16.5 3.08-7.8 4.9a.75.75 0 0 1-.8 0l-7.9-4.96v8.48c0 .14.11.25.25.25h16.5c.14 0 .25-.11.25-.25V8.58Z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M7.17 3.45a1.8 1.8 0 0 1 1.86-.43l.21.09a2.5 2.5 0 0 1 1.44 1.7l.58 2.73a1.8 1.8 0 0 1-.58 1.72L9.63 9.2a10.45 10.45 0 0 0 5.18 5.18l.05-.05a1.8 1.8 0 0 1 1.72-.58l2.73.58a2.5 2.5 0 0 1 1.79 1.65l.1.32a1.8 1.8 0 0 1-.4 1.75l-1.48 1.63a2.6 2.6 0 0 1-2.45.78c-7.02-1.44-12.63-7.05-14.07-14.07a2.6 2.6 0 0 1 .78-2.45Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 9.5c4.05 0 7.5 2.43 7.5 5.42V20H4.5v-1.08c0-2.99 3.45-5.42 7.5-5.42Z" />
    </svg>
  );
}

function IdIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 4v10h10V7H7Zm3 2h4a1 1 0 1 1 0 2h-4a1 1 0 1 1 0-2Zm0 4h4a1 1 0 1 1 0 2h-4a1 1 0 1 1 0-2Z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M8 3a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-1v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-1h3a2 2 0 0 0 2-2V3Zm2 0v10H5V5a2 2 0 0 1 2-2h3Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M20.3 5.7a1 1 0 0 1 0 1.4l-9.24 9.24a1 1 0 0 1-1.42 0L3.7 10.4a1 1 0 1 1 1.42-1.42l4.12 4.12 8.53-8.52a1 1 0 0 1 1.42 0Z" />
    </svg>
  );
}
