-- Configura as tabelas e vistas necessárias para gerir aprovações no painel de administração.
create extension if not exists "pgcrypto";

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  trainer_id uuid,
  name text,
  email text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  requested_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  metadata jsonb not null default '{}'::jsonb
);

alter table public.approvals
  add constraint approvals_user_fk
    foreign key (user_id) references public.profiles (id)
    on delete cascade;

alter table public.approvals
  add constraint approvals_trainer_fk
    foreign key (trainer_id) references public.profiles (id)
    on delete set null;

comment on table public.approvals is 'Pedidos submetidos por utilizadores a aguardar revisão manual.';
comment on column public.approvals.user_id is 'Utilizador que realizou o pedido de acesso.';
comment on column public.approvals.trainer_id is 'Personal trainer associado ao pedido, quando aplicável.';
comment on column public.approvals.status is 'Estado do pedido: pending, approved ou rejected.';
comment on column public.approvals.requested_at is 'Momento em que o pedido foi registado.';
comment on column public.approvals.metadata is 'Dados adicionais serializados para integrações futuras.';

create index if not exists approvals_status_idx on public.approvals (status);
create index if not exists approvals_user_idx on public.approvals (user_id);
create index if not exists approvals_trainer_idx on public.approvals (trainer_id);
create index if not exists approvals_requested_at_idx on public.approvals using brin (requested_at);

create or replace function public.approvals_fill_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile record;
  account record;
begin
  if new.status is not null then
    new.status := lower(new.status);
  end if;

  if new.metadata is null then
    new.metadata := '{}'::jsonb;
  end if;

  if tg_op = 'INSERT' and new.requested_at is null then
    new.requested_at := timezone('utc', now());
  end if;

  if new.user_id is null then
    return new;
  end if;

  select p.full_name, p.name, p.email
    into profile
  from public.profiles p
  where p.id = new.user_id;

  select u.email,
         coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name') as meta_name
    into account
  from auth.users u
  where u.id = new.user_id;

  if new.name is null or btrim(new.name) = '' then
    new.name := coalesce(
      nullif(profile.full_name, ''),
      nullif(profile.name, ''),
      nullif(account.meta_name, ''),
      new.name
    );
  end if;

  if new.email is null or btrim(new.email) = '' then
    new.email := coalesce(profile.email, account.email, new.email);
  end if;

  return new;
end;
$$;

create or replace function public.approvals_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists approvals_fill_defaults on public.approvals;
create trigger approvals_fill_defaults
  before insert or update
  on public.approvals
  for each row
  execute function public.approvals_fill_defaults();

drop trigger if exists approvals_set_updated_at on public.approvals;
create trigger approvals_set_updated_at
  before update
  on public.approvals
  for each row
  execute function public.approvals_touch_updated_at();

create or replace view public.admin_approval_requests as
select
  a.id,
  a.user_id,
  a.trainer_id,
  a.name,
  a.email,
  a.status,
  a.requested_at,
  a.created_at,
  a.updated_at,
  a.metadata
from public.approvals a;

comment on view public.admin_approval_requests is 'Vista de apoio ao dashboard de aprovações com campos enriquecidos.';

create or replace view public.pending_approvals as
select
  a.id,
  a.user_id,
  a.trainer_id,
  a.name,
  a.email,
  a.status,
  a.requested_at,
  a.created_at,
  a.updated_at,
  a.metadata
from public.approvals a
where a.status = 'pending';

alter table public.approvals enable row level security;

drop policy if exists "approvals service role" on public.approvals;
create policy "approvals service role"
  on public.approvals
  for all
  using (true)
  with check (true)
  to service_role;

drop policy if exists "approvals self read" on public.approvals;
create policy "approvals self read"
  on public.approvals
  for select
  using (auth.uid() = user_id)
  to authenticated;

drop policy if exists "approvals self insert" on public.approvals;
create policy "approvals self insert"
  on public.approvals
  for insert
  with check (auth.uid() = user_id)
  to authenticated;
