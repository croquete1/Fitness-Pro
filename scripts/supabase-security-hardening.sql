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

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1
    from public.users u
    where u.id = uid
      and coalesce(u.role, '') ilike 'admin'
  );
$$;

create or replace function public.is_trainer(uid uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1
    from public.users u
    where u.id = uid
      and coalesce(u.role, '') ilike any (array['trainer', 'pt'])
  );
$$;

create or replace function public.is_client(uid uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1
    from public.users u
    where u.id = uid
      and coalesce(u.role, '') ilike 'client'
  );
$$;

create or replace function public.ensure_policy(
  p_table text,
  p_policy text,
  p_command text,
  p_roles text,
  p_using text,
  p_check text default null
) returns void
language plpgsql
as $$
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

  execute format(
    'create policy %I on public.%I as permissive for %s to %s using (%s)%s',
    p_policy,
    p_table,
    p_command,
    p_roles,
    p_using,
    case when p_check is not null then format(' with check (%s)', p_check) else '' end
  );
end;
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
  u.email  as user_email,
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

/* --------------------------- onboarding forms ---------------------------- */

select public.ensure_policy(
  'onboarding_forms',
  'onboarding_forms_select_owner',
  'select',
  'authenticated',
  'auth.uid() = user_id or public.is_admin(auth.uid()) or public.is_trainer(auth.uid())',
  null
);
select public.ensure_policy(
  'onboarding_forms',
  'onboarding_forms_write_owner',
  'insert',
  'authenticated',
  'auth.uid() = user_id or public.is_admin(auth.uid()) or public.is_trainer(auth.uid())',
  'auth.uid() = user_id or public.is_admin(auth.uid()) or public.is_trainer(auth.uid())'
);
select public.ensure_policy(
  'onboarding_forms',
  'onboarding_forms_update_owner',
  'update',
  'authenticated',
  'auth.uid() = user_id or public.is_admin(auth.uid()) or public.is_trainer(auth.uid())',
  'auth.uid() = user_id or public.is_admin(auth.uid()) or public.is_trainer(auth.uid())'
);

select public.ensure_policy(
  'onboarding_notes',
  'onboarding_notes_read',
  'select',
  'authenticated',
  'public.is_admin(auth.uid()) or public.is_trainer(auth.uid()) or author_id = auth.uid()',
  null
);
select public.ensure_policy(
  'onboarding_notes',
  'onboarding_notes_write_self',
  'insert',
  'authenticated',
  'public.is_admin(auth.uid()) or public.is_trainer(auth.uid()) or author_id = auth.uid()',
  'public.is_admin(auth.uid()) or public.is_trainer(auth.uid()) or author_id = auth.uid()'
);
select public.ensure_policy(
  'onboarding_notes',
  'onboarding_notes_update_self',
  'update',
  'authenticated',
  'public.is_admin(auth.uid()) or author_id = auth.uid()',
  'public.is_admin(auth.uid()) or author_id = auth.uid()'
);

/* --------------------------- plan hierarchies --------------------------- */

select public.ensure_policy(
  'training_plans',
  'training_plans_read_related',
  'select',
  'authenticated',
  'public.is_admin(auth.uid()) or trainer_id = auth.uid() or client_id = auth.uid()',
  null
);

