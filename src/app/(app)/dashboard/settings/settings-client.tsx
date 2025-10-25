'use client';

import * as React from 'react';
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
  BellRing,
  Laptop,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { useColorMode } from '@/components/layout/ColorModeProvider';
import type { AppRole } from '@/lib/roles';
import {
  defaultAdminSettings,
  defaultClientSettings,
  defaultTrainerSettings,
  type AdminSettings,
  type ClientSettings,
  type NotificationPreferences,
  type ThemePreference,
  type TrainerSettings,
} from '@/lib/settings/defaults';
import { normalizePhone, phoneDigitCount, PHONE_MIN_DIGITS, PHONE_MAX_DIGITS } from '@/lib/phone';
import type {
  SettingsActivity,
  SettingsDashboardData,
  SettingsDashboardResponse,
  SettingsDevice,
  SettingsModel,
} from '@/lib/settings/types';

const RANGE_OPTIONS = [
  { value: '30', label: '30 dias' },
  { value: '60', label: '60 dias' },
  { value: '90', label: '90 dias' },
] as const;

type RangeValue = (typeof RANGE_OPTIONS)[number]['value'];

type Status = { type: 'idle' | 'success' | 'error'; message?: string };

const MIN_NAME_LENGTH = 3;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AccountState = { name: string; phone: string | null; email: string };

type PreferencesState = {
  language: string;
  theme: ThemePreference;
  notifications: NotificationPreferences;
};

type RolePreferences =
  | { role: 'ADMIN'; value: AdminSettings }
  | { role: 'PT'; value: TrainerSettings }
  | { role: 'CLIENT'; value: ClientSettings };

type DashboardResult = SettingsDashboardResponse & { ok: true };

type DashboardFetcherError = Error & { status?: number };

function toAccountFormState(account: AccountState): AccountState {
  const normalized = account.phone ? normalizePhone(account.phone) : '';
  return {
    name: account.name,
    email: account.email,
    phone: normalized.length ? normalized : null,
  };
}

function toPreferencesFormState(prefs: PreferencesState): PreferencesState {
  return {
    language: prefs.language,
    theme: prefs.theme,
    notifications: { ...prefs.notifications },
  };
}

function cloneRolePreferences(role: AppRole, value: RolePreferences['value']): RolePreferences['value'] {
  if (role === 'ADMIN') {
    return { ...(value as AdminSettings) };
  }
  if (role === 'PT') {
    return { ...(value as TrainerSettings) };
  }
  return { ...(value as ClientSettings) };
}

function isEqualRolePreferences(role: AppRole, a: RolePreferences['value'], b: RolePreferences['value']) {
  if (role === 'ADMIN') {
    const prefA = a as AdminSettings;
    const prefB = b as AdminSettings;
    return (
      prefA.digestFrequency === prefB.digestFrequency &&
      prefA.autoAssignTrainers === prefB.autoAssignTrainers &&
      prefA.shareInsights === prefB.shareInsights
    );
  }
  if (role === 'PT') {
    const prefA = a as TrainerSettings;
    const prefB = b as TrainerSettings;
    return (
      prefA.sessionReminders === prefB.sessionReminders &&
      prefA.newClientAlerts === prefB.newClientAlerts &&
      prefA.calendarVisibility === prefB.calendarVisibility &&
      prefA.allowClientReschedule === prefB.allowClientReschedule
    );
  }
  const prefA = a as ClientSettings;
  const prefB = b as ClientSettings;
  return (
    prefA.planReminders === prefB.planReminders &&
    prefA.trainerMessages === prefB.trainerMessages &&
    prefA.shareProgress === prefB.shareProgress &&
    prefA.smsReminders === prefB.smsReminders
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <section className="neo-panel settings-section">{children}</section>;
}

type FieldTone = 'muted' | 'warning' | 'error';

function Field({
  label,
  description,
  children,
  tone = 'muted',
}: {
  label: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  tone?: FieldTone;
}) {
  const hintClassName = `settings-field__hint${tone !== 'muted' ? ` settings-field__hint--${tone}` : ''}`;
  return (
    <label className="settings-field">
      <span className="settings-field__label">{label}</span>
      {children}
      {description ? <span className={hintClassName}>{description}</span> : null}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled,
  autoComplete,
  inputMode,
  maxLength,
  invalid,
  autoCapitalize,
  spellCheck,
  onBlur,
  onFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
  invalid?: boolean;
  autoCapitalize?: React.InputHTMLAttributes<HTMLInputElement>['autoCapitalize'];
  spellCheck?: boolean;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      type={type}
      disabled={disabled}
      placeholder={placeholder}
      autoComplete={autoComplete}
      inputMode={inputMode}
      maxLength={maxLength}
      autoCapitalize={autoCapitalize}
      spellCheck={spellCheck}
      aria-invalid={invalid ? 'true' : undefined}
      onBlur={onBlur}
      onFocus={onFocus}
      className="neo-field"
    />
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="settings-checkbox">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="neo-checkbox"
      />
      <span>{label}</span>
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="neo-field"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function StatusMessage({ status }: { status: Status }) {
  if (status.type === 'idle') return null;
  const tone = status.type === 'success' ? 'var(--success)' : 'var(--danger)';
  const ariaLive = status.type === 'error' ? 'assertive' : 'polite';
  return (
    <p className="settings-status" style={{ color: tone }} role="status" aria-live={ariaLive} aria-atomic="true">
      {status.message}
    </p>
  );
}

function isEqualNotifications(a: NotificationPreferences, b: NotificationPreferences) {
  return a.email === b.email && a.push === b.push && a.sms === b.sms && a.summary === b.summary;
}

function formatRelativeLabel(value: string | null | undefined) {
  if (!value) return '—';
  try {
    return new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' }).format(
      Math.round((new Date(value).getTime() - Date.now()) / 86_400_000),
      'day',
    );
  } catch {
    return '—';
  }
}

function formatRelativeMoment(value: string | null | undefined) {
  if (!value) return null;
  try {
    const timestamp = new Date(value).getTime();
    if (Number.isNaN(timestamp)) return null;
    const diffMs = timestamp - Date.now();
    const absMs = Math.abs(diffMs);
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const formatter = new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' });
    if (absMs < minute) {
      return formatter.format(Math.round(diffMs / 1_000), 'second');
    }
    if (absMs < hour) {
      return formatter.format(Math.round(diffMs / minute), 'minute');
    }
    if (absMs < day) {
      return formatter.format(Math.round(diffMs / hour), 'hour');
    }
    return formatter.format(Math.round(diffMs / day), 'day');
  } catch {
    return null;
  }
}

function formatUpdatedAt(value: string | null | undefined) {
  const relative = formatRelativeMoment(value);
  if (!value && !relative) return null;
  try {
    const timestamp = value ? new Date(value).getTime() : Number.NaN;
    const absolute = Number.isNaN(timestamp)
      ? null
      : new Intl.DateTimeFormat('pt-PT', {
          dateStyle: 'short',
          timeStyle: 'short',
        }).format(new Date(timestamp));
    if (relative && absolute) {
      return `${relative} · ${absolute}`;
    }
    return relative ?? absolute;
  } catch {
    return relative ?? null;
  }
}

function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value);
}

