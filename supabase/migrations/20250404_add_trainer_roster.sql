-- supabase/migrations/20250404_add_trainer_roster.sql
-- Estrutura a base de dados para suportar a gestão de escala de treinadores no painel admin.

set check_function_bodies = off;

create extension if not exists "pgcrypto";

create table if not exists public.trainer_roster_assignments (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null,
  trainer_focus text,
  status text not null default 'active' check (status in ('active','onboarding','paused')),
  shift text not null default 'manhã' check (shift in ('manhã','tarde','noite')),
  clients_count integer not null default 0 check (clients_count >= 0),
  highlighted_client_id uuid,
  next_check_in_at timestamptz,
  load_level text,
  tags text[] not null default '{}'::text[],
  last_synced_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.trainer_roster_assignments
  add constraint trainer_roster_assignments_trainer_fk
    foreign key (trainer_id) references public.profiles (id)
    on delete cascade;

alter table public.trainer_roster_assignments
  add constraint trainer_roster_assignments_highlighted_fk
    foreign key (highlighted_client_id) references public.profiles (id)
    on delete set null;

comment on table public.trainer_roster_assignments is 'Distribuição actual de clientes por treinador com indicadores operacionais.';
comment on column public.trainer_roster_assignments.trainer_focus is 'Área de especialidade apresentada no painel.';
comment on column public.trainer_roster_assignments.load_level is 'Carga subjectiva (Alta, Moderada, Revisão, etc.).';
comment on column public.trainer_roster_assignments.tags is 'Etiquetas adicionais (ex.: Premium, Corporate).';
comment on column public.trainer_roster_assignments.metadata is 'Envelope para integrações futuras (JSONB).';

create table if not exists public.trainer_roster_events (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references public.trainer_roster_assignments(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete set null,
  title text not null,
  detail text,
  scheduled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.trainer_roster_events is 'Próximos marcos relevantes para cada treinador/escala.';
comment on column public.trainer_roster_events.detail is 'Descrição auxiliar apresentada na timeline.';

create index if not exists trainer_roster_assignments_trainer_idx on public.trainer_roster_assignments (trainer_id);
create index if not exists trainer_roster_assignments_status_idx on public.trainer_roster_assignments (status);
create index if not exists trainer_roster_assignments_shift_idx on public.trainer_roster_assignments (shift);
create index if not exists trainer_roster_assignments_last_synced_idx on public.trainer_roster_assignments (last_synced_at desc);
create index if not exists trainer_roster_events_assignment_idx on public.trainer_roster_events (assignment_id);
create index if not exists trainer_roster_events_scheduled_idx on public.trainer_roster_events (scheduled_at);

create or replace function public.trainer_roster_assignments_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trainer_roster_assignments_set_updated_at on public.trainer_roster_assignments;
create trigger trainer_roster_assignments_set_updated_at
  before update on public.trainer_roster_assignments
  for each row
  execute function public.trainer_roster_assignments_touch_updated_at();

create or replace function public.trainer_roster_events_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trainer_roster_events_set_updated_at on public.trainer_roster_events;
create trigger trainer_roster_events_set_updated_at
  before update on public.trainer_roster_events
  for each row
  execute function public.trainer_roster_events_touch_updated_at();

create or replace view public.admin_trainer_roster as
select
  a.id,
  a.trainer_id,
  coalesce(tp.full_name, tp.name, tp.email) as trainer_name,
  tp.email as trainer_email,
  tp.role as trainer_role,
  a.trainer_focus,
  a.status,
  a.shift,
  a.clients_count,
  a.highlighted_client_id,
  coalesce(cp.full_name, cp.name, cp.email) as highlighted_client_name,
  cp.email as highlighted_client_email,
  a.next_check_in_at,
  a.load_level,
  a.tags,
  array_to_string(a.tags, ' ') as tags_text,
  a.last_synced_at,
  a.metadata,
  a.created_at,
  a.updated_at
from public.trainer_roster_assignments a
left join public.profiles tp on tp.id = a.trainer_id
left join public.profiles cp on cp.id = a.highlighted_client_id;

comment on view public.admin_trainer_roster is 'Vista pronta para o dashboard admin, enriquecendo nomes/emails.';

create or replace view public.admin_trainer_roster_events as
select
  e.id,
  e.assignment_id,
  e.owner_id,
  coalesce(op.full_name, op.name, op.email) as owner_name,
  e.title,
  e.detail,
  e.scheduled_at,
  e.metadata,
  e.created_at,
  e.updated_at
from public.trainer_roster_events e
left join public.profiles op on op.id = e.owner_id;

comment on view public.admin_trainer_roster_events is 'Eventos chave ligados às escalas de treinadores.';

alter table public.trainer_roster_assignments enable row level security;
alter table public.trainer_roster_events enable row level security;

drop policy if exists "trainer_roster_assignments service" on public.trainer_roster_assignments;
create policy "trainer_roster_assignments service"
  on public.trainer_roster_assignments
  for all
  using (true)
  with check (true)
  to service_role;

drop policy if exists "trainer_roster_events service" on public.trainer_roster_events;
create policy "trainer_roster_events service"
  on public.trainer_roster_events
  for all
  using (true)
  with check (true)
  to service_role;