select public.ensure_policy(
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

select public.ensure_policy(
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

select public.ensure_policy(
  'training_plan_blocks',
  'training_plan_blocks_read_related',
  'select',
  'authenticated',
  'public.is_admin(auth.uid()) or exists (
     select 1 from public.training_plans tp
     where tp.id = training_plan_blocks.plan_id
       and (tp.trainer_id = auth.uid() or tp.client_id = auth.uid())
   )',
  null
);

select public.ensure_policy(
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

select public.ensure_policy(
  'plan_change_logs',
  'plan_change_logs_read_related',
  'select',
  'authenticated',
  'public.is_admin(auth.uid()) or exists (
     select 1 from public.training_plans tp
     where tp.id = plan_change_logs.plan_id
       and (tp.trainer_id = auth.uid() or tp.client_id = auth.uid())
   )',
  null
);

/* -------------------------- trainer resources -------------------------- */

select public.ensure_policy(
  'trainer_blocks',
  'trainer_blocks_owner',
  'select',
  'authenticated',
  'public.is_admin(auth.uid()) or trainer_id = auth.uid()',
  null
);
select public.ensure_policy(
  'trainer_blocks',
  'trainer_blocks_write_owner',
  'all',
  'authenticated',
  'public.is_admin(auth.uid()) or trainer_id = auth.uid()',
  'public.is_admin(auth.uid()) or trainer_id = auth.uid()'
);

select public.ensure_policy(
  'trainer_locations',
  'trainer_locations_owner',
  'all',
  'authenticated',
  'public.is_admin(auth.uid()) or trainer_id = auth.uid()',
  'public.is_admin(auth.uid()) or trainer_id = auth.uid()'
);

select public.ensure_policy(
  'pt_sessions',
  'pt_sessions_read_related',
  'select',
  'authenticated',
  'public.is_admin(auth.uid()) or trainer_id = auth.uid() or client_id = auth.uid()',
  null
);

/* --------------------------- client resources -------------------------- */

select public.ensure_policy(
  'push_subscriptions',
  'push_subscriptions_owner',
  'all',
  'authenticated',
  'public.is_admin(auth.uid()) or user_id = auth.uid()',
  'public.is_admin(auth.uid()) or user_id = auth.uid()'
);

select public.ensure_policy(
  'client_wallet',
  'client_wallet_owner',
  'select',
  'authenticated',
  'public.is_admin(auth.uid()) or user_id = auth.uid()',
  null
);
select public.ensure_policy(
  'client_wallet',
  'client_wallet_update_owner',
  'update',
  'authenticated',
  'public.is_admin(auth.uid()) or user_id = auth.uid()',
  'public.is_admin(auth.uid()) or user_id = auth.uid()'
);

select public.ensure_policy(
  'notification_reads',
  'notification_reads_owner',
  'all',
  'authenticated',
  'public.is_admin(auth.uid()) or user_id = auth.uid()',
  'public.is_admin(auth.uid()) or user_id = auth.uid()'
);

select public.ensure_policy(
  'fitness_questionnaire',
  'fitness_questionnaire_owner',
  'select',
  'authenticated',
  'public.is_admin(auth.uid()) or public.is_trainer(auth.uid()) or user_id = auth.uid()',
  null
);
select public.ensure_policy(
  'fitness_questionnaire',
  'fitness_questionnaire_write_owner',
  'all',
  'authenticated',
  'public.is_admin(auth.uid()) or public.is_trainer(auth.uid()) or user_id = auth.uid()',
  'public.is_admin(auth.uid()) or public.is_trainer(auth.uid()) or user_id = auth.uid()'
);

select public.ensure_policy(
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
select public.ensure_policy(
  'fitness_questionnaire_notes',
  'fitness_questionnaire_notes_write',
  'all',
  'authenticated',
  'public.is_admin(auth.uid()) or public.is_trainer(auth.uid()) or author_id = auth.uid()',
  'public.is_admin(auth.uid()) or public.is_trainer(auth.uid()) or author_id = auth.uid()'
);

select public.ensure_policy(
  'register_requests',
  'register_requests_public_insert',
  'insert',
  'anon, authenticated',
  'true',
  'true'
);
select public.ensure_policy(
  'register_requests',
  'register_requests_admin_read',
  'select',
  'authenticated',
  'public.is_admin(auth.uid())',
  null
);
select public.ensure_policy(
  'register_requests',
  'register_requests_admin_update',
  'update',
  'authenticated',
  'public.is_admin(auth.uid())',
  'public.is_admin(auth.uid())'
);

/* ----------------------------- misc tables ----------------------------- */

select public.ensure_policy(
  'audit_log',
  'audit_log_admin',
  'select',
  'authenticated',
  'public.is_admin(auth.uid())',
  null
);

select public.ensure_policy(
  'motivation_phrases',
  'motivation_phrases_read',
  'select',
  'authenticated',
  'true',
  null
);
select public.ensure_policy(
  'motivation_phrases',
  'motivation_phrases_admin_write',
  'all',
  'authenticated',
  'public.is_admin(auth.uid()) or public.is_trainer(auth.uid())',
  'public.is_admin(auth.uid()) or public.is_trainer(auth.uid())'
);

select public.ensure_policy(
  'auth_local_users',
  'auth_local_users_admin',
  'select',
  'authenticated',
  'public.is_admin(auth.uid())',
  null
);

commit;
