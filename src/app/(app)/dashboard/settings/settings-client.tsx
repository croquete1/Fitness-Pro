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

function SectionCard({ children }: { children: React.ReactNode }) {
  return <section className="neo-panel settings-section">{children}</section>;
}

function Field({
  label,
  description,
  children,
}: {
  label: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="settings-field">
      <span className="settings-field__label">{label}</span>
      {children}
      {description ? <span className="settings-field__hint">{description}</span> : null}
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

function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value);
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

function normalizePhoneInput(value: string) {
  const sanitized = value
    .replace(/\u00a0/g, ' ')
    .replace(/[()\[\]\.\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!sanitized) return '';

  const hasPlus = sanitized.startsWith('+');
  const body = (hasPlus ? sanitized.slice(1) : sanitized)
    .replace(/\+/g, '')
    .replace(/[^\d ]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!body.length) {
    return '';
  }

  return hasPlus ? `+${body}` : body;
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
}: {
  account: AccountState;
  onSaved: (next: AccountState) => void;
}) {
  const [form, setForm] = React.useState<AccountState>(account);
  const [status, setStatus] = React.useState<Status>({ type: 'idle' });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setForm({
      name: account.name,
      phone: account.phone ? normalizePhoneInput(account.phone) : null,
      email: account.email,
    });
  }, [account.name, account.phone, account.email]);

  const resetStatus = React.useCallback(() => {
    setStatus((prev) => (prev.type === 'idle' ? prev : { type: 'idle' }));
  }, []);

  const trimmedName = form.name.trim();
  const initialName = account.name.trim();
  const nameChanged = trimmedName !== initialName;
  const normalizedPhone = form.phone ? normalizePhoneInput(form.phone) : '';
  const initialPhone = account.phone ? normalizePhoneInput(account.phone) : '';
  const phoneChanged = normalizedPhone !== initialPhone;
  const dirty = nameChanged || phoneChanged;
  const invalidName = nameChanged && trimmedName.length < MIN_NAME_LENGTH;
  const phoneDigits = normalizedPhone.replace(/\D+/g, '');
  const invalidPhone = normalizedPhone.length > 0 && phoneDigits.length < 9;
  const disabled = saving || !dirty || invalidName || invalidPhone;

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
          description={
            invalidPhone
              ? 'Introduz um número de telefone válido (mínimo 9 dígitos).'
              : 'Utilizado para alertas críticos e suporte.'
          }
        >
          <TextInput
            value={form.phone ?? ''}
            onChange={(value) => {
              const normalized = normalizePhoneInput(value);
              resetStatus();
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
        <Button type="submit" variant="primary" disabled={disabled} loading={saving} loadingText="A guardar…">
          Guardar alterações
        </Button>
      </div>
    </form>
  );
}

