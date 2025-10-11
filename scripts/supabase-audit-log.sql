-- scripts/supabase-audit-log.sql
--
-- Executa este script no SQL Editor do Supabase para criar a tabela de auditoria
-- utilizada pelo dashboard de admin para mostrar login, última actividade e
-- estado online dos utilizadores.
--
-- ⚠️ Testa num ambiente de staging antes de aplicar em produção.

begin;

create extension if not exists "pgcrypto";

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists(
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
    execute $$create policy audit_log_read_admin on public.audit_log as permissive for select to authenticated using (
      public.is_admin(auth.uid())
    )$$;
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'audit_log' and policyname = 'audit_log_insert_service'
  ) then
    execute $$create policy audit_log_insert_service on public.audit_log as permissive for insert to authenticated with check (
      auth.role() = 'service_role' or public.is_admin(auth.uid())
    )$$;
  end if;
end;
$$;

commit;
