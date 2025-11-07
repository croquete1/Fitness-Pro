-- supabase/migrations/20250429_add_sessions_duration_minutes.sql
-- Garante que a tabela sessions disponibiliza duration_minutes com dados consistentes.

set check_function_bodies = off;

alter table public.sessions
  add column if not exists duration_minutes integer;

update public.sessions
set duration_minutes = duration_min
where duration_minutes is distinct from duration_min
  and duration_min is not null;

create index if not exists sessions_duration_minutes_idx on public.sessions (duration_minutes);
