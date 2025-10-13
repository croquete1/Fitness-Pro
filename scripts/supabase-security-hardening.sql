-- scripts/supabase-security-hardening.sql
--
-- Executa este script no SQL Editor do Supabase (projeto já ligado ao Vercel)
-- para resolver os avisos de segurança do lint e alinhar os campos/grupos
-- com o código da aplicação.
--
-- ⚠️ Revê sempre em ambiente de testes antes de aplicar em produção.

begin;

/* -------------------------------------------------------------------------- */
/*  Helpers: funções utilitárias para políticas                               */
/* -------------------------------------------------------------------------- */

create or replace function public.jwt_claims()
returns jsonb
language plpgsql
stable
as $$
declare
  raw_claims text;
begin
  raw_claims := current_setting('request.jwt.claims', true);
  if raw_claims is null or raw_claims = '' then
    return null;
  end if;

  return raw_claims::jsonb;
exception
  when others then
    return null;
end;
$$;

create or replace function public.jwt_roles()
returns text[]
language plpgsql
stable
as $$
declare
  claims jsonb;
  raw text;
  roles text[] := array[]::text[];
begin
  claims := public.jwt_claims();
  if claims is null then
    return roles;
  end if;

  foreach raw in array array[
    claims ->> 'app_role',
    claims ->> 'role',
    claims #>> '{app_metadata,app_role}',
    claims #>> '{app_metadata,role}',
    claims #>> '{user,app_role}',
    claims #>> '{user,role}',
    claims #>> '{user,app_metadata,app_role}',
    claims #>> '{user,app_metadata,role}',
    claims #>> '{user,user_metadata,role}'
  ]
  loop
    if raw is not null and btrim(raw) <> '' then
      roles := array_append(roles, upper(btrim(raw)));
    end if;
  end loop;

  if jsonb_typeof(claims -> 'roles') = 'array' then
    for raw in select value from jsonb_array_elements_text(claims -> 'roles') loop
      if raw is not null and btrim(raw) <> '' then
        roles := array_append(roles, upper(btrim(raw)));
      end if;
    end loop;
  end if;

  if jsonb_typeof(claims -> 'user_roles') = 'array' then
    for raw in select value from jsonb_array_elements_text(claims -> 'user_roles') loop
      if raw is not null and btrim(raw) <> '' then
        roles := array_append(roles, upper(btrim(raw)));
      end if;
    end loop;
  end if;

  if jsonb_typeof(claims -> 'app_roles') = 'array' then
    for raw in select value from jsonb_array_elements_text(claims -> 'app_roles') loop
      if raw is not null and btrim(raw) <> '' then
        roles := array_append(roles, upper(btrim(raw)));
      end if;
    end loop;
  end if;

  if jsonb_typeof(claims #> '{app_metadata,roles}') = 'array' then
    for raw in select value from jsonb_array_elements_text(claims #> '{app_metadata,roles}') loop
      if raw is not null and btrim(raw) <> '' then
        roles := array_append(roles, upper(btrim(raw)));
      end if;
    end loop;
  end if;

  if jsonb_typeof(claims #> '{user,roles}') = 'array' then
    for raw in select value from jsonb_array_elements_text(claims #> '{user,roles}') loop
      if raw is not null and btrim(raw) <> '' then
        roles := array_append(roles, upper(btrim(raw)));
      end if;
    end loop;
  end if;

  if jsonb_typeof(claims #> '{user,app_roles}') = 'array' then
    for raw in select value from jsonb_array_elements_text(claims #> '{user,app_roles}') loop
      if raw is not null and btrim(raw) <> '' then
        roles := array_append(roles, upper(btrim(raw)));
      end if;
    end loop;
  end if;

  if jsonb_typeof(claims #> '{user,user_roles}') = 'array' then
    for raw in select value from jsonb_array_elements_text(claims #> '{user,user_roles}') loop
      if raw is not null and btrim(raw) <> '' then
        roles := array_append(roles, upper(btrim(raw)));
      end if;
    end loop;
  end if;

  return coalesce((
    select array_agg(distinct r) from unnest(roles) as t(r) where r is not null and r <> ''
  ), array[]::text[]);
exception
  when others then
    return array[]::text[];
end;
$$;

create or replace function public.jwt_role()
returns text
language sql
stable
as $$
  select public.jwt_roles()[1];
$$;

create or replace function public.jwt_has_role(target text)
returns boolean
language sql
stable
as $$
  select
    target is not null
    and exists (
      select 1 from unnest(public.jwt_roles()) as role where role = upper(target)
    );
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

create or replace function public.is_trainer(uid uuid)
returns boolean
language sql
stable
as $$
  select
    public.jwt_has_role('PT')
    or public.jwt_has_role('TRAINER')
    or exists(
      select 1
      from public.users u
      where u.id = uid
        and u.role::text ilike any (array['trainer', 'pt'])
    );
$$;

create or replace function public.is_client(uid uuid)
returns boolean
language sql
stable
as $$
  select
    public.jwt_has_role('CLIENT')
    or exists(
      select 1
      from public.users u
      where u.id = uid
        and u.role::text ilike 'client'
    );
$$;

do $$
begin
  -- Garantir que a função existe mesmo que o script seja executado parcialmente
  execute 'drop function if exists public.ensure_policy(text, text, text, text, text)';
  execute 'drop function if exists public.ensure_policy(text, text, text, text, text, text)';

  execute $create$
    create function public.ensure_policy(
      p_table text,
      p_policy text,
      p_command text,
      p_roles text,
      p_using text,
      p_check text default null
    ) returns void
    language plpgsql
    as $body$
    declare
      v_command text := lower(trim(p_command));
      v_check_clause text := '';
      v_using_expr text := coalesce(nullif(trim(p_using), ''), 'true');
      v_sql text;
    begin
      if exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = p_table
          and policyname = p_policy
      ) then
        return;
      end if;

      if p_check is not null then
        v_check_clause := format(' with check (%s)', p_check);
      end if;

      if v_command = 'insert' then
        v_sql := format(
          'create policy %I on public.%I as permissive for %s to %s%s',
          p_policy,
          p_table,
          p_command,
          p_roles,
          v_check_clause
        );
      else
        v_sql := format(
          'create policy %I on public.%I as permissive for %s to %s using (%s)%s',
          p_policy,
          p_table,
          p_command,
          p_roles,
          v_using_expr,
          v_check_clause
        );
      end if;

      execute v_sql;
    end;
    $body$;
  $create$;
end
$$;


/* -------------------------------------------------------------------------- */
/*  View onboarding_forms_with_user                                           */
/* -------------------------------------------------------------------------- */

create or replace view public.onboarding_forms_with_user
with (security_invoker = true)
as
select
  f.id,
  f.user_id,
  f.status,
  f.goals,
  f.injuries,
  f.medical,
  f.activity_level,
  f.experience,
  f.availability,
  f.created_at,
  f.updated_at,
  p.name   as profile_name,
  u.email::varchar(255) as user_email,
  u.role   as user_role
from public.onboarding_forms f
left join public.profiles p on p.id = f.user_id
left join public.users    u on u.id = f.user_id;

revoke all on public.onboarding_forms_with_user from anon;
grant select on public.onboarding_forms_with_user to authenticated;

/* -------------------------------------------------------------------------- */
/*  Row Level Security                                                        */
/* -------------------------------------------------------------------------- */

alter table if exists public.onboarding_forms         enable row level security;
alter table if exists public.onboarding_notes          enable row level security;
alter table if exists public.plan_blocks              enable row level security;
alter table if exists public.training_plan_blocks     enable row level security;
alter table if exists public.training_plan_changes    enable row level security;
alter table if exists public.plan_change_logs         enable row level security;
alter table if exists public.training_days            enable row level security;
alter table if exists public.trainer_blocks           enable row level security;
alter table if exists public.trainer_locations        enable row level security;
alter table if exists public.push_subscriptions       enable row level security;
alter table if exists public.client_wallet            enable row level security;
alter table if exists public.notification_reads       enable row level security;
alter table if exists public.fitness_questionnaire    enable row level security;
alter table if exists public.fitness_questionnaire_notes enable row level security;
alter table if exists public.register_requests        enable row level security;
alter table if exists public.audit_log                enable row level security;
alter table if exists public.pt_sessions              enable row level security;
alter table if exists public.motivation_phrases       enable row level security;
alter table if exists public.auth_local_users         enable row level security;
alter table if exists public.profile_private          enable row level security;
alter table if exists public.exercises               enable row level security;

/* ---------------------------- exercises library ---------------------------- */

alter table if exists public.exercises
  add column if not exists owner_id uuid,
  add column if not exists is_global boolean default false not null,
  add column if not exists is_published boolean default false not null,
  add column if not exists published_at timestamptz,
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table if exists public.exercises
  alter column owner_id drop default,
  alter column owner_id set default auth.uid();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'exercises'
      and column_name = 'published'
  ) then
    execute 'update public.exercises set is_published = coalesce(is_published, published)';
    execute 'alter table public.exercises drop column published';
  end if;
end
$$;

do $$
begin
  if to_regclass('public.exercises') is not null then
    update public.exercises
    set is_global = true
    where owner_id is null and is_global is not true;

    update public.exercises
    set published_at = coalesce(published_at, timezone('utc', now()))
    where is_published is true and published_at is null;

    update public.exercises
    set updated_at = timezone('utc', now())
    where updated_at is null;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'exercises'
        and column_name = 'created_by'
    ) then
      update public.exercises
      set owner_id = created_by
      where owner_id is null and coalesce(is_global, false) = false and created_by is not null;
    end if;

    execute 'alter table public.exercises drop constraint if exists exercises_owner_id_fkey';
    execute 'alter table public.exercises add constraint exercises_owner_id_fkey foreign key (owner_id) references public.users(id) on delete set null';
    execute 'create index if not exists exercises_owner_id_idx on public.exercises(owner_id)';
    execute 'create index if not exists exercises_is_global_idx on public.exercises(is_global)';
    execute 'create index if not exists exercises_is_published_idx on public.exercises(is_published)';
  end if;
end
$$;

/* --------------------------- onboarding forms ---------------------------- */

do $policies$
begin
  /* --------------------------- onboarding forms ---------------------------- */

  perform public.ensure_policy(
    'onboarding_forms',
    'onboarding_forms_select_owner',
    'select',
    'authenticated',
    'auth.uid() = user_id or public.is_admin(auth.uid()) or public.is_trainer(auth.uid())',
    null
  );
  perform public.ensure_policy(
    'onboarding_forms',
    'onboarding_forms_write_owner',
    'insert',
    'authenticated',
    'auth.uid() = user_id or public.is_admin(auth.uid()) or public.is_trainer(auth.uid())',
    'auth.uid() = user_id or public.is_admin(auth.uid()) or public.is_trainer(auth.uid())'
  );
  perform public.ensure_policy(
    'onboarding_forms',
    'onboarding_forms_update_owner',
    'update',
    'authenticated',
    'auth.uid() = user_id or public.is_admin(auth.uid()) or public.is_trainer(auth.uid())',
    'auth.uid() = user_id or public.is_admin(auth.uid()) or public.is_trainer(auth.uid())'
  );

  perform public.ensure_policy(
    'onboarding_notes',
    'onboarding_notes_read',
    'select',
    'authenticated',
    'public.is_admin(auth.uid()) or public.is_trainer(auth.uid()) or author_id = auth.uid()',
    null
  );
  perform public.ensure_policy(
    'onboarding_notes',
    'onboarding_notes_write_self',
    'insert',
    'authenticated',
    'public.is_admin(auth.uid()) or public.is_trainer(auth.uid()) or author_id = auth.uid()',
    'public.is_admin(auth.uid()) or public.is_trainer(auth.uid()) or author_id = auth.uid()'
  );
  perform public.ensure_policy(
    'onboarding_notes',
    'onboarding_notes_update_self',
    'update',
    'authenticated',
    'public.is_admin(auth.uid()) or author_id = auth.uid()',
    'public.is_admin(auth.uid()) or author_id = auth.uid()'
  );

  /* ---------------------------- profile private ---------------------------- */

  perform public.ensure_policy(
    'profile_private',
    'profile_private_select_owner',
    'select',
    'authenticated',
    'auth.uid() = user_id or public.is_admin(auth.uid())',
    null
  );
  perform public.ensure_policy(
    'profile_private',
    'profile_private_write_owner',
    'insert',
    'authenticated',
    'auth.uid() = user_id or public.is_admin(auth.uid())',
    'auth.uid() = user_id or public.is_admin(auth.uid())'
  );
  perform public.ensure_policy(
    'profile_private',
    'profile_private_update_owner',
    'update',
    'authenticated',
    'auth.uid() = user_id or public.is_admin(auth.uid())',
    'auth.uid() = user_id or public.is_admin(auth.uid())'
  );

  /* ---------------------------- exercises ---------------------------- */

  perform public.ensure_policy(
    'exercises',
    'exercises_select_scoped',
    'select',
    'authenticated',
    'public.is_admin(auth.uid()) or (coalesce(is_global,false) and coalesce(is_published,false)) or owner_id = auth.uid()',
    null
  );
  perform public.ensure_policy(
    'exercises',
    'exercises_insert_owner',
    'insert',
    'authenticated',
    'public.is_admin(auth.uid()) or owner_id = auth.uid()',
    'public.is_admin(auth.uid()) or (owner_id = auth.uid() and coalesce(is_global,false) = false and coalesce(is_published,false) = false)'
  );
  perform public.ensure_policy(
    'exercises',
    'exercises_update_owner',
    'update',
    'authenticated',
    'public.is_admin(auth.uid()) or owner_id = auth.uid()',
    'public.is_admin(auth.uid()) or (owner_id = auth.uid() and coalesce(is_global,false) = false)'
  );
  perform public.ensure_policy(
    'exercises',
    'exercises_delete_owner',
    'delete',
    'authenticated',
    'public.is_admin(auth.uid()) or owner_id = auth.uid()',
    null
  );

  /* --------------------------- plan hierarchies --------------------------- */

  perform public.ensure_policy(
    'training_plans',
    'training_plans_read_related',
    'select',
    'authenticated',
    'public.is_admin(auth.uid()) or trainer_id = auth.uid() or client_id = auth.uid()',
    null
  );

  perform public.ensure_policy(
    'training_days',
    'training_days_read_related',
    'select',
    'authenticated',
    'public.is_admin(auth.uid()) or exists (
       select 1 from public.training_plans tp
       where tp.id = training_days.plan_id
         and (tp.trainer_id = auth.uid() or tp.client_id = auth.uid())
     )',
    null
  );

  perform public.ensure_policy(
    'plan_blocks',
    'plan_blocks_read_related',
    'select',
    'authenticated',
    'public.is_admin(auth.uid()) or exists (
       select 1 from public.training_days td
       join public.training_plans tp on tp.id = td.plan_id
       where td.id = plan_blocks.day_id
         and (tp.trainer_id = auth.uid() or tp.client_id = auth.uid())
     )',
    null
  );

  perform public.ensure_policy(
    'training_plan_blocks',
    'training_plan_blocks_read_related',
    'select',
    'authenticated',
    'public.is_admin(auth.uid()) or exists (
       select 1
       from public.training_days td
       join public.training_plans tp on tp.id = td.plan_id
       where td.id = training_plan_blocks.day_id
         and (tp.trainer_id = auth.uid() or tp.client_id = auth.uid())
     )',
    null
  );

  perform public.ensure_policy(
    'training_plan_changes',
    'training_plan_changes_read_related',
    'select',
    'authenticated',
    'public.is_admin(auth.uid()) or exists (
       select 1 from public.training_plans tp
       where tp.id = training_plan_changes.plan_id
         and (tp.trainer_id = auth.uid() or tp.client_id = auth.uid())
     )',
    null
  );

  perform public.ensure_policy(
    'plan_change_logs',
    'plan_change_logs_read_related',
    'select',
    'authenticated',
    'public.is_admin(auth.uid()) or exists (
       select 1 from public.training_plans tp
       where tp.id::text = plan_change_logs.plan_id
         and (tp.trainer_id = auth.uid() or tp.client_id = auth.uid())
     )',
    null
  );

  /* -------------------------- trainer resources -------------------------- */

  perform public.ensure_policy(
    'trainer_blocks',
    'trainer_blocks_owner',
    'select',
    'authenticated',
    'public.is_admin(auth.uid()) or trainer_id = auth.uid()',
    null
  );
  perform public.ensure_policy(
    'trainer_blocks',
    'trainer_blocks_write_owner',
    'all',
    'authenticated',
    'public.is_admin(auth.uid()) or trainer_id = auth.uid()',
    'public.is_admin(auth.uid()) or trainer_id = auth.uid()'
  );

  perform public.ensure_policy(
    'trainer_locations',
    'trainer_locations_owner',
    'all',
    'authenticated',
    'public.is_admin(auth.uid()) or trainer_id = auth.uid()',
    'public.is_admin(auth.uid()) or trainer_id = auth.uid()'
  );

  perform public.ensure_policy(
    'pt_sessions',
    'pt_sessions_read_related',
    'select',
    'authenticated',
    'public.is_admin(auth.uid()) or trainer_id = auth.uid() or client_id = auth.uid()',
    null
  );

  /* --------------------------- client resources -------------------------- */

  perform public.ensure_policy(
    'push_subscriptions',
    'push_subscriptions_owner',
    'all',
    'authenticated',
    'public.is_admin(auth.uid()) or user_id = auth.uid()',
    'public.is_admin(auth.uid()) or user_id = auth.uid()'
  );

  perform public.ensure_policy(
    'client_wallet',
    'client_wallet_owner',
    'select',
    'authenticated',
    'public.is_admin(auth.uid()) or user_id = auth.uid()',
    null
  );
  perform public.ensure_policy(
    'client_wallet',
    'client_wallet_update_owner',
    'update',
    'authenticated',
    'public.is_admin(auth.uid()) or user_id = auth.uid()',
    'public.is_admin(auth.uid()) or user_id = auth.uid()'
  );

  perform public.ensure_policy(
    'notification_reads',
    'notification_reads_owner',
    'all',
    'authenticated',
    'public.is_admin(auth.uid()) or user_id = auth.uid()',
    'public.is_admin(auth.uid()) or user_id = auth.uid()'
  );

  perform public.ensure_policy(
    'fitness_questionnaire',
    'fitness_questionnaire_owner',
    'select',
    'authenticated',
    'public.is_admin(auth.uid()) or public.is_trainer(auth.uid()) or user_id = auth.uid()',
    null
  );
  perform public.ensure_policy(
    'fitness_questionnaire',
    'fitness_questionnaire_write_owner',
    'all',
    'authenticated',
    'public.is_admin(auth.uid()) or public.is_trainer(auth.uid()) or user_id = auth.uid()',
    'public.is_admin(auth.uid()) or public.is_trainer(auth.uid()) or user_id = auth.uid()'
  );

  perform public.ensure_policy(
    'fitness_questionnaire_notes',
    'fitness_questionnaire_notes_read',
    'select',
    'authenticated',
    'public.is_admin(auth.uid()) or public.is_trainer(auth.uid()) or author_id = auth.uid() or exists (
       select 1 from public.fitness_questionnaire fq
       where fq.id = fitness_questionnaire_notes.questionnaire_id
         and fq.user_id = auth.uid()
     )',
    null
  );
  perform public.ensure_policy(
    'fitness_questionnaire_notes',
    'fitness_questionnaire_notes_write',
    'all',
    'authenticated',
    'public.is_admin(auth.uid()) or public.is_trainer(auth.uid()) or author_id = auth.uid()',
    'public.is_admin(auth.uid()) or public.is_trainer(auth.uid()) or author_id = auth.uid()'
  );

  perform public.ensure_policy(
    'register_requests',
    'register_requests_public_insert',
    'insert',
    'anon, authenticated',
    'true',
    'true'
  );
  perform public.ensure_policy(
    'register_requests',
    'register_requests_admin_read',
    'select',
    'authenticated',
    'public.is_admin(auth.uid())',
    null
  );
  perform public.ensure_policy(
    'register_requests',
    'register_requests_admin_update',
    'update',
    'authenticated',
    'public.is_admin(auth.uid())',
    'public.is_admin(auth.uid())'
  );

  /* ----------------------------- misc tables ----------------------------- */

  perform public.ensure_policy(
    'audit_log',
    'audit_log_admin',
    'select',
    'authenticated',
    'public.is_admin(auth.uid())',
    null
  );

  perform public.ensure_policy(
    'motivation_phrases',
    'motivation_phrases_read',
    'select',
    'authenticated',
    'true',
    null
  );
  perform public.ensure_policy(
    'motivation_phrases',
    'motivation_phrases_admin_write',
    'all',
    'authenticated',
    'public.is_admin(auth.uid()) or public.is_trainer(auth.uid())',
    'public.is_admin(auth.uid()) or public.is_trainer(auth.uid())'
  );

  perform public.ensure_policy(
    'auth_local_users',
    'auth_local_users_admin',
    'select',
    'authenticated',
    'public.is_admin(auth.uid())',
    null
  );
end
$policies$;

commit;

