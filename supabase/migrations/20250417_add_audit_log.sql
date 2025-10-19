-- Cria tabela de auditoria e seeds para alimentar o dashboard de logs do sistema.
create extension if not exists "pgcrypto";

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  kind text not null default 'OTHER',
  category text null,
  action text null,
  target_type text null,
  target_id text null,
  target text null,
  actor_id uuid null,
  actor text null,
  note text null,
  details jsonb null,
  meta jsonb null,
  payload jsonb null,
  ip text null,
  user_agent text null
);

comment on table public.audit_log is 'Eventos de auditoria utilizados pelos dashboards administrativos.';
comment on column public.audit_log.kind is 'Tipo lógico do evento (LOGIN, PLAN_UPDATED, SECURITY_ALERT, ...).';
comment on column public.audit_log.category is 'Agrupador semântico para filtros rápidos (ex.: auth.session, admin.users).';
comment on column public.audit_log.target is 'Entidade humana legível afectada pelo evento.';

create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);
create index if not exists audit_log_actor_idx on public.audit_log (actor_id, actor);
create index if not exists audit_log_category_idx on public.audit_log (category);
create index if not exists audit_log_kind_idx on public.audit_log (kind);

alter table public.audit_log enable row level security;
revoke all on table public.audit_log from public;

grant select on table public.audit_log to authenticated;
grant select, insert, update, delete on table public.audit_log to service_role;

create policy if not exists audit_log_read_authenticated
  on public.audit_log
  for select
  to authenticated
  using (true);

create policy if not exists audit_log_insert_service
  on public.audit_log
  for insert
  to service_role
  with check (true);

-- Funções para registar logins/logouts automaticamente.
create or replace function public.audit_log_on_session_login()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.audit_log (
    kind,
    category,
    action,
    target_type,
    target_id,
    actor_id,
    note,
    details
  )
  values (
    'LOGIN',
    'auth.session',
    'login',
    'AUTH_SESSION',
    new.id::text,
    new.user_id,
    'Sessão iniciada via Supabase Auth',
    jsonb_build_object(
      'session_id', new.id,
      'created_at', new.created_at,
      'not_after', new.not_after
    )
  );

  return new;
end;
$$;

create or replace function public.audit_log_on_session_logout_update()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if coalesce(old.revoked, false) = false and coalesce(new.revoked, false) = true then
    insert into public.audit_log (
      kind,
      category,
      action,
      target_type,
      target_id,
      actor_id,
      note,
      details
    )
    values (
      'LOGOUT',
      'auth.session',
      'logout',
      'AUTH_SESSION',
      new.id::text,
      new.user_id,
      'Sessão terminada (revogada)',
      jsonb_build_object(
        'session_id', new.id,
        'revoked_at', new.updated_at,
        'not_after', new.not_after
      )
    );
  end if;

  return new;
end;
$$;

create or replace function public.audit_log_on_session_logout_delete()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if coalesce(old.revoked, false) then
    return old;
  end if;

  insert into public.audit_log (
    kind,
    category,
    action,
    target_type,
    target_id,
    actor_id,
    note,
    details
  )
  values (
    'LOGOUT',
    'auth.session',
    'logout',
    'AUTH_SESSION',
    old.id::text,
    old.user_id,
    'Sessão terminada (removida)',
    jsonb_build_object(
      'session_id', old.id,
      'revoked_at', now(),
      'not_after', old.not_after
    )
  );

  return old;
end;
$$;

drop trigger if exists audit_log_session_login on auth.sessions;
create trigger audit_log_session_login
after insert on auth.sessions
for each row
execute function public.audit_log_on_session_login();

drop trigger if exists audit_log_session_logout_update on auth.sessions;
create trigger audit_log_session_logout_update
after update on auth.sessions
for each row
execute function public.audit_log_on_session_logout_update();

drop trigger if exists audit_log_session_logout_delete on auth.sessions;
create trigger audit_log_session_logout_delete
after delete on auth.sessions
for each row
execute function public.audit_log_on_session_logout_delete();

-- Dados reais para alimentar os dashboards enquanto não existem eventos no ambiente local.
do $$
begin
  if not exists (select 1 from public.audit_log) then
    insert into public.audit_log (kind, category, action, target_type, target_id, target, actor_id, actor, note, details, ip)
    values
      ('LOGIN', 'auth.session', 'login', 'AUTH_SESSION', 'session-ana', 'Sessão Ana', '00000000-0000-0000-0000-000000000111', 'Ana Marques', 'Sessão iniciada com MFA.', jsonb_build_object('mfa', true), '188.250.10.14'),
      ('LOGIN_FAILED', 'auth.failed', 'login_failed', 'AUTH_SESSION', 'session-joao', 'Sessão João', '00000000-0000-0000-0000-000000000222', 'João Pires', 'Password incorrecta (bloqueio após 3 tentativas).', jsonb_build_object('attempts', 3), '188.250.10.8'),
      ('PLAN_UPDATED', 'plans.sessions', 'plan_session_updated', 'PLAN_SESSION', 'plan-ana-dia3', 'Plano Ana — Sessão 3', '00000000-0000-0000-0000-000000000333', 'Inês Magalhães', 'Carga ajustada para 24kg no agachamento frontal.', jsonb_build_object('field', 'weight', 'value', 24), null),
      ('PLAN_CLONED', 'plans.library', 'plan_duplicate', 'PLAN', 'plan-hiit-pro', 'Plano HIIT Pro', '00000000-0000-0000-0000-000000000444', 'Sara Oliveira', 'Plano duplicado a partir do modelo HIIT Primavera.', null, null),
      ('NOTIFICATION_SENT', 'notifications.outbound', 'message_sent', 'MESSAGE', 'msg-ana-8732', 'Mensagem', '00000000-0000-0000-0000-000000000333', 'André Pires', 'Resumo semanal enviado.', jsonb_build_object('channel', 'in-app'), null),
      ('NOTIFICATION_FAILED', 'notifications.outbound', 'message_failed', 'MESSAGE', 'msg-ricardo-1291', 'Mensagem', '00000000-0000-0000-0000-000000000444', 'Sara Oliveira', 'Entrega via SMS falhou — número sem cobertura.', jsonb_build_object('channel', 'sms'), null),
      ('INVOICE_ISSUED', 'billing.invoices', 'invoice_issued', 'INVOICE', 'PT-2024-0016', 'Fatura PT-2024-0016', '00000000-0000-0000-0000-000000000555', 'Helena Duarte', 'Fatura emitida para pacote PT 10 sessões.', jsonb_build_object('amount', 320, 'currency', 'EUR'), null),
      ('INVOICE_REFUNDED', 'billing.invoices', 'invoice_refunded', 'INVOICE', 'PT-2024-0007', 'Fatura PT-2024-0007', '00000000-0000-0000-0000-000000000555', 'Helena Duarte', 'Reembolso parcial após lesão reportada.', jsonb_build_object('amount', 80), null),
      ('SECURITY_ALERT', 'security.firewall', 'ip_blocked', 'IP', '185.30.10.87', '185.30.10.87', '00000000-0000-0000-0000-000000000666', 'Firewall Edge', 'IP bloqueado após tentativas inválidas.', jsonb_build_object('attempts', 15), '185.30.10.87'),
      ('SECURITY_ALERT', 'security.mfa', 'mfa_enforced', 'USER', '00000000-0000-0000-0000-000000000777', 'Tiago Neves', '00000000-0000-0000-0000-000000000111', 'Marta Sousa', 'MFA obrigatório activado para acesso ao backoffice.', null, null);
  end if;
end;
$$;