function CredentialsCard({
  email,
  onEmailChange,
}: {
  email: string;
  onEmailChange: (email: string) => void;
}) {
  const [form, setForm] = React.useState({
    email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [status, setStatus] = React.useState<Status>({ type: 'idle' });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setForm((prev) => ({ ...prev, email }));
  }, [email]);

  const resetStatus = React.useCallback(() => {
    setStatus((prev) => (prev.type === 'idle' ? prev : { type: 'idle' }));
  }, []);

  const wantsPasswordChange = Boolean(form.newPassword.trim().length);
  const trimmedEmail = form.email.trim();
  const emailChanged = trimmedEmail !== email.trim();
  const invalidEmail = emailChanged && !isValidEmail(trimmedEmail);
  const passwordMismatch = form.newPassword !== form.confirmPassword;
  const weakPassword = wantsPasswordChange && form.newPassword.length > 0 && form.newPassword.length < 8;
  const missingCurrentPassword = wantsPasswordChange && !form.currentPassword;

  const disabled =
    saving ||
    invalidEmail ||
    (!emailChanged && !wantsPasswordChange) ||
    (wantsPasswordChange && (passwordMismatch || weakPassword || !form.currentPassword));

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (disabled) return;
    setSaving(true);
    setStatus({ type: 'idle' });
    try {
      const payload: Record<string, unknown> = {};
      if (emailChanged) payload.email = trimmedEmail;
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
        onEmailChange(trimmedEmail);
      }
      setForm({ email: trimmedEmail, currentPassword: '', newPassword: '', confirmPassword: '' });
      setStatus({ type: 'success', message: 'Credenciais actualizadas com sucesso.' });
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
              setForm((prev) => ({ ...prev, email: value }));
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
              setForm((prev) => ({ ...prev, currentPassword: value }));
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
              setForm((prev) => ({ ...prev, newPassword: value }));
            }}
            placeholder="********"
            autoComplete="new-password"
            invalid={weakPassword}
          />
        </Field>
        <Field label="Confirmar palavra-passe">
          <TextInput
            type="password"
            value={form.confirmPassword}
            onChange={(value) => {
              resetStatus();
              setForm((prev) => ({ ...prev, confirmPassword: value }));
            }}
            placeholder="********"
            autoComplete="new-password"
            invalid={passwordMismatch}
          />
        </Field>
      </div>

      {passwordMismatch ? (
        <p className="settings-warning">As palavras-passe não coincidem.</p>
      ) : null}

      <div className="settings-actions">
        <StatusMessage status={status} />
        <Button type="submit" variant="primary" disabled={disabled} loading={saving} loadingText="A guardar…">
          Actualizar credenciais
        </Button>
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
}: {
  role: AppRole;
  initialPrefs: PreferencesState;
  rolePrefs: RolePreferences['value'];
  onSaved: (prefs: PreferencesState, rolePrefs: RolePreferences['value']) => void;
}) {
  const { set: setColorMode } = useColorMode();
  const [form, setForm] = React.useState<PreferencesState>(initialPrefs);
  const [roleForm, setRoleForm] = React.useState<RolePreferences['value']>(rolePrefs);
  const [status, setStatus] = React.useState<Status>({ type: 'idle' });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setForm(initialPrefs);
  }, [
    initialPrefs.language,
    initialPrefs.theme,
    initialPrefs.notifications.email,
    initialPrefs.notifications.push,
    initialPrefs.notifications.sms,
    initialPrefs.notifications.summary,
  ]);

  React.useEffect(() => {
    setRoleForm(rolePrefs);
  }, [rolePrefs]);

  const resetStatus = React.useCallback(() => {
    setStatus((prev) => (prev.type === 'idle' ? prev : { type: 'idle' }));
  }, []);

  const notificationsDirty = !isEqualNotifications(form.notifications, initialPrefs.notifications);
  const dirty =
    notificationsDirty ||
    form.language !== initialPrefs.language ||
    form.theme !== initialPrefs.theme ||
    JSON.stringify(roleForm) !== JSON.stringify(rolePrefs);

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
      const resolvedMode =
        form.theme === 'system'
          ? defaultThemeFromSystem()
          : (form.theme as Exclude<ThemePreference, 'system'>);
      setColorMode(resolvedMode);
      setStatus({ type: 'success', message: 'Preferências actualizadas.' });
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
        <Button type="submit" variant="primary" disabled={!dirty} loading={saving} loadingText="A guardar…">
          Guardar preferências
        </Button>
      </div>
    </form>
  );
}

function defaultThemeFromSystem(): Exclude<ThemePreference, 'system'> {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
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
    phone: model.phone ? normalizePhoneInput(model.phone) : null,
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
      phone: model.phone ? normalizePhoneInput(model.phone) : null,
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
  });

  const analytics = dashboard ?? initialDashboard;
  const analyticsData: SettingsDashboardData = analytics;

  const fallbackActive = analytics.source === 'fallback';

  return (
    <div className="settings-dashboard neo-dashboard">
      <PageHeader
        title="Definições"
        subtitle="Controla preferências da conta, métricas de segurança e canais de comunicação."
        actions={
          <div className="settings-header-actions">
            <Select value={range} onChange={(value) => setRange(value as RangeValue)} options={RANGE_OPTIONS} />
            <Button
              type="button"
              variant="ghost"
              onClick={() => mutate()}
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
            />
          </SectionCard>

          <SectionCard>
            <CredentialsCard
              email={account.email}
              onEmailChange={(value) => setAccount((prev) => ({ ...prev, email: value }))}
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
            />
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}
