'use client';

import * as React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle2,
  Loader2,
  Mail,
  RefreshCcw,
  ShieldCheck,
  Smartphone,
  TrendingUp,
} from 'lucide-react';
import clsx from 'clsx';

import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import FitnessQuestionnaireSummary from '@/components/questionnaire/FitnessQuestionnaireSummary';
import { normalizeQuestionnaire } from '@/lib/questionnaire';
import type { FitnessQuestionnaireRow } from '@/lib/questionnaire';
import { normalizeUsername, validateUsernameCandidate } from '@/lib/username';
import type { ProfileDashboardResponse, ProfileHeroMetric, ProfileTimelinePoint } from '@/lib/profile/types';

type Status = { type: 'idle' | 'success' | 'error'; message?: string };

type UsernameStatus =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'available' }
  | { state: 'taken'; reason?: string }
  | { state: 'invalid'; reason?: string }
  | { state: 'error' };

type FormState = {
  name: string;
  username: string;
  phone: string;
  birthDate: string;
  bio: string;
  avatarUrl: string;
};

type TrendProps = {
  trend: ProfileHeroMetric['trend'];
};

function toFormString(value: unknown): string {
  if (value == null) return '';
  return String(value).trim();
}

function sanitizeDate(value: string | null): string {
  if (!value) return '';
  if (value.length >= 10) return value.slice(0, 10);
  return value;
}

function sanitizeForm(account: ProfileDashboardResponse['account']): FormState {
  return {
    name: toFormString(account.name),
    username: toFormString(account.username),
    phone: toFormString(account.phone),
    birthDate: sanitizeDate(account.birthDate),
    bio: toFormString(account.bio),
    avatarUrl: toFormString(account.avatarUrl),
  };
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
}

type TemporalDescriptor = { absolute: string; relative: string | null };

const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' });

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

function formatRelativeTimestamp(iso: string | null | undefined, now: number): string | null {
  if (!iso) return null;
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return null;

  const diff = target.getTime() - now;
  const abs = Math.abs(diff);

  let unit: Intl.RelativeTimeFormatUnit;
  let value: number;

  if (abs < 30 * SECOND) {
    unit = 'second';
    value = Math.round(diff / SECOND);
  } else if (abs < 45 * MINUTE) {
    unit = 'minute';
    value = Math.round(diff / MINUTE);
  } else if (abs < 36 * HOUR) {
    unit = 'hour';
    value = Math.round(diff / HOUR);
  } else if (abs < 10 * DAY) {
    unit = 'day';
    value = Math.round(diff / DAY);
  } else if (abs < 8 * WEEK) {
    unit = 'week';
    value = Math.round(diff / WEEK);
  } else if (abs < 18 * MONTH) {
    unit = 'month';
    value = Math.round(diff / MONTH);
  } else {
    unit = 'year';
    value = Math.round(diff / YEAR);
  }

  return RELATIVE_TIME_FORMATTER.format(value, unit);
}

function getTemporalDescriptor(iso: string | null | undefined, now: number): TemporalDescriptor | null {
  if (!iso) return null;
  const absolute = formatTimestamp(iso);
  if (absolute === '—') return null;
  const relative = formatRelativeTimestamp(iso, now);
  return { absolute, relative };
}

function applyServerPatch(base: FormState, patch: unknown): FormState {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  const next: FormState = { ...base };
  if ('name' in record) next.name = toFormString(record.name);
  if ('username' in record) next.username = toFormString(record.username);
  if ('phone' in record) next.phone = toFormString(record.phone);
  if ('bio' in record) next.bio = toFormString(record.bio);
  if ('avatar_url' in record) next.avatarUrl = toFormString(record.avatar_url);
  if ('birth_date' in record) next.birthDate = sanitizeDate(toFormString(record.birth_date));
  return next;
}

function TrendPill({ trend }: TrendProps) {
  if (!trend) return null;
  return (
    <span className={clsx('profile-hero__trend', trend.direction)} aria-label={trend.label}>
      <TrendingUp aria-hidden />
      {trend.label}
    </span>
  );
}

function TimelineTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as ProfileTimelinePoint;
  return (
    <div className="profile-timeline__tooltip">
      <span className="profile-timeline__tooltipLabel">{point.label}</span>
      <p>
        <strong>{point.completed}</strong> sessões confirmadas
      </p>
      <p>
        <strong>{point.scheduled}</strong> agendadas
      </p>
      <p>
        <strong>{point.cancelled}</strong> canceladas
      </p>
    </div>
  );
}

