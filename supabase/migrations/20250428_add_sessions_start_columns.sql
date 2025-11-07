-- supabase/migrations/20250428_add_sessions_start_columns.sql
-- Garante que a tabela sessions expõe colunas start_* usadas pelo dashboard PT.

set check_function_bodies = off;

alter table public.sessions
  add column if not exists start_time timestamptz,
  add column if not exists end_time timestamptz,
  add column if not exists start_at timestamptz,
  add column if not exists end_at timestamptz;

update public.sessions
set
  start_time = coalesce(start_time, scheduled_at),
  start_at = coalesce(start_at, scheduled_at)
where scheduled_at is not null
  and (start_time is null or start_at is null);

create index if not exists sessions_start_time_idx on public.sessions (start_time desc);
create index if not exists sessions_start_at_idx on public.sessions (start_at desc);
create index if not exists sessions_end_time_idx on public.sessions (end_time desc);
create index if not exists sessions_end_at_idx on public.sessions (end_at desc);
