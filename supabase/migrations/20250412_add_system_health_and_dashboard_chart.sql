-- supabase/migrations/20250412_add_system_health_and_dashboard_chart.sql
-- Amplia as tabelas de observabilidade com monitores/resiliência e cria métricas reais para o gráfico do dashboard.

set check_function_bodies = off;

alter table if exists public.system_services
  add column if not exists trend_label text not null default '';

create table if not exists public.system_monitors (
  id text primary key,
  title text not null,
  detail text not null default '',
  status text not null default 'ok',
  display_order integer not null default 100,
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.system_monitors is 'Fontes de monitorização externas/internas usadas no centro de controlo.';
comment on column public.system_monitors.status is 'ok | warn | down consoante severidade actual.';

create index if not exists system_monitors_display_idx on public.system_monitors (display_order, id);
create index if not exists system_monitors_status_idx on public.system_monitors (status);

create table if not exists public.system_resilience_practices (
  id text primary key,
  title text not null,
  detail text not null default '',
  status text not null default 'ok',
  display_order integer not null default 100,
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.system_resilience_practices is 'Medidas de resiliência adoptadas (backups, failover, circuit breaker, ...).';
comment on column public.system_resilience_practices.status is 'ok | warn | down consoante o estado actual.';

create index if not exists system_resilience_display_idx on public.system_resilience_practices (display_order, id);
create index if not exists system_resilience_status_idx on public.system_resilience_practices (status);

create table if not exists public.dashboard_chart_points (
  id uuid primary key default gen_random_uuid(),
  series text not null,
  label text not null,
  value numeric(12,2) not null,
  sort_order integer not null default 100,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.dashboard_chart_points is 'Pontos de séries temporais usados nos gráficos do dashboard.';
comment on column public.dashboard_chart_points.series is 'Identificador lógico da série (ex: monthly_sessions).';

create index if not exists dashboard_chart_points_series_idx
  on public.dashboard_chart_points (series, sort_order, created_at desc);

alter table public.system_monitors enable row level security;
alter table public.system_resilience_practices enable row level security;
alter table public.dashboard_chart_points enable row level security;

-- políticas consistentes com o restante centro de controlo
create policy if not exists "system monitors service"
  on public.system_monitors
  for all
  using (true)
  with check (true)
  to service_role;

create policy if not exists "system monitors read"
  on public.system_monitors
  for select
  using (true)
  to authenticated;

create policy if not exists "system resilience service"
  on public.system_resilience_practices
  for all
  using (true)
  with check (true)
  to service_role;

create policy if not exists "system resilience read"
  on public.system_resilience_practices
  for select
  using (true)
  to authenticated;

create policy if not exists "dashboard chart points service"
  on public.dashboard_chart_points
  for all
  using (true)
  with check (true)
  to service_role;

create policy if not exists "dashboard chart points read"
  on public.dashboard_chart_points
  for select
  using (true)
  to authenticated;

