-- scripts/supabase-audit-log.sql
--
-- Executa este script no SQL Editor do Supabase para criar a tabela de auditoria
-- utilizada pelo dashboard de admin para mostrar login, última actividade e
-- estado online dos utilizadores.
--
-- ⚠️ Testa num ambiente de staging antes de aplicar em produção.

begin;

create extension if not exists "pgcrypto";

create or replace function public.jwt_role()
returns text
language plpgsql
stable
as $$
declare
  raw_claims text;
  claims jsonb;
  role text;
begin
  raw_claims := current_setting('request.jwt.claims', true);
  if raw_claims is null or raw_claims = '' then
    return null;
  end if;

  claims := raw_claims::jsonb;
  role := coalesce(
    claims ->> 'app_role',
    claims ->> 'role',
    claims -> 'user' ->> 'app_role',
    claims -> 'user' ->> 'role'
  );

  if role is null then
    return null;
  end if;

  return upper(role);
exception
  when others then
    return null;
end;
$$;

create or replace function public.jwt_has_role(target text)
returns boolean
language sql
stable
as $$
  select coalesce(public.jwt_role() = upper(target), false);
$$;

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select
    public.jwt_has_role('ADMIN')
    or exists(
      select 1
      from public.users u
      where u.id = uid
        and u.role::text ilike 'admin'
    );
$$;

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

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'audit_log' and column_name = 'created_at'
  ) then
    alter table public.audit_log add column created_at timestamptz not null default timezone('utc', now());
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'audit_log' and column_name = 'kind'
  ) then
    alter table public.audit_log add column kind text not null default 'OTHER';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'audit_log' and column_name = 'category'
  ) then
    alter table public.audit_log add column category text null;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'audit_log' and column_name = 'action'
  ) then
    alter table public.audit_log add column action text null;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'audit_log' and column_name = 'target_type'
  ) then
    alter table public.audit_log add column target_type text null;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'audit_log' and column_name = 'target_id'
  ) then
    alter table public.audit_log add column target_id text null;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'audit_log' and column_name = 'target'
  ) then
    alter table public.audit_log add column target text null;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'audit_log' and column_name = 'actor_id'
  ) then
    alter table public.audit_log add column actor_id uuid null;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'audit_log' and column_name = 'actor'
  ) then
    alter table public.audit_log add column actor text null;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'audit_log' and column_name = 'note'
  ) then
    alter table public.audit_log add column note text null;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'audit_log' and column_name = 'details'
  ) then
    alter table public.audit_log add column details jsonb null;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'audit_log' and column_name = 'meta'
  ) then
    alter table public.audit_log add column meta jsonb null;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'audit_log' and column_name = 'payload'
  ) then
    alter table public.audit_log add column payload jsonb null;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'audit_log' and column_name = 'ip'
  ) then
    alter table public.audit_log add column ip text null;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'audit_log' and column_name = 'user_agent'
  ) then
    alter table public.audit_log add column user_agent text null;
  end if;
end;
$$;

-- Índices para acelerar as consultas mais comuns.
create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);
create index if not exists audit_log_actor_id_idx on public.audit_log (actor_id);
create index if not exists audit_log_kind_idx on public.audit_log (kind);
create index if not exists audit_log_category_idx on public.audit_log (category);

-- Opcional: etiqueta para facilitar o `ilike('category', 'account%')`.
comment on column public.audit_log.category is 'Categoria lógica para filtros rápidos (ex.: account.profile)';

-- Activa RLS e garante que o serviço pode escrever.
alter table public.audit_log enable row level security;
revoke all on table public.audit_log from public;

grant select, insert on table public.audit_log to authenticated;
grant select, insert, update, delete on table public.audit_log to service_role;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'audit_log' and policyname = 'audit_log_read_admin'
  ) then
    execute '
      create policy audit_log_read_admin
      on public.audit_log
      as permissive
      for select
      to authenticated
      using (
        public.is_admin(auth.uid())
      )
    ';
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'audit_log' and policyname = 'audit_log_insert_service'
  ) then
    execute '
      create policy audit_log_insert_service
      on public.audit_log
      as permissive
      for insert
      to authenticated
      with check (
        auth.role() = ''service_role'' or public.is_admin(auth.uid())
      )
    ';
  end if;
end;
$$;

--
-- Garante que logins e logouts de sessões autenticadas ficam registados
-- automaticamente na tabela de auditoria. Estes eventos alimentam o dashboard
-- de utilizadores com informação sobre último login, última actividade e
-- estado online.
--

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
    'Sessão iniciada através do Supabase Auth',
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

commit;
