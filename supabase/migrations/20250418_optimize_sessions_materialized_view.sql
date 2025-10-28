-- supabase/migrations/20250418_optimize_sessions_materialized_view.sql
-- Otimiza consultas frequentes sobre sessões futuras com novos índices e uma vista materializada.

set check_function_bodies = off;

-- Índices para acelerar filtros por treinador/cliente e janelas temporais.
create index if not exists sessions_scheduled_at_idx on public.sessions (scheduled_at desc);
create index if not exists sessions_trainer_scheduled_idx on public.sessions (trainer_id, scheduled_at desc);
create index if not exists sessions_client_scheduled_idx on public.sessions (client_id, scheduled_at desc);

-- Vista materializada para agregados das próximas 7 dias por treinador.
create materialized view if not exists public.mv_sessions_next7_by_trainer
as
  with bounds as (
    select
      date_trunc('day', now()) as start_at,
      date_trunc('day', now()) + interval '7 day' as end_at
  )
  select
    s.trainer_id,
    (date_trunc('day', s.scheduled_at))::date as day_date,
    count(*)::bigint as total
  from public.sessions s
  cross join bounds b
  where s.trainer_id is not null
    and s.scheduled_at >= b.start_at
    and s.scheduled_at < b.end_at
  group by s.trainer_id, (date_trunc('day', s.scheduled_at))::date
with no data;

comment on materialized view public.mv_sessions_next7_by_trainer is 'Contagem de sessões por treinador para os próximos 7 dias (janela dinâmica).';
comment on column public.mv_sessions_next7_by_trainer.trainer_id is 'Identificador do treinador responsável pela sessão.';
comment on column public.mv_sessions_next7_by_trainer.day_date is 'Dia (UTC) agregado da sessão agendada.';
comment on column public.mv_sessions_next7_by_trainer.total is 'Número total de sessões no dia para o treinador.';

refresh materialized view public.mv_sessions_next7_by_trainer;

create unique index if not exists mv_sessions_next7_by_trainer_pk
  on public.mv_sessions_next7_by_trainer (trainer_id, day_date);

-- Função utilitária para atualizações concorrentes.
create or replace function public.refresh_mv_sessions_next7_by_trainer()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  refresh materialized view concurrently public.mv_sessions_next7_by_trainer;
end;
$$;

grant execute on function public.refresh_mv_sessions_next7_by_trainer() to authenticated, service_role;

-- Função para obter o ranking agregado dos próximos 7 dias diretamente da vista materializada.
create or replace function public.get_mv_sessions_next7_totals(limit_count integer default 5)
returns table (
  trainer_id uuid,
  trainer_name text,
  total bigint
)
language sql
security definer
set search_path = public
as $$
  select
    u.id as trainer_id,
    coalesce(
      nullif(trim(u.name), ''),
      nullif(trim(u.email), ''),
      u.id::text
    ) as trainer_name,
    sum(m.total)::bigint as total
  from public.mv_sessions_next7_by_trainer m
  join public.users u on u.id = m.trainer_id
  group by u.id, coalesce(nullif(trim(u.name), ''), nullif(trim(u.email), ''), u.id::text)
  order by total desc, trainer_name asc
  limit greatest(1, coalesce(limit_count, 5));
$$;

comment on function public.get_mv_sessions_next7_totals(integer) is 'Devolve o ranking agregado de sessões por treinador na janela dinâmica de 7 dias.';

grant execute on function public.get_mv_sessions_next7_totals(integer) to authenticated, service_role;
grant select on table public.mv_sessions_next7_by_trainer to authenticated, service_role;