function collapseWhitespaceOnly(value: string) {
  return value.trim().length ? value : '';
}

function normalizeEmailInput(value: string) {
  return value.replace(/\s+/g, '').toLowerCase();
}

function resolveAccountUpdateError(code?: string) {
  switch (code) {
    case 'INVALID_DATE':
      return 'A data fornecida é inválida.';
    case 'INVALID_USERNAME':
    case 'USERNAME_TAKEN':
      return 'Não foi possível actualizar o nome de utilizador.';
    case 'INVALID_JSON':
      return 'Pedido inválido ao actualizar o perfil.';
    case 'PHONE_TAKEN':
      return 'Este número de telefone já está associado a outra conta.';
    case 'PHONE_TOO_SHORT':
      return `Introduz um número de telefone válido (mínimo ${PHONE_MIN_DIGITS} dígitos).`;
    case 'PHONE_TOO_LONG':
      return `Introduz um número de telefone válido (máximo ${PHONE_MAX_DIGITS} dígitos).`;
    case 'INVALID_PHONE':
      return `Introduz um número de telefone válido (${PHONE_MIN_DIGITS}-${PHONE_MAX_DIGITS} dígitos).`;
    default:
      return 'Não foi possível guardar as alterações.';
  }
}

function resolveCredentialsUpdateError(code?: string) {
  switch (code) {
    case 'INVALID_EMAIL':
      return 'O email indicado não é válido.';
    case 'WEAK_PASSWORD':
      return 'A nova palavra-passe deve ter pelo menos 8 caracteres.';
    case 'MISSING_CURRENT_PASSWORD':
      return 'Indica a palavra-passe actual para definires uma nova.';
    case 'INVALID_CURRENT_PASSWORD':
      return 'A palavra-passe actual está incorrecta.';
    case 'INVALID_JSON':
      return 'Pedido inválido ao actualizar as credenciais.';
    case 'EMAIL_TAKEN':
      return 'Este email já está associado a outra conta.';
    default:
      return 'Não foi possível actualizar as credenciais.';
  }
}

function resolveUnexpectedError(error: unknown, fallback: string) {
  if (error instanceof Error) {
    if (error.message === 'Failed to fetch') {
      return 'Não foi possível ligar ao servidor. Verifica a tua ligação e tenta novamente.';
    }
    return error.message;
  }
  return fallback;
}

const dashboardFetcher = async (url: string): Promise<DashboardResult> => {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    const message = (await response.text().catch(() => '')) || 'Não foi possível sincronizar as métricas.';
    const error = new Error(message) as DashboardFetcherError;
    error.status = response.status;
    throw error;
  }
  const payload = (await response.json()) as SettingsDashboardResponse | { ok?: boolean; message?: string };
  if (!payload || typeof payload !== 'object' || !('ok' in payload) || !payload.ok) {
    const message = (payload as any)?.message ?? 'Não foi possível sincronizar as métricas.';
    throw new Error(message);
  }
  return payload as DashboardResult;
};

function HeroMetricCard({ metric }: { metric: SettingsDashboardData['hero'][number] }) {
  return (
    <article className="settings-hero-card" data-tone={metric.trend?.direction ?? 'neutral'}>
      <div className="settings-hero-card__body">
        <p className="settings-hero-card__label">{metric.label}</p>
        <p className="settings-hero-card__value">{metric.value}</p>
        {metric.helper ? <p className="settings-hero-card__helper">{metric.helper}</p> : null}
      </div>
      {metric.trend ? (
        <span className="settings-hero-card__trend" data-direction={metric.trend.direction}>
          {metric.trend.label}
        </span>
      ) : null}
    </article>
  );
}

function HeroMetrics({ metrics }: { metrics: SettingsDashboardData['hero'] }) {
  return (
    <div className="settings-hero-grid">
      {metrics.map((metric) => (
        <HeroMetricCard key={metric.id} metric={metric} />
      ))}
    </div>
  );
}

const chartTooltipFormatter = (value: number) => `${value} eventos`;

