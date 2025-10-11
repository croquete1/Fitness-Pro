'use client';

import * as React from 'react';
import type { AppRole } from '@/lib/roles';
import { useColorMode } from '@/components/layout/ColorModeProvider';
import {
  type AdminSettings,
  type ClientSettings,
  type NotificationPreferences,
  type ThemePreference,
  type TrainerSettings,
  defaultAdminSettings,
  defaultClientSettings,
  defaultTrainerSettings,
} from './settings.defaults';

type Status = { type: 'idle' | 'success' | 'error'; message?: string };

export type SettingsModel = {
  id: string;
  role: AppRole;
  name: string;
  phone: string | null;
  email: string;
  language: string;
  theme: ThemePreference;
  notifications: NotificationPreferences;
  adminPreferences?: AdminSettings;
  trainerPreferences?: TrainerSettings;
  clientPreferences?: ClientSettings;
};

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

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="card space-y-6 p-6">
      {children}
    </section>
  );
}

function Field({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-slate-900 dark:text-slate-100">{label}</span>
      {children}
      {description ? (
        <span className="text-xs text-slate-500 dark:text-slate-400">{description}</span>
      ) : null}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      type={type}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/40"
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
    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600"
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
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/40"
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
  const color = status.type === 'success' ? 'text-emerald-600' : 'text-rose-600';
  return (
    <p className={`text-sm font-medium ${color}`}>
      {status.message}
    </p>
  );
}

function isEqualNotifications(a: NotificationPreferences, b: NotificationPreferences) {
  return a.email === b.email && a.push === b.push && a.sms === b.sms && a.summary === b.summary;
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
    setForm(account);
  }, [account.name, account.phone, account.email]);

  const dirty =
    form.name.trim() !== (account.name ?? '').trim() ||
    (form.phone ?? '') !== (account.phone ?? '');

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!dirty || saving) return;
    setSaving(true);
    setStatus({ type: 'idle' });
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: form.phone }),
      });
      if (!res.ok) throw new Error('ERR');
      setStatus({ type: 'success', message: 'Alterações guardadas.' });
      onSaved({ ...account, ...form });
    } catch {
      setStatus({ type: 'error', message: 'Não foi possível guardar as alterações.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">Dados da conta</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Atualiza o nome visível e o contacto associado à tua conta.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome completo">
          <TextInput value={form.name} onChange={(value) => setForm((prev) => ({ ...prev, name: value }))} />
        </Field>
        <Field label="Telefone" description="Utilizado para alertas críticos e suporte.">
          <TextInput
            value={form.phone ?? ''}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, phone: value.trim().length ? value : null }))
            }
            placeholder="(+351) 910 000 000"
          />
        </Field>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <StatusMessage status={status} />
        <button
          type="submit"
          disabled={!dirty || saving}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {saving ? 'A guardar…' : 'Guardar alterações'}
        </button>
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

  const wantsPasswordChange = Boolean(form.newPassword.trim().length);
  const emailChanged = form.email.trim() !== email.trim();
  const passwordMismatch = form.newPassword !== form.confirmPassword;

  const disabled =
    saving ||
    (!emailChanged && !wantsPasswordChange) ||
    (wantsPasswordChange && (passwordMismatch || form.newPassword.length < 8 || !form.currentPassword));

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (disabled) return;
    setSaving(true);
    setStatus({ type: 'idle' });
    try {
      const payload: Record<string, unknown> = {};
      if (emailChanged) payload.email = form.email.trim();
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
        const data = await res.json().catch(() => null);
        const reason = data?.error === 'INVALID_CURRENT_PASSWORD'
          ? 'A palavra-passe atual está incorreta.'
          : 'Não foi possível atualizar as credenciais.';
        throw new Error(reason);
      }
      if (emailChanged) {
        onEmailChange(form.email.trim());
      }
      setForm({ email: form.email.trim(), currentPassword: '', newPassword: '', confirmPassword: '' });
      setStatus({ type: 'success', message: 'Credenciais atualizadas com sucesso.' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Ocorreu um erro inesperado.',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">Credenciais</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Atualiza o email de acesso e define uma nova palavra-passe.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Email de acesso">
          <TextInput type="email" value={form.email} onChange={(value) => setForm((prev) => ({ ...prev, email: value }))} />
        </Field>
        <div className="space-y-2">
          <Field
            label="Palavra-passe atual"
            description="Necessária para definir uma nova palavra-passe."
          >
            <TextInput
              type="password"
              value={form.currentPassword}
              onChange={(value) => setForm((prev) => ({ ...prev, currentPassword: value }))}
            />
          </Field>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nova palavra-passe" description="Mínimo 8 caracteres.">
          <TextInput
            type="password"
            value={form.newPassword}
            onChange={(value) => setForm((prev) => ({ ...prev, newPassword: value }))}
            placeholder="********"
          />
        </Field>
        <Field label="Confirmar palavra-passe">
          <TextInput
            type="password"
            value={form.confirmPassword}
            onChange={(value) => setForm((prev) => ({ ...prev, confirmPassword: value }))}
            placeholder="********"
          />
        </Field>
      </div>

      {wantsPasswordChange && form.newPassword.length > 0 && form.newPassword.length < 8 ? (
        <p className="text-sm text-amber-600">
          A nova palavra-passe deve ter pelo menos 8 caracteres.
        </p>
      ) : null}
      {passwordMismatch ? (
        <p className="text-sm text-amber-600">As palavras-passe não coincidem.</p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <StatusMessage status={status} />
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {saving ? 'A guardar…' : 'Atualizar credenciais'}
        </button>
      </div>
    </form>
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
  }, [initialPrefs.language, initialPrefs.theme, initialPrefs.notifications.email, initialPrefs.notifications.push, initialPrefs.notifications.sms, initialPrefs.notifications.summary]);

  React.useEffect(() => {
    setRoleForm(rolePrefs);
  }, [rolePrefs]);

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
      if (!res.ok) throw new Error('ERR');
      onSaved(form, roleForm);
      setColorMode(form.theme === 'system' ? defaultThemeFromSystem() : form.theme);
      setStatus({ type: 'success', message: 'Preferências atualizadas.' });
    } catch {
      setStatus({ type: 'error', message: 'Não foi possível guardar as preferências.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">Preferências</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Ajusta idioma, notificações e definições específicas do teu papel.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Idioma da interface">
          <Select
            value={form.language}
            onChange={(value) => setForm((prev) => ({ ...prev, language: value }))}
            options={[
              { value: 'pt-PT', label: 'Português (Portugal)' },
              { value: 'en-US', label: 'English (US)' },
            ]}
          />
        </Field>
        <Field label="Tema visual">
          <Select
            value={form.theme}
            onChange={(value) => setForm((prev) => ({ ...prev, theme: value as ThemePreference }))}
            options={[
              { value: 'system', label: 'Automático (sistema)' },
              { value: 'light', label: 'Claro' },
              { value: 'dark', label: 'Escuro' },
            ]}
          />
        </Field>
      </div>

      <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Notificações gerais</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Checkbox
            checked={form.notifications.email}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                notifications: { ...prev.notifications, email: value },
              }))
            }
            label="Receber emails sobre atividade relevante"
          />
          <Checkbox
            checked={form.notifications.push}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                notifications: { ...prev.notifications, push: value },
              }))
            }
            label="Ativar alertas na aplicação"
          />
          <Checkbox
            checked={form.notifications.sms}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                notifications: { ...prev.notifications, sms: value },
              }))
            }
            label="Receber SMS para eventos críticos"
          />
          <Field label="Resumo periódico">
            <Select
              value={form.notifications.summary}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    summary: value as NotificationPreferences['summary'],
                  },
                }))
              }
              options={[
                { value: 'daily', label: 'Diário' },
                { value: 'weekly', label: 'Semanal' },
                { value: 'monthly', label: 'Mensal' },
                { value: 'never', label: 'Nunca' },
              ]}
            />
          </Field>
        </div>
      </div>

      {role === 'ADMIN' ? (
        <RoleSpecificFields
          role="ADMIN"
          value={roleForm as AdminSettings}
          onChange={(next) => setRoleForm(next)}
        />
      ) : role === 'PT' ? (
        <RoleSpecificFields
          role="PT"
          value={roleForm as TrainerSettings}
          onChange={(next) => setRoleForm(next)}
        />
      ) : (
        <RoleSpecificFields
          role="CLIENT"
          value={roleForm as ClientSettings}
          onChange={(next) => setRoleForm(next)}
        />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <StatusMessage status={status} />
        <button
          type="submit"
          disabled={!dirty || saving}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {saving ? 'A guardar…' : 'Guardar preferências'}
        </button>
      </div>
    </form>
  );
}

