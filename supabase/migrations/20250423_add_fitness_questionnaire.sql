-- supabase/migrations/20250423_add_fitness_questionnaire.sql
-- Estrutura inicial para armazenar respostas do questionário físico e notas associadas.

set check_function_bodies = off;

create extension if not exists "pgcrypto";

create table if not exists public.fitness_questionnaire (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  wellbeing_0_to_5 smallint check (wellbeing_0_to_5 between 0 and 5),
  objective text,
  job text,
  active boolean not null default false,
  sport text,
  sport_time text,
  pathologies text,
  schedule jsonb not null default jsonb_build_object(
    'days', jsonb_build_object(
      'monday', false,
      'tuesday', false,
      'wednesday', false,
      'thursday', false,
      'friday', false,
      'saturday', false,
      'sunday', false
    ),
    'notes', null
  ),
  metrics jsonb not null default jsonb_build_object(
    'body', jsonb_build_object(),
    'perimeters', jsonb_build_object(),
    'notes', null,
    'observations', null,
    'anamnesis', jsonb_build_object()
  ),
  status text not null default 'draft' check (status in ('draft','submitted')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint fitness_questionnaire_user_unique unique (user_id)
);

comment on table public.fitness_questionnaire is 'Respostas de avaliação física submetidas por clientes.';
comment on column public.fitness_questionnaire.schedule is 'Preferências de dias/horários armazenadas em JSON.';
comment on column public.fitness_questionnaire.metrics is 'Medições corporais, perímetros e anamnese em envelope JSON.';

create index if not exists fitness_questionnaire_user_idx on public.fitness_questionnaire (user_id);
create index if not exists fitness_questionnaire_status_idx on public.fitness_questionnaire (status);

create table if not exists public.fitness_questionnaire_notes (
  id uuid primary key default gen_random_uuid(),
  questionnaire_id uuid not null references public.fitness_questionnaire(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  visibility text not null default 'private' check (visibility in ('private','shared')),
  body text not null,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.fitness_questionnaire_notes is 'Notas internas ligadas ao questionário físico.';
comment on column public.fitness_questionnaire_notes.visibility is 'Controla se a nota é partilhada com PTs/Admin ou privada ao autor.';

create index if not exists fitness_questionnaire_notes_questionnaire_idx on public.fitness_questionnaire_notes (questionnaire_id);
create index if not exists fitness_questionnaire_notes_author_idx on public.fitness_questionnaire_notes (author_id);

create or replace function public.fitness_questionnaire_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists fitness_questionnaire_set_updated_at on public.fitness_questionnaire;
create trigger fitness_questionnaire_set_updated_at
  before update on public.fitness_questionnaire
  for each row
  execute function public.fitness_questionnaire_touch_updated_at();

alter table public.fitness_questionnaire enable row level security;
alter table public.fitness_questionnaire_notes enable row level security;

drop policy if exists fitness_questionnaire_owner on public.fitness_questionnaire;
create policy fitness_questionnaire_owner
  on public.fitness_questionnaire
  for select
  to authenticated
  using (public.is_admin(auth.uid()) or public.is_trainer(auth.uid()) or user_id = auth.uid());

drop policy if exists fitness_questionnaire_insert_owner on public.fitness_questionnaire;
create policy fitness_questionnaire_insert_owner
  on public.fitness_questionnaire
  for insert
  to authenticated
  with check (public.is_admin(auth.uid()) or public.is_trainer(auth.uid()) or user_id = auth.uid());

drop policy if exists fitness_questionnaire_update_owner on public.fitness_questionnaire;
create policy fitness_questionnaire_update_owner
  on public.fitness_questionnaire
  for update
  to authenticated
  using (public.is_admin(auth.uid()) or public.is_trainer(auth.uid()) or user_id = auth.uid())
  with check (public.is_admin(auth.uid()) or public.is_trainer(auth.uid()) or user_id = auth.uid());

drop policy if exists fitness_questionnaire_notes_select on public.fitness_questionnaire_notes;
create policy fitness_questionnaire_notes_select
  on public.fitness_questionnaire_notes
  for select
  to authenticated
  using (
    public.is_admin(auth.uid())
    or public.is_trainer(auth.uid())
    or author_id = auth.uid()
    or exists (
      select 1
      from public.fitness_questionnaire fq
      where fq.id = fitness_questionnaire_notes.questionnaire_id
        and fq.user_id = auth.uid()
    )
  );

drop policy if exists fitness_questionnaire_notes_insert on public.fitness_questionnaire_notes;
create policy fitness_questionnaire_notes_insert
  on public.fitness_questionnaire_notes
  for insert
  to authenticated
  with check (public.is_admin(auth.uid()) or public.is_trainer(auth.uid()) or author_id = auth.uid());

drop policy if exists fitness_questionnaire_notes_update on public.fitness_questionnaire_notes;
create policy fitness_questionnaire_notes_update
  on public.fitness_questionnaire_notes
  for update
  to authenticated
  using (public.is_admin(auth.uid()) or public.is_trainer(auth.uid()) or author_id = auth.uid())
  with check (public.is_admin(auth.uid()) or public.is_trainer(auth.uid()) or author_id = auth.uid());

drop policy if exists fitness_questionnaire_notes_delete on public.fitness_questionnaire_notes;
create policy fitness_questionnaire_notes_delete
  on public.fitness_questionnaire_notes
  for delete
  to authenticated
  using (public.is_admin(auth.uid()) or author_id = auth.uid());