function TimelineCard({
  data,
  loading,
  rangeLabel,
}: {
  data: SettingsDashboardData['timeline'];
  loading: boolean;
  rangeLabel: string;
}) {
  return (
    <section className="neo-panel settings-analytics-card settings-analytics-card--timeline">
      <header className="settings-analytics-card__header">
        <h2>Actividade de segurança</h2>
        <span>{rangeLabel}</span>
      </header>
      <div className="settings-analytics-card__body settings-analytics-card__body--chart">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ left: 0, right: 0, top: 12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--neo-border-subtle)" />
            <XAxis dataKey="label" stroke="var(--neo-text-muted)" fontSize={12} />
            <YAxis stroke="var(--neo-text-muted)" fontSize={12} allowDecimals={false} />
            <Tooltip formatter={chartTooltipFormatter} labelClassName="settings-chart-tooltip__label" />
            <Area type="monotone" dataKey="logins" stackId="1" stroke="var(--neo-primary)" fill="var(--neo-primary-soft)" />
            <Area type="monotone" dataKey="mfa" stackId="1" stroke="#7c3aed" fill="rgba(124,58,237,0.16)" />
            <Area type="monotone" dataKey="recoveries" stackId="1" stroke="#0ea5e9" fill="rgba(14,165,233,0.16)" />
            <Area type="monotone" dataKey="failures" stackId="2" stroke="#f97316" fill="rgba(249,115,22,0.16)" />
          </AreaChart>
        </ResponsiveContainer>
        {loading ? <span className="settings-analytics-card__loading">A actualizar…</span> : null}
      </div>
    </section>
  );
}

