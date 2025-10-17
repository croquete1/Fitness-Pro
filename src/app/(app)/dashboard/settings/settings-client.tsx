'use client';

import * as React from 'react';
import type { AppRole } from '@/lib/roles';
import { useColorMode } from '@/components/layout/ColorModeProvider';
import Button from '@/components/ui/Button';
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
  return <section className="neo-panel settings-section">{children}</section>;
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
  options: { value: string; label: string }[];
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
  return (
    <p className="settings-status" style={{ color: tone }}>
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
    form.name.trim() !== (account.name ?? '').trim() || (form.phone ?? '') !== (account.phone ?? '');

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!dirty || saving) return;
    setSaving(true);
    setStatus({ type: 'idle' });
    try {
      const updates: Record<string, unknown> = {};
      const nextName = form.name.trim();
      if (nextName !== (account.name ?? '').trim()) updates.name = nextName;
      if ((form.phone ?? null) !== (account.phone ?? null)) updates.phone = form.phone;

      const res = await fetch('/api/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('ERR');
      setStatus({ type: 'success', message: 'Alterações guardadas.' });
      onSaved({ ...account, name: nextName, phone: form.phone ?? null });
      setForm((prev) => ({ ...prev, name: nextName }));
    } catch {
      setStatus({ type: 'error', message: 'Não foi possível guardar as alterações.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="settings-form">
      <header className="settings-section__header">
        <h2 className="settings-section__title">Dados da conta</h2>
        <p className="settings-section__description">
          Atualiza o nome visível e o contacto associado à tua conta.
        </p>
      </header>

      <div className="settings-fields" data-columns="2">
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

      <div className="settings-actions">
        <StatusMessage status={status} />
        <Button type="submit" variant="primary" disabled={!dirty} loading={saving} loadingText="A guardar…">
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
    <form onSubmit={onSubmit} className="settings-form">
      <header className="settings-section__header">
        <h2 className="settings-section__title">Credenciais</h2>
        <p className="settings-section__description">
          Atualiza o email de acesso e define uma nova palavra-passe.
        </p>
      </header>

      <div className="settings-fields" data-columns="2">
        <Field label="Email de acesso">
          <TextInput type="email" value={form.email} onChange={(value) => setForm((prev) => ({ ...prev, email: value }))} />
        </Field>
        <Field label="Palavra-passe atual" description="Necessária para definir uma nova palavra-passe.">
          <TextInput
            type="password"
            value={form.currentPassword}
            onChange={(value) => setForm((prev) => ({ ...prev, currentPassword: value }))}
            disabled={!wantsPasswordChange}
          />
        </Field>
      </div>

      <div className="settings-fields" data-columns="2">
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
        <p className="settings-warning">A nova palavra-passe deve ter pelo menos 8 caracteres.</p>
      ) : null}
      {passwordMismatch ? (
        <p className="settings-warning">As palavras-passe não coincidem.</p>
      ) : null}

      <div className="settings-actions">
        <StatusMessage status={status} />
        <Button type="submit" variant="primary" disabled={disabled} loading={saving} loadingText="A guardar…">
          {saving ? 'A guardar…' : 'Atualizar credenciais'}
        </Button>
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
      const resolvedMode =
        form.theme === 'system'
          ? defaultThemeFromSystem()
          : (form.theme as Exclude<ThemePreference, 'system'>);
      setColorMode(resolvedMode);
      setStatus({ type: 'success', message: 'Preferências atualizadas.' });
    } catch {
      setStatus({ type: 'error', message: 'Não foi possível guardar as preferências.' });
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

      <div className="settings-subpanel">
        <p className="settings-subpanel__title">Notificações gerais</p>
        <div className="settings-toggle-grid">
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

      <RolePreferencesSection role={role} value={roleForm} onChange={setRoleForm} />

      <div className="settings-actions">
        <StatusMessage status={status} />
        <Button type="submit" variant="primary" disabled={!dirty} loading={saving} loadingText="A guardar…">
          Guardar preferências
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

function defaultThemeFromSystem(): Exclude<ThemePreference, 'system'> {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
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

  return (
    <div className="settings-view">
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