function resolveUsernameHelper(value: string, status: UsernameStatus) {
  const trimmed = value.trim();
  if (!trimmed) {
    return {
      message: 'Opcional. Usa letras, números, ponto, hífen ou underscore.',
      tone: 'muted' as const,
    };
  }

  switch (status.state) {
    case 'checking':
      return { message: 'A verificar disponibilidade…', tone: 'checking' as const };
    case 'taken':
      return { message: 'Este username já está em uso.', tone: 'error' as const };
    case 'invalid':
      if (status.reason === 'reserved') {
        return { message: 'Este username não está disponível.', tone: 'error' as const };
      }
      return { message: 'Escolhe um identificador com 3 a 30 caracteres válidos.', tone: 'error' as const };
    case 'error':
      return { message: 'Não foi possível validar agora.', tone: 'error' as const };
    case 'available':
      return { message: 'Perfeito! Este username está disponível.', tone: 'success' as const };
    case 'idle':
    default:
      return { message: 'Este será o teu identificador público.', tone: 'muted' as const };
  }
}

type QuestionnaireResponse = {
  ok: boolean;
  data?: FitnessQuestionnaireRow | null;
  error?: string;
};

async function fetchProfileDashboard(url: string): Promise<ProfileDashboardResponse> {
  const res = await fetch(url, { cache: 'no-store' });
  const payload = await res.json().catch(() => null);

  if (payload && typeof payload === 'object' && (payload as { ok?: boolean }).ok === true) {
    return payload as ProfileDashboardResponse;
  }

  const message =
    payload && typeof payload === 'object' && typeof (payload as { message?: unknown }).message === 'string'
      ? ((payload as { message: string }).message || 'Não foi possível actualizar os dados do perfil.')
      : 'Não foi possível actualizar os dados do perfil.';

  throw Object.assign(new Error(message), { payload, status: res.status });
}

async function fetchQuestionnaire(url: string): Promise<QuestionnaireResponse> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const payload = (await res.json().catch(() => null)) as QuestionnaireResponse | null;
    if (payload && typeof payload === 'object' && typeof payload.ok === 'boolean') {
      if (!payload.ok && !payload.error) {
        return { ok: false, error: 'Não foi possível carregar o questionário.' };
      }
      return payload;
    }
    return { ok: false, error: 'Não foi possível carregar o questionário.' };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Não foi possível carregar o questionário.' };
  }
}

function extractErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
    return String((error as { message: string }).message);
  }
  return null;
}