function HighlightsCard({
  highlights,
}: {
  highlights: SettingsDashboardData['highlights'];
}) {
  if (!highlights.length) return null;
  return (
    <section className="neo-panel settings-analytics-card">
      <header className="settings-analytics-card__header">
        <h2>Recomendações</h2>
        <span>Boas práticas de segurança</span>
      </header>
      <ul className="settings-highlights">
        {highlights.map((highlight) => (
          <li key={highlight.id} data-tone={highlight.tone}>
            <div className="settings-highlight__icon">
              {highlight.tone === 'success' ? <ShieldCheck size={18} /> : highlight.tone === 'warning' ? <AlertTriangle size={18} /> : <BellRing size={18} />}
            </div>
            <div>
              <p className="settings-highlight__title">{highlight.title}</p>
              <p className="settings-highlight__description">{highlight.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function NotificationsCard({
  dashboard,
}: {
  dashboard: SettingsDashboardData;
}) {
  const { notifications } = dashboard;
  return (
    <section className="neo-panel settings-analytics-card">
      <header className="settings-analytics-card__header">
        <h2>Notificações</h2>
        <span>{notifications.summary}</span>
      </header>
      <div className="settings-notifications">
        <div className="settings-notifications__summary">
          <p className="settings-notifications__digest">{notifications.digest.label}</p>
          <p className="settings-notifications__schedule">{notifications.digest.schedule}</p>
          {notifications.digest.helper ? (
            <p className="settings-notifications__helper">{notifications.digest.helper}</p>
          ) : null}
          <p className="settings-notifications__deliverability">
            Taxa de entrega:{' '}
            <strong>
              {new Intl.NumberFormat('pt-PT', { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(
                notifications.deliverability.successRate,
              )}
            </strong>
            <span> · {notifications.deliverability.label}</span>
          </p>
        </div>
        <div className="settings-notifications__channels">
          {notifications.channels.map((channel) => (
            <article key={channel.id} data-enabled={channel.enabled}>
              <header>
                <h3>{channel.label}</h3>
                <span>{channel.enabled ? 'Activo' : 'Inactivo'}</span>
              </header>
              <p>{channel.description ?? '—'}</p>
              <footer>
                <span>Actualizado {formatRelativeLabel(channel.updatedAt)}</span>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DevicesCard({ devices }: { devices: SettingsDevice[] }) {
  return (
    <section className="neo-panel settings-analytics-card">
      <header className="settings-analytics-card__header">
        <h2>Dispositivos recentes</h2>
        <span>{devices.length ? 'Sessões activas e revogadas' : 'Sem actividade detectada'}</span>
      </header>
      <div className="settings-devices">
        {devices.length ? (
          devices.map((device) => (
            <article key={device.id} data-status={device.status} data-risk={device.risk}>
              <div className="settings-devices__icon">
                <Laptop size={18} />
              </div>
              <div className="settings-devices__meta">
                <p className="settings-devices__name">{device.label}</p>
                <p className="settings-devices__location">{device.location}</p>
                <p className="settings-devices__time">{device.relative}</p>
              </div>
              <span className="settings-devices__status">{device.status === 'active' ? 'Activo' : 'Revogado'}</span>
            </article>
          ))
        ) : (
          <p className="settings-devices__empty">Ainda não temos dispositivos registados neste período.</p>
        )}
      </div>
    </section>
  );
}

function ActivityCard({ activity }: { activity: SettingsActivity[] }) {
  return (
    <section className="neo-panel settings-analytics-card">
      <header className="settings-analytics-card__header">
        <h2>Últimas acções</h2>
        <span>{activity.length ? 'Eventos registados recentemente' : 'Sem eventos'}</span>
      </header>
      <ul className="settings-activity">
        {activity.map((item) => (
          <li key={item.id} data-tone={item.tone}>
            <div>
              <p className="settings-activity__title">{item.title}</p>
              <p className="settings-activity__description">{item.description}</p>
            </div>
            <time className="settings-activity__time">{item.relative}</time>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AccountSettingsCard({
  account,
  onSaved,
  onUpdated,
}: {
  account: AccountState;
  onSaved: (next: AccountState) => void;
  onUpdated?: () => void;
}) {
  const latestAccount = React.useMemo(
    () => toAccountFormState(account),
    [account.email, account.name, account.phone],
  );
  const [form, setForm] = React.useState<AccountState>(() => latestAccount);
  const [status, setStatus] = React.useState<Status>({ type: 'idle' });
  const [saving, setSaving] = React.useState(false);
  const [phoneTouched, setPhoneTouched] = React.useState(false);

  React.useEffect(() => {
    setForm(latestAccount);
    setPhoneTouched(false);
  }, [latestAccount]);

  const resetStatus = React.useCallback(() => {
    setStatus((prev) => (prev.type === 'idle' ? prev : { type: 'idle' }));
  }, []);

  const handleReset = React.useCallback(() => {
    resetStatus();
    setForm(latestAccount);
    setPhoneTouched(false);
  }, [latestAccount, resetStatus]);

  const trimmedName = form.name.trim();
  const initialName = account.name.trim();
  const nameChanged = trimmedName !== initialName;
  const normalizedPhone = form.phone ?? '';
  const initialPhone = latestAccount.phone ?? '';
  const initialHasPhone = initialPhone.length > 0;
  const phoneChanged = normalizedPhone !== initialPhone;
  const dirty = nameChanged || phoneChanged;
  const invalidName = nameChanged && trimmedName.length < MIN_NAME_LENGTH;
  const initialPhoneDigits = initialHasPhone ? phoneDigitCount(initialPhone) : 0;
  const initialPhoneTooShort = initialHasPhone && initialPhoneDigits < PHONE_MIN_DIGITS;
  const initialPhoneTooLong = initialHasPhone && initialPhoneDigits > PHONE_MAX_DIGITS;
  const phoneDigits = normalizedPhone.length ? phoneDigitCount(normalizedPhone) : 0;
  const phoneTooShort = phoneChanged && normalizedPhone.length > 0 && phoneDigits < PHONE_MIN_DIGITS;
  const phoneTooLong = phoneChanged && normalizedPhone.length > 0 && phoneDigits > PHONE_MAX_DIGITS;
  const invalidPhone = phoneTooShort || phoneTooLong;
  const disabled = saving || !dirty || invalidName || invalidPhone;
  const basePhoneHelper = initialHasPhone
    ? 'Utilizado para alertas críticos e suporte.'
    : 'Adiciona um número para receber alertas críticos e suporte.';
  const legacyPhoneNotice = (() => {
    if (!initialHasPhone) return null;
    if (initialPhoneTooShort) {
      return ` Atenção: o número guardado tem ${initialPhoneDigits} dígitos (mínimo ${PHONE_MIN_DIGITS}). Actualiza-o assim que possível.`;
    }
    if (initialPhoneTooLong) {
      return ` Atenção: o número guardado tem ${initialPhoneDigits} dígitos (máximo ${PHONE_MAX_DIGITS}). Actualiza-o assim que possível.`;
    }
    return null;
  })();
  const phoneHelper = (() => {
    if (invalidPhone) {
      if (phoneTooShort) {
        return `Introduz um número de telefone válido (mínimo ${PHONE_MIN_DIGITS} dígitos — actualmente ${phoneDigits}).`;
      }
      if (phoneTooLong) {
        return `Introduz um número de telefone válido (máximo ${PHONE_MAX_DIGITS} dígitos — actualmente ${phoneDigits}).`;
      }
    }
    const helperPrefix = legacyPhoneNotice && (!phoneTouched || !phoneChanged)
      ? `${basePhoneHelper}${legacyPhoneNotice}`
      : basePhoneHelper;
    if (!phoneTouched) {
      return helperPrefix;
    }
    if (!normalizedPhone.length) {
      return initialHasPhone ? 'O número actual será removido ao guardar.' : 'Nenhum número guardado nesta conta.';
    }
    const limitHint = (() => {
      if (!phoneChanged) {
        if (initialPhoneTooShort) {
          return ` (mínimo ${PHONE_MIN_DIGITS}).`;
        }
        if (initialPhoneTooLong) {
          return ` (limite ${PHONE_MAX_DIGITS}).`;
        }
      }
      if (phoneDigits >= PHONE_MAX_DIGITS) {
        return ` (limite ${PHONE_MAX_DIGITS}).`;
      }
      return '.';
    })();
    return `${helperPrefix} Actualmente ${phoneDigits} dígitos${limitHint}`;
  })();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!dirty || saving || invalidName || invalidPhone) return;
    setSaving(true);
    setStatus({ type: 'idle' });
    try {
      const updates: Record<string, unknown> = {};
      if (nameChanged) updates.name = trimmedName;
      if (phoneChanged) updates.phone = normalizedPhone.length ? normalizedPhone : null;

      const res = await fetch('/api/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        const errorMessage = resolveAccountUpdateError(data?.error);
        throw new Error(errorMessage);
      }
      const nextPhone = normalizedPhone.length ? normalizedPhone : null;
      setStatus({ type: 'success', message: 'Alterações guardadas.' });
      onSaved({ ...account, name: trimmedName, phone: nextPhone });
      setForm((prev) => ({ ...prev, name: trimmedName, phone: nextPhone }));
      onUpdated?.();
    } catch (error) {
      setStatus({
        type: 'error',
        message: resolveUnexpectedError(error, 'Não foi possível guardar as alterações.'),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="settings-form">
      <header className="settings-section__header">
        <h2 className="settings-section__title">Dados da conta</h2>
        <p className="settings-section__description">
          Actualiza o nome visível e o contacto associado à tua conta.
        </p>
      </header>

      <div className="settings-fields" data-columns="2">
        <Field
          label="Nome completo"
          description={
            invalidName
              ? `O nome deve ter pelo menos ${MIN_NAME_LENGTH} caracteres.`
              : undefined
          }
        >
          <TextInput
            value={form.name}
            onChange={(value) => {
              resetStatus();
              setForm((prev) => ({ ...prev, name: value }));
            }}
            autoComplete="name"
            maxLength={120}
            invalid={invalidName}
          />
        </Field>
        <Field
          label="Telefone"
          description={phoneHelper}
        >
          <TextInput
            value={form.phone ?? ''}
            onChange={(value) => {
              const normalized = normalizePhone(value);
              resetStatus();
              setPhoneTouched(true);
              setForm((prev) => ({ ...prev, phone: normalized.length ? normalized : null }));
            }}
            placeholder="(+351) 910 000 000"
            autoComplete="tel"
            inputMode="tel"
            maxLength={32}
            invalid={invalidPhone}
          />
        </Field>
      </div>

      <div className="settings-actions">
        <StatusMessage status={status} />
        <div className="settings-actions__group">
          <Button onClick={handleReset} variant="ghost" disabled={!dirty || saving}>
            Repor alterações
          </Button>
          <Button type="submit" variant="primary" disabled={disabled} loading={saving} loadingText="A guardar…">
            Guardar alterações
          </Button>
        </div>
      </div>
    </form>
  );
}

function CredentialsCard({
  email,
  onEmailChange,
  onUpdated,
}: {
  email: string;
  onEmailChange: (email: string) => void;
  onUpdated?: () => void;
}) {
  const latestEmail = React.useMemo(() => normalizeEmailInput(email), [email]);
  const [form, setForm] = React.useState({
    email: latestEmail,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [status, setStatus] = React.useState<Status>({ type: 'idle' });
  const [saving, setSaving] = React.useState(false);
  const [confirmTouched, setConfirmTouched] = React.useState(false);

  React.useEffect(() => {
    setForm((prev) => {
      if (prev.email === latestEmail) {
        return prev;
      }
      return { ...prev, email: latestEmail };
    });
    setConfirmTouched(false);
  }, [latestEmail]);

  const resetStatus = React.useCallback(() => {
    setStatus((prev) => (prev.type === 'idle' ? prev : { type: 'idle' }));
  }, []);

  const resetStatus = React.useCallback(() => {
    setStatus((prev) => (prev.type === 'idle' ? prev : { type: 'idle' }));
  }, []);

  const wantsPasswordChange = Boolean(form.newPassword.trim().length);
  const normalizedEmail = normalizeEmailInput(form.email);
  const emailChanged = normalizedEmail !== latestEmail;
  const invalidEmail = emailChanged && !isValidEmail(normalizedEmail);
  const passwordMismatch = form.newPassword !== form.confirmPassword;
  const weakPassword = wantsPasswordChange && form.newPassword.length > 0 && form.newPassword.length < 8;
  const confirmDirty = confirmTouched || form.confirmPassword.trim().length > 0;
  const confirmPending = wantsPasswordChange && !weakPassword && !form.confirmPassword.length;
  const showPasswordMismatch = confirmDirty && !confirmPending && passwordMismatch;
  const missingCurrentPassword = wantsPasswordChange && !form.currentPassword.trim().length;
  const hasAnyPasswordInput =
    form.currentPassword.trim().length > 0 || wantsPasswordChange || form.confirmPassword.trim().length > 0;
  const dirty = emailChanged || hasAnyPasswordInput;

  let confirmHintTone: FieldTone = 'muted';
  let confirmHint: React.ReactNode = 'Obrigatória apenas ao alterar a palavra-passe.';

  if (wantsPasswordChange) {
    confirmHint = 'Repete a nova palavra-passe para garantir que está correcta.';
    if (showPasswordMismatch) {
      confirmHintTone = 'error';
      confirmHint = 'As palavras-passe não coincidem.';
    } else if (confirmPending) {
      confirmHintTone = 'warning';
      confirmHint = 'Confirma a nova palavra-passe para concluíres a alteração.';
    }
  } else if (confirmDirty) {
    confirmHintTone = 'warning';
    confirmHint = 'Introduz a nova palavra-passe antes de confirmar.';
  }

  const disabled =
    saving ||
    invalidEmail ||
    (!emailChanged && !wantsPasswordChange) ||
    (wantsPasswordChange && (passwordMismatch || weakPassword || !form.currentPassword));

  const handleReset = React.useCallback(() => {
    resetStatus();
    setForm({ email: latestEmail, currentPassword: '', newPassword: '', confirmPassword: '' });
    setConfirmTouched(false);
  }, [latestEmail, resetStatus]);

  React.useEffect(() => {
    if (!form.newPassword.trim().length) {
      setConfirmTouched(false);
    }
  }, [form.newPassword]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (disabled) return;
    setSaving(true);
    setStatus({ type: 'idle' });
    try {
      const payload: Record<string, unknown> = {};
      if (emailChanged) payload.email = normalizedEmail;
      if (wantsPasswordChange) {
        payload.newPassword = form.newPassword;
        payload.currentPassword = form.currentPassword;
      }
      const res = await fetch('/api/me/settings/credentials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(resolveCredentialsUpdateError(data?.error));
      }
      if (emailChanged) {
        onEmailChange(normalizedEmail);
      }
      setForm({ email: normalizedEmail, currentPassword: '', newPassword: '', confirmPassword: '' });
      setConfirmTouched(false);
      setStatus({ type: 'success', message: 'Credenciais actualizadas com sucesso.' });
      onUpdated?.();
    } catch (error) {
      setStatus({
        type: 'error',
        message: resolveUnexpectedError(error, 'Ocorreu um erro inesperado.'),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="settings-form">
      <header className="settings-section__header">
        <h2 className="settings-section__title">Credenciais</h2>
        <p className="settings-section__description">
          Actualiza o email de acesso e define uma nova palavra-passe.
        </p>
      </header>

      <div className="settings-fields" data-columns="2">
        <Field
          label="Email de acesso"
          description={invalidEmail ? 'Indica um email válido antes de guardar.' : undefined}
        >
          <TextInput
            type="email"
            value={form.email}
            onChange={(value) => {
              resetStatus();
              const nextEmail = normalizeEmailInput(value);
              setForm((prev) => (prev.email === nextEmail ? prev : { ...prev, email: nextEmail }));
            }}
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            invalid={invalidEmail}
          />
        </Field>
        <Field
          label="Palavra-passe actual"
          description={
            wantsPasswordChange
              ? missingCurrentPassword
                ? 'Indica a palavra-passe actual para confirmares a alteração.'
                : 'Necessária para definir uma nova palavra-passe.'
              : 'Necessária apenas ao alterar a palavra-passe.'
          }
        >
          <TextInput
            type="password"
            value={form.currentPassword}
            onChange={(value) => {
              resetStatus();
              const nextValue = collapseWhitespaceOnly(value);
              setForm((prev) => ({ ...prev, currentPassword: nextValue }));
            }}
            disabled={!wantsPasswordChange}
            autoComplete="current-password"
            invalid={missingCurrentPassword}
          />
        </Field>
      </div>

      <div className="settings-fields" data-columns="2">
        <Field
          label="Nova palavra-passe"
          description={
            wantsPasswordChange
              ? weakPassword
                ? 'A nova palavra-passe deve ter pelo menos 8 caracteres.'
                : 'Recomenda-se uma combinação de letras, números e símbolos.'
              : 'Mínimo 8 caracteres.'
          }
        >
          <TextInput
            type="password"
            value={form.newPassword}
            onChange={(value) => {
              resetStatus();
              const trimmed = value.trim();
              const nextValue = trimmed.length ? value : '';
              setForm((prev) => ({
                ...prev,
                newPassword: nextValue,
                confirmPassword: trimmed.length ? prev.confirmPassword : '',
              }));
              if (!trimmed.length) {
                setConfirmTouched(false);
              }
            }}
            placeholder="********"
            autoComplete="new-password"
            invalid={weakPassword}
          />
        </Field>
        <Field label="Confirmar palavra-passe" description={confirmHint} tone={confirmHintTone}>
          <TextInput
            type="password"
            value={form.confirmPassword}
            onChange={(value) => {
              resetStatus();
              const trimmed = value.trim();
              const nextValue = trimmed.length ? value : '';
              if (trimmed.length || wantsPasswordChange) {
                setConfirmTouched(true);
              } else {
                setConfirmTouched(false);
              }
              setForm((prev) => ({ ...prev, confirmPassword: nextValue }));
            }}
            placeholder="********"
            autoComplete="new-password"
            invalid={showPasswordMismatch}
            onBlur={() => {
              if (wantsPasswordChange) {
                setConfirmTouched(true);
              }
            }}
          />
        </Field>
      </div>

      <div className="settings-actions">
        <StatusMessage status={status} />
        <div className="settings-actions__group">
          <Button onClick={handleReset} variant="ghost" disabled={!dirty || saving}>
            Repor alterações
          </Button>
          <Button type="submit" variant="primary" disabled={disabled} loading={saving} loadingText="A guardar…">
            Actualizar credenciais
          </Button>
        </div>
      </div>
    </form>
  );
}

function RolePreferencesSection({
  role,
  value,
  onChange,
}: {
  role: AppRole;
  value: RolePreferences['value'];
  onChange: (value: RolePreferences['value']) => void;
}) {
  if (role === 'ADMIN') {
    const admin = value as AdminSettings;
    return (
      <div className="settings-subpanel">
        <p className="settings-subpanel__title">Preferências de administrador</p>
        <div className="settings-toggle-grid">
          <Field label="Frequência do resumo">
            <Select
              value={admin.digestFrequency}
              onChange={(val) =>
                onChange({ ...admin, digestFrequency: val as AdminSettings['digestFrequency'] })
              }
              options={[
                { value: 'daily', label: 'Diário' },
                { value: 'weekly', label: 'Semanal' },
                { value: 'monthly', label: 'Mensal' },
              ]}
            />
          </Field>
          <Checkbox
            checked={admin.autoAssignTrainers}
            onChange={(val) => onChange({ ...admin, autoAssignTrainers: val })}
            label="Atribuir automaticamente PTs disponíveis"
          />
          <Checkbox
            checked={admin.shareInsights}
            onChange={(val) => onChange({ ...admin, shareInsights: val })}
            label="Partilhar indicadores com a equipa"
          />
        </div>
      </div>
    );
  }

  if (role === 'PT') {
    const trainer = value as TrainerSettings;
    return (
      <div className="settings-subpanel">
        <p className="settings-subpanel__title">Preferências de treinador</p>
        <div className="settings-toggle-grid">
          <Checkbox
            checked={trainer.sessionReminders}
            onChange={(val) => onChange({ ...trainer, sessionReminders: val })}
            label="Receber lembretes antes de cada sessão"
          />
          <Checkbox
            checked={trainer.newClientAlerts}
            onChange={(val) => onChange({ ...trainer, newClientAlerts: val })}
            label="Alertar quando um novo cliente for atribuído"
          />
          <Field label="Visibilidade do calendário">
            <Select
              value={trainer.calendarVisibility}
              onChange={(val) =>
                onChange({ ...trainer, calendarVisibility: val as TrainerSettings['calendarVisibility'] })
              }
              options={[
                { value: 'clients', label: 'Visível para clientes acompanhados' },
                { value: 'private', label: 'Apenas eu' },
              ]}
            />
          </Field>
          <Checkbox
            checked={trainer.allowClientReschedule}
            onChange={(val) => onChange({ ...trainer, allowClientReschedule: val })}
            label="Permitir que clientes proponham novas datas"
          />
        </div>
      </div>
    );
  }

  const client = value as ClientSettings;
  return (
    <div className="settings-subpanel">
      <p className="settings-subpanel__title">Preferências de cliente</p>
      <div className="settings-toggle-grid">
        <Checkbox
          checked={client.planReminders}
          onChange={(val) => onChange({ ...client, planReminders: val })}
          label="Receber lembretes dos planos e sessões"
        />
        <Checkbox
          checked={client.trainerMessages}
          onChange={(val) => onChange({ ...client, trainerMessages: val })}
          label="Alertar quando o Personal Trainer enviar mensagens"
        />
        <Field label="Partilha de progresso">
          <Select
            value={client.shareProgress}
            onChange={(val) => onChange({ ...client, shareProgress: val as ClientSettings['shareProgress'] })}
            options={[
              { value: 'trainer', label: 'Partilhar com o meu PT' },
              { value: 'private', label: 'Manter privado' },
            ]}
          />
        </Field>
        <Checkbox
          checked={client.smsReminders}
          onChange={(val) => onChange({ ...client, smsReminders: val })}
          label="Receber SMS para check-ins diários"
        />
      </div>
    </div>
  );
}

function PreferencesCard({
  role,
  initialPrefs,
  rolePrefs,
  onSaved,
  onUpdated,
}: {
  role: AppRole;
  initialPrefs: PreferencesState;
  rolePrefs: RolePreferences['value'];
  onSaved: (prefs: PreferencesState, rolePrefs: RolePreferences['value']) => void;
  onUpdated?: () => void;
}) {
  const { set: setColorMode, setSystem: setSystemMode } = useColorMode();
  const latestPrefs = React.useMemo(
    () => toPreferencesFormState(initialPrefs),
    [
      initialPrefs.language,
      initialPrefs.theme,
      initialPrefs.notifications.email,
      initialPrefs.notifications.push,
      initialPrefs.notifications.sms,
      initialPrefs.notifications.summary,
    ],
  );
  const latestRolePrefs = React.useMemo(
    () => cloneRolePreferences(role, rolePrefs),
    [role, rolePrefs],
  );
  const [form, setForm] = React.useState<PreferencesState>(() => latestPrefs);
  const [roleForm, setRoleForm] = React.useState<RolePreferences['value']>(() => latestRolePrefs);
  const [status, setStatus] = React.useState<Status>({ type: 'idle' });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setForm(latestPrefs);
  }, [latestPrefs]);

  React.useEffect(() => {
    setRoleForm(latestRolePrefs);
  }, [latestRolePrefs]);

  const resetStatus = React.useCallback(() => {
    setStatus((prev) => (prev.type === 'idle' ? prev : { type: 'idle' }));
  }, []);

  const handleReset = React.useCallback(() => {
    resetStatus();
    setForm(latestPrefs);
    setRoleForm(latestRolePrefs);
  }, [latestPrefs, latestRolePrefs, resetStatus]);

  const notificationsDirty = !isEqualNotifications(form.notifications, latestPrefs.notifications);
  const dirty =
    notificationsDirty ||
    form.language !== latestPrefs.language ||
    form.theme !== latestPrefs.theme ||
    !isEqualRolePreferences(role, roleForm, latestRolePrefs);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!dirty || saving) return;
    setSaving(true);
    setStatus({ type: 'idle' });
    try {
      const res = await fetch('/api/me/settings/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: form.language,
          theme: form.theme,
          notifications: form.notifications,
          roleSettings: roleForm,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? 'Não foi possível guardar as preferências.');
      }
      onSaved(form, roleForm);
      if (form.theme === 'system') {
        setSystemMode();
      } else {
        setColorMode(form.theme as Exclude<ThemePreference, 'system'>);
      }
      setStatus({ type: 'success', message: 'Preferências actualizadas.' });
      onUpdated?.();
    } catch (error) {
      setStatus({
        type: 'error',
        message: resolveUnexpectedError(error, 'Não foi possível guardar as preferências.'),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="settings-form">
      <header className="settings-section__header">
        <h2 className="settings-section__title">Preferências</h2>
        <p className="settings-section__description">
          Ajusta idioma, notificações e definições específicas do teu papel.
        </p>
      </header>

      <div className="settings-fields" data-columns="2">
        <Field label="Idioma">
          <Select
            value={form.language}
            onChange={(value) => {
              resetStatus();
              setForm((prev) => ({ ...prev, language: value }));
            }}
            options={[
              { value: 'pt-PT', label: 'Português (Portugal)' },
              { value: 'en-US', label: 'Inglês' },
            ]}
          />
        </Field>
        <Field label="Tema">
          <Select
            value={form.theme}
            onChange={(value) => {
              resetStatus();
              setForm((prev) => ({ ...prev, theme: value as ThemePreference }));
            }}
            options={[
              { value: 'system', label: 'Automático' },
              { value: 'light', label: 'Claro' },
              { value: 'dark', label: 'Escuro' },
            ]}
          />
        </Field>
      </div>

      <div className="settings-toggle-grid">
        <Checkbox
          checked={form.notifications.email}
          onChange={(val) =>
            {
              resetStatus();
              setForm((prev) => ({ ...prev, notifications: { ...prev.notifications, email: val } }));
            }
          }
          label="Receber alertas por email"
        />
        <Checkbox
          checked={form.notifications.push}
          onChange={(val) =>
            {
              resetStatus();
              setForm((prev) => ({ ...prev, notifications: { ...prev.notifications, push: val } }));
            }
          }
          label="Notificações push"
        />
        <Checkbox
          checked={form.notifications.sms}
          onChange={(val) =>
            {
              resetStatus();
              setForm((prev) => ({ ...prev, notifications: { ...prev.notifications, sms: val } }));
            }
          }
          label="Alertas via SMS"
        />
        <Field label="Resumo semanal">
          <Select
            value={form.notifications.summary}
            onChange={(val) =>
              {
                resetStatus();
                setForm((prev) => ({
                  ...prev,
                  notifications: { ...prev.notifications, summary: val as NotificationPreferences['summary'] },
                }));
              }
            }
            options={[
              { value: 'daily', label: 'Diário' },
              { value: 'weekly', label: 'Semanal' },
              { value: 'monthly', label: 'Mensal' },
              { value: 'never', label: 'Desactivar' },
            ]}
          />
        </Field>
      </div>

      <RolePreferencesSection
        role={role}
        value={roleForm}
        onChange={(next) => {
          resetStatus();
          setRoleForm(next);
        }}
      />

      <div className="settings-actions">
        <StatusMessage status={status} />
        <div className="settings-actions__group">
          <Button onClick={handleReset} variant="ghost" disabled={!dirty || saving}>
            Repor alterações
          </Button>
          <Button type="submit" variant="primary" disabled={!dirty} loading={saving} loadingText="A guardar…">
            Guardar preferências
          </Button>
        </div>
      </div>
    </form>
  );
}

export default function SettingsClient({
  model,
  initialDashboard,
}: {
  model: SettingsModel;
  initialDashboard: SettingsDashboardResponse;
}) {
  const [account, setAccount] = React.useState<AccountState>({
    name: model.name,
    phone: model.phone ? normalizePhone(model.phone) : null,
    email: model.email,
  });
  const [preferences, setPreferences] = React.useState<PreferencesState>({
    language: model.language,
    theme: model.theme,
    notifications: model.notifications,
  });

  const initialRolePrefs: RolePreferences['value'] = React.useMemo(() => {
    if (model.role === 'ADMIN') return model.adminPreferences ?? defaultAdminSettings();
    if (model.role === 'PT') return model.trainerPreferences ?? defaultTrainerSettings();
    return model.clientPreferences ?? defaultClientSettings();
  }, [model.role, model.adminPreferences, model.trainerPreferences, model.clientPreferences]);

  const [rolePrefs, setRolePrefs] = React.useState<RolePreferences['value']>(initialRolePrefs);
  const [range, setRange] = React.useState<RangeValue>('30');

  React.useEffect(() => {
    setAccount({
      name: model.name,
      phone: model.phone ? normalizePhone(model.phone) : null,
      email: model.email,
    });
    setPreferences({ language: model.language, theme: model.theme, notifications: model.notifications });
    setRolePrefs(initialRolePrefs);
  }, [
    model.id,
    model.name,
    model.phone,
    model.email,
    model.language,
    model.theme,
    model.notifications.email,
    model.notifications.push,
    model.notifications.sms,
    model.notifications.summary,
    initialRolePrefs,
  ]);

  const {
    data: dashboard,
    error,
    isValidating,
    mutate,
  } = useSWR<DashboardResult>(`/api/settings/dashboard?range=${range}`, dashboardFetcher, {
    fallbackData: initialDashboard,
    revalidateOnFocus: false,
    keepPreviousData: true,
    dedupingInterval: 0,
  });

  const analytics = dashboard ?? initialDashboard;
  const analyticsData: SettingsDashboardData = analytics;

  const fallbackActive = analytics.source === 'fallback';
  const refreshDashboard = React.useCallback(() => {
    void mutate(undefined, { revalidate: true });
  }, [mutate]);
  const lastUpdatedLabel = React.useMemo(
    () => formatUpdatedAt(analyticsData.generatedAt),
    [analyticsData.generatedAt],
  );

  return (
    <div className="settings-dashboard neo-dashboard">
      <PageHeader
        title="Definições"
        subtitle="Controla preferências da conta, métricas de segurança e canais de comunicação."
        actions={
          <div className="settings-header-actions">
            {lastUpdatedLabel ? (
              <span className="settings-header-updated" aria-live="polite">
                Actualizado {lastUpdatedLabel}
              </span>
            ) : null}
            <Select value={range} onChange={(value) => setRange(value as RangeValue)} options={RANGE_OPTIONS} />
            <Button
              type="button"
              variant="ghost"
              onClick={refreshDashboard}
              loading={isValidating}
              leftIcon={<RefreshCw size={16} />}
              title="Actualizar métricas"
            >
              Actualizar
            </Button>
          </div>
        }
      />

      {error ? (
        <div className="settings-error-banner">
          <Alert tone="danger" title={error.message} />
        </div>
      ) : null}
      {fallbackActive ? (
        <div className="settings-fallback-banner">
          <Alert tone="warning" title="A mostrar dados de referência">
            Não foi possível ligar ao Supabase. Estás a ver métricas de demonstração.
          </Alert>
        </div>
      ) : null}

      <section className="settings-hero">
        <HeroMetrics metrics={analyticsData.hero} />
      </section>

      <div className="settings-dashboard__layout">
        <section className="settings-dashboard__analytics">
          <TimelineCard data={analyticsData.timeline} loading={isValidating} rangeLabel={analyticsData.rangeLabel} />
          <HighlightsCard highlights={analyticsData.highlights} />
          <NotificationsCard dashboard={analyticsData} />
          <DevicesCard devices={analyticsData.devices} />
          <ActivityCard activity={analyticsData.activity} />
        </section>

        <aside className="settings-dashboard__forms">
          <SectionCard>
            <AccountSettingsCard
              account={account}
              onSaved={(next) => setAccount(next)}
              onUpdated={refreshDashboard}
            />
          </SectionCard>

          <SectionCard>
            <CredentialsCard
              email={account.email}
              onEmailChange={(value) => setAccount((prev) => ({ ...prev, email: value }))}
              onUpdated={refreshDashboard}
            />
          </SectionCard>

          <SectionCard>
            <PreferencesCard
              role={model.role}
              initialPrefs={preferences}
              rolePrefs={rolePrefs}
              onSaved={(prefs, roleSpecific) => {
                setPreferences(prefs);
                setRolePrefs(roleSpecific);
              }}
              onUpdated={refreshDashboard}
            />
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}
