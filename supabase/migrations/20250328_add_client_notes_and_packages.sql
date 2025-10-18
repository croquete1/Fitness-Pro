-- supabase/migrations/20250328_add_client_notes_and_packages.sql
-- Cria tabelas para notas de clientes e pacotes de sessões geridos via app.
set check_function_bodies = off;

create extension if not exists "pgcrypto";

create table if not exists public.client_packages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  package_id uuid,
  name text,
  status text,
  started_at timestamptz,
  ends_at timestamptz,
  sessions_total integer,
  sessions_used integer,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.client_packages is 'Pacotes de treinos/compras associados a clientes individuais.';
comment on column public.client_packages.package_id is 'Identificador externo (ex.: ERP/billing) quando existente.';
comment on column public.client_packages.status is 'Estado lógico do pacote (ACTIVE, PAUSED, CANCELLED, UPCOMING, ENDED, etc).';
comment on column public.client_packages.sessions_total is 'Total de sessões incluídas no pacote.';
comment on column public.client_packages.sessions_used is 'Sessões já consumidas pelo cliente.';

create index if not exists client_packages_user_idx on public.client_packages (user_id);
create index if not exists client_packages_status_idx on public.client_packages (status);
create index if not exists client_packages_period_idx on public.client_packages (coalesce(started_at, created_at) desc);

create or replace function public.client_packages_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists client_packages_set_updated_at on public.client_packages;
create trigger client_packages_set_updated_at
  before update on public.client_packages
  for each row
  execute function public.client_packages_touch_updated_at();

alter table public.client_packages enable row level security;

drop policy if exists "client_packages service" on public.client_packages;
create policy "client_packages service"
  on public.client_packages
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create table if not exists public.client_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.users(id) on delete cascade,
  author_id uuid references public.users(id) on delete set null,
  author_name text,
  author_role text,
  text text not null,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.client_notes is 'Notas manuais deixadas por PTs/Admins sobre um cliente.';
comment on column public.client_notes.author_role is 'Função do autor no momento da criação (ADMIN, PT, etc).';

create index if not exists client_notes_client_idx on public.client_notes (client_id, created_at desc);
create index if not exists client_notes_author_idx on public.client_notes (author_id, created_at desc);

alter table public.client_notes enable row level security;

drop policy if exists "client_notes service" on public.client_notes;
create policy "client_notes service"
  on public.client_notes
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
