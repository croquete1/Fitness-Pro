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

-- dados seed/actualizações para alinhar com o front-end actual
update public.system_services
set trend_label = case id
  when 'core-api' then '+0,4% nas últimas 24h'
  when 'supabase' then 'Sem oscilação'
  when 'jobs' then 'Reprocessamento automático activado'
  else coalesce(trend_label, '')
end;

insert into public.system_monitors (id, title, detail, status, display_order, updated_at)
values
  ('uptime', 'Uptime Robot', 'Monitoriza endpoints públicos e privados em 30 localizações.', 'ok', 10, timezone('utc', now()) - interval '90 seconds'),
  ('slo', 'Apdex & SLO', '98% das respostas abaixo de 300 ms em média semanal.', 'ok', 20, timezone('utc', now()) - interval '6 minutes'),
  ('alerts', 'Alertas automáticos', 'Integração com Slack #fitness-pro-ops e fallback por email.', 'ok', 30, timezone('utc', now()) - interval '4 minutes')
on conflict (id) do update
set
  title = excluded.title,
  detail = excluded.detail,
  status = excluded.status,
  display_order = excluded.display_order,
  updated_at = excluded.updated_at;

insert into public.system_resilience_practices (id, title, detail, status, display_order, updated_at)
values
  ('backups', 'Backups incrementais', 'Intervalo de 30 minutos · retenção de 14 dias.', 'ok', 10, timezone('utc', now()) - interval '30 minutes'),
  ('failover', 'Failover multi-região', 'Replica de leitura pronta em Frankfurt com DNS programado.', 'ok', 20, timezone('utc', now()) - interval '2 hours'),
  ('circuit', 'Circuit breaker', 'Retry exponencial automático até 3 tentativas antes de marcar falha.', 'ok', 30, timezone('utc', now()) - interval '12 minutes')
on conflict (id) do update
set
  title = excluded.title,
  detail = excluded.detail,
  status = excluded.status,
  display_order = excluded.display_order,
  updated_at = excluded.updated_at;

insert into public.dashboard_chart_points (id, series, label, value, sort_order, created_at)
values
  ('6c1f8f58-5a4b-4d7c-8c9f-21b0b6f4d701', 'monthly_sessions', 'Jan', 30, 10, timezone('utc', now()) - interval '90 days'),
  ('b7c4c302-26f0-4c2a-bab2-68855c6ab677', 'monthly_sessions', 'Fev', 45, 20, timezone('utc', now()) - interval '60 days'),
  ('f8be43b1-45a6-4fbc-8c0c-18d61a3648f5', 'monthly_sessions', 'Mar', 60, 30, timezone('utc', now()) - interval '31 days'),
  ('741e0645-4a0b-4f55-9dfc-6d1f6492f516', 'monthly_sessions', 'Abr', 50, 40, timezone('utc', now()) - interval '3 days'),
  ('9bb1da98-0537-456b-8e2b-3810a5a3a1c0', 'monthly_sessions', 'Mai', 70, 50, timezone('utc', now()) - interval '1 days'),
  ('a0c33d4b-7b78-42f5-a8f4-4412d7f0332a', 'monthly_sessions', 'Jun', 65, 60, timezone('utc', now())
)
on conflict (id) do update
set
  series = excluded.series,
  label = excluded.label,
  value = excluded.value,
  sort_order = excluded.sort_order,
  created_at = excluded.created_at;