export default function ProfileClient({
  initialDashboard,
  initialQuestionnaire,
}: {
  initialDashboard: ProfileDashboardResponse;
  initialQuestionnaire: QuestionnaireResponse | null;
}) {
  const {
    data,
    mutate,
    isValidating,
    error: dashboardError,
  } = useSWR<ProfileDashboardResponse, Error>('/api/profile/dashboard', fetchProfileDashboard, {
    fallbackData: initialDashboard,
    revalidateOnFocus: false,
  });

  const {
    data: questionnaireResp,
    isValidating: questionnaireValidating,
    mutate: mutateQuestionnaire,
  } = useSWR<QuestionnaireResponse>('/api/profile/questionnaire', fetchQuestionnaire, {
    revalidateOnFocus: false,
    fallbackData: initialQuestionnaire ?? undefined,
  });

  const questionnaireRow = questionnaireResp?.ok ? questionnaireResp.data ?? null : null;
  const questionnaireError = questionnaireResp && !questionnaireResp.ok
    ? typeof questionnaireResp.error === 'string'
      ? questionnaireResp.error
      : 'Não foi possível carregar o questionário.'
    : null;
  const questionnaire = React.useMemo(() => normalizeQuestionnaire(questionnaireRow ?? null), [questionnaireRow]);
  const questionnaireLoading = !questionnaireResp && questionnaireValidating;
  const refreshBusy = isValidating || questionnaireValidating;
  const [refreshStatus, setRefreshStatus] = React.useState<Status>({ type: 'idle' });
  const questionnaireReminderActive =
    !questionnaireError &&
    !questionnaireLoading &&
    (questionnaire?.status ?? 'draft') !== 'submitted';

  const retryQuestionnaire = React.useCallback(() => {
    void mutateQuestionnaire(undefined, { revalidate: true });
  }, [mutateQuestionnaire]);

  const refreshStatusId = React.useId();

  const [relativeNow, setRelativeNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const updateNow = () => setRelativeNow(Date.now());
    const handleVisibility = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        updateNow();
      }
    };

    updateNow();

    const interval = window.setInterval(updateNow, 60000);
    window.addEventListener('focus', updateNow);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility);
    }

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', updateNow);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility);
      }
    };
  }, []);

  let questionnaireBadgeVariant: 'success' | 'warning' | 'neutral' = 'warning';
  let questionnaireBadgeLabel = 'Por preencher';
  if (questionnaire?.status === 'submitted') {
    questionnaireBadgeVariant = 'success';
    questionnaireBadgeLabel = 'Submetido';
  } else if (questionnaire?.status === 'draft') {
    questionnaireBadgeVariant = 'warning';
    questionnaireBadgeLabel = 'Em rascunho';
  } else if (questionnaireError) {
    questionnaireBadgeVariant = 'neutral';
    questionnaireBadgeLabel = 'Indisponível';
  }

  const dashboard = data ?? initialDashboard;
  const account = dashboard.account;
  const nextReminderDescriptor = React.useMemo(
    () => getTemporalDescriptor(dashboard.notifications.nextReminderAt, relativeNow),
    [dashboard.notifications.nextReminderAt, relativeNow],
  );
  const lastDeliveryDescriptor = React.useMemo(
    () => getTemporalDescriptor(dashboard.notifications.lastDeliveryAt, relativeNow),
    [dashboard.notifications.lastDeliveryAt, relativeNow],
  );
  const unreadNotificationsLabel = React.useMemo(() => {
    const raw = dashboard.notifications.unread;
    const unread = typeof raw === 'number' && Number.isFinite(raw) ? raw : Number(raw ?? 0);
    if (Number.isNaN(unread) || unread <= 0) return 'Sem alertas por ler';
    if (unread === 1) return '1 alerta por ler';
    return `${unread} alertas por ler`;
  }, [dashboard.notifications.unread]);
  const notificationsLastDeliveryMessage = React.useMemo(() => {
    if (!lastDeliveryDescriptor) {
      return 'Ainda não recebeste alertas automáticos.';
    }
    if (lastDeliveryDescriptor.relative) {
      return `Último envio ${lastDeliveryDescriptor.relative} (${lastDeliveryDescriptor.absolute}).`;
    }
    return `Último envio ${lastDeliveryDescriptor.absolute}.`;
  }, [lastDeliveryDescriptor]);
  const nextReminderMessage = React.useMemo(() => {
    if (!nextReminderDescriptor) return null;
    if (nextReminderDescriptor.relative) {
      return `Próximo lembrete ${nextReminderDescriptor.relative} (${nextReminderDescriptor.absolute}).`;
    }
    return `Próximo lembrete ${nextReminderDescriptor.absolute}.`;
  }, [nextReminderDescriptor]);

  const [form, setForm] = React.useState<FormState>(() => sanitizeForm(account));
  const [baseline, setBaseline] = React.useState<FormState>(() => sanitizeForm(account));
  const [status, setStatus] = React.useState<Status>({ type: 'idle' });
  const [saving, setSaving] = React.useState(false);
  const [avatarBusy, setAvatarBusy] = React.useState(false);
  const [usernameStatus, setUsernameStatus] = React.useState<UsernameStatus>({ state: 'idle' });
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const usernameHintId = React.useId();
  const statusId = React.useId();

  React.useEffect(() => {
    const next = sanitizeForm(account);
    setForm(next);
    setBaseline(next);
  }, [account.id, account.updatedAt, account.email, account.username, account.phone, account.birthDate, account.bio, account.avatarUrl, account.name]);

  React.useEffect(() => {
    const candidate = form.username.trim();
    const baselineUsername = baseline.username.trim();
    if (!candidate || candidate === baselineUsername) {
      setUsernameStatus({ state: 'idle' });
      return;
    }

    const validation = validateUsernameCandidate(candidate);
    if (!validation.ok) {
      const reason = 'reason' in validation ? validation.reason : undefined;
      setUsernameStatus({ state: 'invalid', reason });
      return;
    }

    const normalizedCandidate = validation.normalized;
    const normalizedBaseline = baselineUsername ? normalizeUsername(baselineUsername) : '';
    if (normalizedCandidate === normalizedBaseline) {
      setUsernameStatus({ state: 'idle' });
      return;
    }

    const controller = new AbortController();
    setUsernameStatus({ state: 'checking' });

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/username/check?u=${encodeURIComponent(candidate)}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        const payload = await res.json().catch(() => null);
        if (!res.ok || !payload?.ok) {
          setUsernameStatus({ state: 'error' });
          return;
        }
        if (payload.reason === 'INVALID_OR_RESERVED') {
          setUsernameStatus({ state: 'invalid', reason: 'reserved' });
          return;
        }
        setUsernameStatus(payload.available ? { state: 'available' } : { state: 'taken' });
      } catch (error) {
        if ((error as { name?: string } | null)?.name === 'AbortError') return;
        setUsernameStatus({ state: 'error' });
      }
    }, 400);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [form.username, baseline.username]);

  const dirty = React.useMemo(() => {
    return (
      form.name.trim() !== baseline.name.trim() ||
      form.username.trim() !== baseline.username.trim() ||
      form.phone.trim() !== baseline.phone.trim() ||
      form.birthDate !== baseline.birthDate ||
      form.bio.trim() !== baseline.bio.trim() ||
      form.avatarUrl.trim() !== baseline.avatarUrl.trim()
    );
  }, [form, baseline]);

  const usernameHelper = React.useMemo(() => resolveUsernameHelper(form.username, usernameStatus), [
    form.username,
    usernameStatus,
  ]);

  React.useEffect(() => {
    if (!dashboardError) return;
    setRefreshStatus((current) => {
      if (current.type !== 'idle') return current;
      return {
        type: 'error',
        message: extractErrorMessage(dashboardError) ?? 'Não foi possível actualizar os dados do perfil.',
      };
    });
  }, [dashboardError]);

  React.useEffect(() => {
    if (refreshStatus.type !== 'success') return;
    const timeout = setTimeout(() => {
      setRefreshStatus({ type: 'idle' });
    }, 4000);
    return () => clearTimeout(timeout);
  }, [refreshStatus.type]);

  async function refreshDashboard() {
    setRefreshStatus({ type: 'idle' });
    const [dashboardResult, questionnaireResult] = await Promise.allSettled([
      mutate(undefined, { revalidate: true }),
      mutateQuestionnaire(undefined, { revalidate: true }),
    ]);

    const messages = new Set<string>();

    if (dashboardResult.status === 'rejected') {
      messages.add(extractErrorMessage(dashboardResult.reason) ?? 'Não foi possível actualizar os dados do perfil.');
    }

    if (questionnaireResult.status === 'rejected') {
      messages.add(extractErrorMessage(questionnaireResult.reason) ?? 'Não foi possível actualizar o questionário.');
    } else if (questionnaireResult.value && questionnaireResult.value.ok === false) {
      messages.add(questionnaireResult.value.error ?? 'Não foi possível actualizar o questionário.');
    }

    if (messages.size > 0) {
      setRefreshStatus({ type: 'error', message: Array.from(messages).join(' ') });
      return;
    }

    if (
      dashboardResult.status === 'fulfilled' ||
      (questionnaireResult.status === 'fulfilled' && questionnaireResult.value?.ok)
    ) {
      setRelativeNow(Date.now());
    }

    setRefreshStatus({ type: 'success', message: 'Dados sincronizados com sucesso.' });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || !dirty) return;

    if (usernameStatus.state === 'checking') return;
    if (usernameStatus.state === 'taken') {
      setStatus({ type: 'error', message: 'Este username já está em uso.' });
      return;
    }
    if (usernameStatus.state === 'invalid') {
      setStatus({ type: 'error', message: 'Escolhe um username válido (3-30 caracteres).' });
      return;
    }

    setSaving(true);
    setStatus({ type: 'idle' });

    const payload: Record<string, unknown> = {};
    const next: FormState = {
      name: form.name.trim(),
      username: form.username.trim(),
      phone: form.phone.trim(),
      birthDate: form.birthDate,
      bio: form.bio.trim(),
      avatarUrl: form.avatarUrl.trim(),
    };

    const baselineName = baseline.name.trim();
    const baselineUsername = baseline.username.trim();
    const baselinePhone = baseline.phone.trim();
    const baselineBio = baseline.bio.trim();
    const baselineAvatar = baseline.avatarUrl.trim();

    if (next.name !== baselineName) payload.name = next.name;

    const normalizedBaselineUsername = baselineUsername ? normalizeUsername(baselineUsername) : '';
    const normalizedNextUsername = next.username ? normalizeUsername(next.username) : '';
    next.username = normalizedNextUsername;
    if (normalizedNextUsername !== normalizedBaselineUsername) {
      payload.username = normalizedNextUsername || null;
    }

    if (next.phone !== baselinePhone) payload.phone = next.phone || null;
    if (next.birthDate !== baseline.birthDate) payload.birth_date = next.birthDate || null;
    if (next.bio !== baselineBio) payload.bio = next.bio || null;
    if (next.avatarUrl !== baselineAvatar) payload.avatar_url = next.avatarUrl || null;

    try {
      const res = await fetch('/api/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const response = await res.json().catch(() => null);
      if (!res.ok || !response?.ok) {
        if (response?.error === 'USERNAME_TAKEN') {
          setUsernameStatus({ state: 'taken' });
          throw new Error('Este username já está em uso.');
        }
        if (response?.error === 'INVALID_USERNAME') {
          throw new Error('O username escolhido não é válido.');
        }
        if (response?.error === 'INVALID_DATE') {
          throw new Error('Insere uma data válida (AAAA-MM-DD).');
        }
        throw new Error('Não foi possível guardar as alterações.');
      }

      const merged = applyServerPatch(next, response?.profile);
      setBaseline(merged);
      setForm(merged);
      setStatus({ type: 'success', message: 'Perfil actualizado com sucesso.' });
      await refreshDashboard();
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível guardar as alterações.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function onAvatarSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarBusy(true);
    setStatus({ type: 'idle' });
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/me/avatar', { method: 'POST', body: fd });
      const response = await res.json().catch(() => null);
      if (!res.ok || !response?.ok) {
        throw new Error('Não foi possível actualizar a fotografia.');
      }
      const url = String(response.avatar_url || '').trim();
      const next = { ...baseline, avatarUrl: url };
      setBaseline(next);
      setForm(next);
      setStatus({ type: 'success', message: 'Fotografia actualizada.' });
      await refreshDashboard();
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível actualizar a fotografia.',
      });
    } finally {
      setAvatarBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  const highlightItems = React.useMemo(() => {
    const base = Array.isArray(dashboard.highlights) ? dashboard.highlights : [];
    if (!questionnaireReminderActive) return base;
    const filtered = base.filter((item) => item.id !== 'questionnaire-reminder');
    const reminderSuffix = nextReminderMessage ? ` ${nextReminderMessage}` : '';
    return [
      {
        id: 'questionnaire-reminder',
        title: 'Questionário em falta',
        description:
          `Completa o questionário obrigatório para personalizarmos o plano e parar os lembretes automáticos.${reminderSuffix}`,
        tone: 'warning' as const,
      },
      ...filtered,
    ];
  }, [
    dashboard.highlights,
    nextReminderMessage,
    questionnaireReminderActive,
  ]);

  const heroHighlight = highlightItems[0];
  const HeroHighlightIcon = heroHighlight?.id === 'questionnaire-reminder' ? AlertTriangle : ShieldCheck;

  return (
    <div className="profile-dashboard">
      <PageHeader
        title="Perfil"
        subtitle="Actualiza os teus dados pessoais e acompanha a tua actividade recente."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={refreshDashboard}
            leftIcon={refreshBusy ? <Loader2 className="icon-spin" aria-hidden /> : <RefreshCcw className="icon" aria-hidden />}
            disabled={refreshBusy}
            aria-describedby={refreshStatus.type !== 'idle' ? refreshStatusId : undefined}
          >
            Actualizar dados
          </Button>
        }
      />

      {refreshStatus.type !== 'idle' ? (
        <Alert
          id={refreshStatusId}
          tone={refreshStatus.type === 'success' ? 'success' : 'danger'}
          className="profile-dashboard__refreshAlert neo-alert--inline"
          title={
            refreshStatus.message ??
            (refreshStatus.type === 'success'
              ? 'Dados sincronizados com sucesso.'
              : 'Não foi possível actualizar os dados.')
          }
        />
      ) : null}

      {questionnaireReminderActive ? (
        <Alert
          tone="warning"
          className="profile-dashboard__reminder"
          title="Completa o questionário obrigatório"
        >
          Ainda temos perguntas essenciais por responder. Vais continuar a receber lembretes automáticos até concluir.
          {nextReminderMessage ? (
            <>
              <br />
              <span className="profile-dashboard__reminderHint">{nextReminderMessage}</span>
            </>
          ) : null}
          <br />
          <Link href="/dashboard/onboarding" className="btn chip profile-dashboard__reminderAction">
            Preencher agora
          </Link>
        </Alert>
      ) : null}

      <section className="neo-panel profile-dashboard__hero">
        <div className="profile-dashboard__heroHeader">
          <div className="profile-dashboard__heroIdentity">
            <div className="profile-dashboard__avatar" aria-hidden>
              {form.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.avatarUrl} alt={account.name ?? account.email} />
              ) : (
                <span>{(account.name ?? account.email).slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h1>{account.name || account.email}</h1>
              <p>{account.email}</p>
              {account.role ? <span className="profile-dashboard__role">{account.role}</span> : null}
            </div>
          </div>
          {heroHighlight ? (
            <div className={clsx('profile-dashboard__highlight', heroHighlight.tone)}>
              <HeroHighlightIcon aria-hidden />
              <div className="profile-dashboard__highlightContent">
                <strong>{heroHighlight.title}</strong>
                <p>{heroHighlight.description}</p>
                {heroHighlight.id === 'questionnaire-reminder' ? (
                  <Link
                    href="/dashboard/onboarding"
                    className="btn chip profile-dashboard__highlightAction"
                    aria-label="Preencher o questionário obrigatório"
                  >
                    Preencher agora
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className="profile-dashboard__heroMetrics">
          {dashboard.hero.map((metric) => (
            <article key={metric.id} className={clsx('profile-hero__metric', metric.tone)}>
              <header>
                <span>{metric.label}</span>
                <TrendPill trend={metric.trend ?? null} />
              </header>
              <strong>{metric.value}</strong>
              <p>{metric.helper}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="neo-panel profile-dashboard__questionnaire"
        aria-busy={questionnaireValidating ? 'true' : undefined}
      >
        <header className="profile-dashboard__questionnaireHeader">
          <div>
            <h2>Avaliação física</h2>
            <p>Resumo das respostas partilhadas com o teu Personal Trainer.</p>
          </div>
          <div className="profile-dashboard__questionnaireStatus">
            <Badge variant={questionnaireBadgeVariant}>{questionnaireBadgeLabel}</Badge>
            {questionnaireValidating ? (
              <span className="profile-dashboard__questionnaireSpinner">
                <Loader2 className="icon-spin" aria-hidden />
                <span className="sr-only">A actualizar o questionário…</span>
              </span>
            ) : null}
          </div>
        </header>

        {questionnaireLoading ? (
          <div className="profile-dashboard__questionnaireLoading">
            <Loader2 className="icon-spin" aria-hidden /> A carregar dados do questionário…
          </div>
        ) : questionnaire ? (
          <FitnessQuestionnaireSummary data={questionnaire} variant="compact" />
        ) : questionnaireError ? (
          <div className="profile-dashboard__questionnaireError">
            <Alert tone="danger" className="neo-alert--inline" title={questionnaireError} />
            <Button
              variant="ghost"
              size="sm"
              onClick={retryQuestionnaire}
              leftIcon={<RefreshCcw className="icon" aria-hidden />}
              disabled={questionnaireValidating}
            >
              Tentar novamente
            </Button>
          </div>
        ) : (
          <div className="profile-dashboard__questionnaireEmpty">
            <p>
              Ainda não preencheste o questionário obrigatório. Isto ajuda a equipa a personalizar o plano.
            </p>
            <Link href="/dashboard/onboarding" className="btn chip">
              Preencher agora
            </Link>
          </div>
        )}
      </section>

      <div className="profile-dashboard__grid">
        <section className="neo-panel profile-dashboard__timeline">
          <header>
            <div>
              <h2>Evolução das sessões</h2>
              <p>Resumo das últimas duas semanas de actividade.</p>
            </div>
            <CalendarClock aria-hidden />
          </header>
          <div className="profile-timeline__chart">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dashboard.timeline} margin={{ left: 12, right: 12, top: 16, bottom: 0 }}>
                <defs>
                  <linearGradient id="profileScheduled" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="var(--neo-chart-primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--neo-chart-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profileCompleted" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="var(--neo-chart-success)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="var(--neo-chart-success)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profileCancelled" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="var(--neo-chart-danger)" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="var(--neo-chart-danger)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--neo-chart-grid)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                <Tooltip content={<TimelineTooltip />} cursor={{ strokeDasharray: '4 4' }} />
                <Area
                  type="monotone"
                  dataKey="scheduled"
                  stroke="var(--neo-chart-primary)"
                  fill="url(#profileScheduled)"
                  strokeWidth={2}
                  name="Agendadas"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="var(--neo-chart-success)"
                  fill="url(#profileCompleted)"
                  strokeWidth={2}
                  name="Confirmadas"
                />
                <Area
                  type="monotone"
                  dataKey="cancelled"
                  stroke="var(--neo-chart-danger)"
                  fill="url(#profileCancelled)"
                  strokeWidth={2}
                  name="Canceladas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="neo-panel profile-dashboard__summary">
          <header>
            <div>
              <h2>Resumo & completude</h2>
              <p>Garante que a tua conta está completa para desbloquear todos os recursos.</p>
            </div>
            <CheckCircle2 aria-hidden />
          </header>
          <div className="profile-completion">
            <div className="profile-completion__progress" aria-label={`Perfil completo ${dashboard.completion.percentage}%`}>
              <div style={{ width: `${dashboard.completion.percentage}%` }} />
              <span>{dashboard.completion.percentage}% completo</span>
            </div>
            {dashboard.completion.missing.length ? (
              <ul>
                {dashboard.completion.missing.map((item) => (
                  <li key={item.id}>{item.label}: {item.action}</li>
                ))}
              </ul>
            ) : (
              <p>Todas as informações essenciais estão preenchidas. 👏</p>
            )}
          </div>

          <div className="profile-summary__notifications" data-reminder={questionnaireReminderActive ? 'true' : undefined}>
            <Bell aria-hidden />
            <div>
              <strong>
                {questionnaireReminderActive ? 'Lembretes automáticos activos' : unreadNotificationsLabel}
              </strong>
              <p>{notificationsLastDeliveryMessage}</p>
              {questionnaireReminderActive ? (
                <>
                  <p className="profile-summary__notificationsReminder">
                    O questionário obrigatório continua por preencher.
                    {nextReminderMessage ? ` ${nextReminderMessage}` : ' Receberás um novo lembrete em breve.'}
                  </p>
                  <Link
                    href="/dashboard/onboarding"
                    className="btn chip profile-summary__notificationsAction"
                    aria-label="Preencher o questionário obrigatório"
                  >
                    Preencher agora
                  </Link>
                </>
              ) : nextReminderMessage ? (
                <p className="profile-summary__notificationsReminder">{nextReminderMessage}</p>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      <section className="neo-panel profile-dashboard__form">
        <header>
          <div>
            <h2>Dados pessoais</h2>
            <p>Actualiza a forma como és apresentado em planos, mensagens e relatórios.</p>
          </div>
          <div className="profile-dashboard__avatarActions">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onAvatarSelected} hidden />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              leftIcon={avatarBusy ? <Loader2 className="icon-spin" aria-hidden /> : <Smartphone className="icon" aria-hidden />}
              loading={avatarBusy}
            >
              Alterar fotografia
            </Button>
            {form.avatarUrl ? (
              <button type="button" className="profile-dashboard__avatarRemove" onClick={() => setForm((prev) => ({ ...prev, avatarUrl: '' }))}>
                Remover fotografia
              </button>
            ) : null}
          </div>
        </header>

        <form className="profile-form" onSubmit={onSubmit} noValidate>
          <div className="profile-form__grid">
            <label>
              <span>Nome</span>
              <input
                type="text"
                className="neo-field"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="O teu nome"
                autoComplete="name"
              />
            </label>
            <label>
              <span>Email</span>
              <input type="email" className="neo-field" value={account.email} disabled />
            </label>
            <label className="profile-form__full">
              <span>Username</span>
              <input
                type="text"
                className={clsx('neo-field', {
                  'neo-field--invalid': usernameStatus.state === 'taken' || usernameStatus.state === 'invalid',
                })}
                value={form.username}
                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                placeholder="Ex.: joana.cardoso"
                aria-describedby={usernameHintId}
                autoComplete="nickname"
              />
              <span id={usernameHintId} data-tone={usernameHelper.tone}>
                {usernameHelper.message}
              </span>
            </label>
            <label>
              <span>Telefone</span>
              <input
                type="tel"
                className="neo-field"
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="(+351) 910 000 000"
                autoComplete="tel"
              />
            </label>
            <label>
              <span>Data de nascimento</span>
              <input
                type="date"
                className="neo-field"
                value={form.birthDate}
                onChange={(event) => setForm((prev) => ({ ...prev, birthDate: event.target.value }))}
              />
            </label>
            <label className="profile-form__full">
              <span>Biografia</span>
              <textarea
                className="neo-field"
                rows={4}
                value={form.bio}
                onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
                placeholder="Partilha objectivos, contexto ou preferências."
              />
            </label>
          </div>

          <div className="profile-form__actions">
            <ProfileStatus status={status} id={statusId} />
            <Button
              type="submit"
              variant="primary"
              leftIcon={saving ? <Loader2 className="icon-spin" aria-hidden /> : <CheckCircle2 className="icon" aria-hidden />}
              disabled={!dirty || saving || usernameStatus.state === 'checking'}
              loading={saving}
            >
              Guardar alterações
            </Button>
          </div>
        </form>
      </section>

      <div className="profile-dashboard__columns">
        <section className="neo-panel profile-dashboard__preferences">
          <header>
            <div>
              <h2>Preferências de notificação</h2>
              <p>Revê os canais activos para alertas críticos e lembretes.</p>
            </div>
            <Mail aria-hidden />
          </header>
          <ul>
            {dashboard.preferences.map((preference) => (
              <li key={preference.channel} data-enabled={preference.enabled}>
                <div>
                  <strong>{preference.label}</strong>
                  <p>{preference.helper}</p>
                </div>
                <span>
                  {preference.enabled ? 'Activo' : 'Inactivo'}
                  {preference.updatedAt ? ` · actualizado ${new Date(preference.updatedAt).toLocaleDateString('pt-PT')}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="neo-panel profile-dashboard__devices">
          <header>
            <div>
              <h2>Dispositivos sincronizados</h2>
              <p>Controla acessos e sessões activas com notificações push.</p>
            </div>
            <Smartphone aria-hidden />
          </header>
          <ul>
            {dashboard.devices.length ? (
              dashboard.devices.map((device) => (
                <li key={device.id} data-risk={device.risk}>
                  <div>
                    <strong>{device.name}</strong>
                    <p>{device.platform}</p>
                  </div>
                  <span>{device.lastActiveAt ? new Date(device.lastActiveAt).toLocaleString('pt-PT') : 'Sem actividade'}</span>
                </li>
              ))
            ) : (
              <li className="profile-dashboard__empty">Nenhum dispositivo registado.</li>
            )}
          </ul>
        </section>
      </div>

      <section className="neo-panel profile-dashboard__activity">
        <header>
          <div>
            <h2>Actividade recente</h2>
            <p>Os registos mais relevantes associados à tua conta.</p>
          </div>
          <ShieldCheck aria-hidden />
        </header>
        <ul>
          {dashboard.activity.length ? (
            dashboard.activity.map((entry) => (
              <li key={entry.id} data-tone={entry.tone}>
                <div>
                  <strong>{entry.title}</strong>
                  <p>{entry.description}</p>
                </div>
                <time dateTime={entry.at ?? undefined}>
                  {entry.at ? new Date(entry.at).toLocaleString('pt-PT') : '—'}
                </time>
              </li>
            ))
          ) : (
            <li className="profile-dashboard__empty">Sem registos recentes.</li>
          )}
        </ul>
      </section>
    </div>
  );
}

function ProfileStatus({ status, id }: { status: Status; id: string }) {
  if (status.type === 'idle') return null;
  const tone = status.type === 'success' ? 'success' : 'danger';
  const message =
    status.message ??
    (status.type === 'success'
      ? 'Alterações guardadas com sucesso.'
      : 'Não foi possível concluir a acção.');
  return <Alert id={id} tone={tone} className="profile-status" title={message} />;
}