function defaultThemeFromSystem(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

type RoleSpecificFieldsProps =
  | { role: 'ADMIN'; value: AdminSettings; onChange: (next: AdminSettings) => void }
  | { role: 'PT'; value: TrainerSettings; onChange: (next: TrainerSettings) => void }
  | { role: 'CLIENT'; value: ClientSettings; onChange: (next: ClientSettings) => void };

function RoleSpecificFields(props: RoleSpecificFieldsProps) {
  if (props.role === 'ADMIN') {
    const value = props.value as AdminSettings;
    return (
      <div className="space-y-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Preferências de administrador</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Frequência dos relatórios">
            <Select
              value={value.digestFrequency}
              onChange={(val) => props.onChange({ ...value, digestFrequency: val as AdminSettings['digestFrequency'] })}
              options={[
                { value: 'daily', label: 'Diário' },
                { value: 'weekly', label: 'Semanal' },
                { value: 'monthly', label: 'Mensal' },
              ]}
            />
          </Field>
          <Checkbox
            checked={value.autoAssignTrainers}
            onChange={(val) => props.onChange({ ...value, autoAssignTrainers: val })}
            label="Atribuir automaticamente novos clientes a um PT disponível"
          />
          <Checkbox
            checked={value.shareInsights}
            onChange={(val) => props.onChange({ ...value, shareInsights: val })}
            label="Partilhar métricas de utilização com a equipa"
          />
        </div>
      </div>
    );
  }

  if (props.role === 'PT') {
    const value = props.value as TrainerSettings;
    return (
      <div className="space-y-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Preferências de personal trainer</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Checkbox
            checked={value.sessionReminders}
            onChange={(val) => props.onChange({ ...value, sessionReminders: val })}
            label="Receber lembretes antes de cada sessão"
          />
          <Checkbox
            checked={value.newClientAlerts}
            onChange={(val) => props.onChange({ ...value, newClientAlerts: val })}
            label="Alertar quando um novo cliente for atribuído"
          />
          <Field label="Visibilidade do calendário">
            <Select
              value={value.calendarVisibility}
              onChange={(val) => props.onChange({ ...value, calendarVisibility: val as TrainerSettings['calendarVisibility'] })}
              options={[
                { value: 'clients', label: 'Visível para clientes acompanhados' },
                { value: 'private', label: 'Apenas eu' },
              ]}
            />
          </Field>
          <Checkbox
            checked={value.allowClientReschedule}
            onChange={(val) => props.onChange({ ...value, allowClientReschedule: val })}
            label="Permitir que clientes proponham novas datas"
          />
        </div>
      </div>
    );
  }

  const value = props.value as ClientSettings;
  return (
    <div className="space-y-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Preferências de cliente</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Checkbox
          checked={value.planReminders}
          onChange={(val) => props.onChange({ ...value, planReminders: val })}
          label="Receber lembretes dos planos e sessões"
        />
        <Checkbox
          checked={value.trainerMessages}
          onChange={(val) => props.onChange({ ...value, trainerMessages: val })}
          label="Alertar quando o PT enviar mensagens"
        />
        <Field label="Partilha de progresso">
          <Select
            value={value.shareProgress}
            onChange={(val) => props.onChange({ ...value, shareProgress: val as ClientSettings['shareProgress'] })}
            options={[
              { value: 'trainer', label: 'Partilhar com o meu PT' },
              { value: 'private', label: 'Manter privado' },
            ]}
          />
        </Field>
        <Checkbox
          checked={value.smsReminders}
          onChange={(val) => props.onChange({ ...value, smsReminders: val })}
          label="Receber SMS para check-ins diários"
        />
      </div>
    </div>
  );
}

export default function SettingsClient({ model }: { model: SettingsModel }) {
  const [account, setAccount] = React.useState<AccountState>({
    name: model.name,
    phone: model.phone,
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

  React.useEffect(() => {
    setAccount({ name: model.name, phone: model.phone, email: model.email });
    setPreferences({ language: model.language, theme: model.theme, notifications: model.notifications });
    setRolePrefs(initialRolePrefs);
  }, [model.id, model.name, model.phone, model.email, model.language, model.theme, model.notifications.email, model.notifications.push, model.notifications.sms, model.notifications.summary, initialRolePrefs]);

  return (
    <div className="space-y-6">
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
    </div>
  );
}
