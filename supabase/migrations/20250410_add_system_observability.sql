-- supabase/migrations/20250410_add_system_observability.sql
-- Tabelas de observabilidade para alimentar o centro de controlo com dados persistidos.

set check_function_bodies = off;

create extension if not exists "pgcrypto";

create table if not exists public.system_services (
  id text primary key,
  name text not null,
  description text not null default '',
  state text not null default 'ok',
  latency_ms integer,
  uptime_percent numeric(6,3),
  updated_at timestamptz not null default timezone('utc', now()),
  display_order integer not null default 100
);

comment on table public.system_services is 'Estado operacional das principais integrações/serviços do Fitness Pro.';
comment on column public.system_services.state is 'ok | warn | down conforme severidade.';
comment on column public.system_services.latency_ms is 'Latência média arredondada dos últimos 5 minutos (ms).';
comment on column public.system_services.uptime_percent is 'Percentagem de uptime nos últimos 30 dias.';

create or replace function public.system_services_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists system_services_set_updated_at on public.system_services;
create trigger system_services_set_updated_at
  before update on public.system_services
  for each row
  execute function public.system_services_touch_updated_at();

create index if not exists system_services_display_order_idx on public.system_services (display_order, name);
create index if not exists system_services_state_idx on public.system_services (state);

create table if not exists public.system_maintenance_windows (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  impact text not null default 'Sem impacto previsto',
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.system_maintenance_windows is 'Planeamento de janelas de manutenção preventiva/corretiva.';
comment on column public.system_maintenance_windows.start_at is 'Início da janela em UTC.';
comment on column public.system_maintenance_windows.end_at is 'Fim previsto em UTC.';

create index if not exists system_maintenance_windows_start_idx on public.system_maintenance_windows (start_at desc);
create index if not exists system_maintenance_windows_end_idx on public.system_maintenance_windows (end_at desc);

create table if not exists public.system_insights (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value text not null,
  detail text not null default '',
  sort_order integer not null default 100,
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.system_insights is 'Insights de alto nível usados no painel operacional.';
comment on column public.system_insights.value is 'Valor principal apresentado (texto curto).';
comment on column public.system_insights.detail is 'Contexto adicional apresentado por baixo do valor.';

create or replace function public.system_insights_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists system_insights_set_updated_at on public.system_insights;
create trigger system_insights_set_updated_at
  before update on public.system_insights
  for each row
  execute function public.system_insights_touch_updated_at();

create index if not exists system_insights_sort_idx on public.system_insights (sort_order, updated_at desc);

alter table public.system_services enable row level security;
alter table public.system_maintenance_windows enable row level security;
alter table public.system_insights enable row level security;

-- Políticas de acesso: admins autenticados lêem dados, service_role tem acesso total para integração.

drop policy if exists "system services service" on public.system_services;
create policy "system services service"
  on public.system_services
  for all
  using (true)
  with check (true)
  to service_role;

drop policy if exists "system services read" on public.system_services;
create policy "system services read"
  on public.system_services
  for select
  using (true)
  to authenticated;

drop policy if exists "system maintenance service" on public.system_maintenance_windows;
create policy "system maintenance service"
  on public.system_maintenance_windows
  for all
  using (true)
  with check (true)
  to service_role;

drop policy if exists "system maintenance read" on public.system_maintenance_windows;
create policy "system maintenance read"
  on public.system_maintenance_windows
  for select
  using (true)
  to authenticated;

drop policy if exists "system insights service" on public.system_insights;
create policy "system insights service"
  on public.system_insights
  for all
  using (true)
  with check (true)
  to service_role;

drop policy if exists "system insights read" on public.system_insights;
create policy "system insights read"
  on public.system_insights
  for select
  using (true)
  to authenticated;

-- Dados seed para alinhar com os cartões actuais do centro de controlo.

insert into public.system_services (id, name, description, state, latency_ms, uptime_percent, updated_at, display_order)
values
  ('core-api', 'API Core', 'Autenticação, planos e sincronização em tempo real.', 'ok', 42, 99.980, timezone('utc', now()) - interval '32 seconds', 10),
  ('supabase', 'Supabase', 'Base de dados e RPC utilizados pela experiência web.', 'ok', 58, 99.950, timezone('utc', now()) - interval '55 seconds', 20),
  ('jobs', 'Fila de jobs', 'Envio de emails, notificações push e geração de relatórios.', 'warn', 1200, 99.400, timezone('utc', now()) - interval '4 minutes', 30)
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description,
  state = excluded.state,
  latency_ms = excluded.latency_ms,
  uptime_percent = excluded.uptime_percent,
  updated_at = excluded.updated_at,
  display_order = excluded.display_order;

insert into public.system_maintenance_windows (id, title, start_at, end_at, impact)
values
  ('6c21f6d6-7f8c-4b56-a38d-3a0840e59af2', 'Atualização da API', timezone('utc', now()) + interval '2 days 2 hours', timezone('utc', now()) + interval '2 days 2 hours 15 minutes', 'Intermitência de autenticação'),
  ('e92df7a4-2d88-4c2f-b4f1-e0e3a7d7f6e9', 'Rotina semanal de backups', timezone('utc', now()) + interval '4 days 3 hours 30 minutes', timezone('utc', now()) + interval '4 days 3 hours 45 minutes', 'Sem impacto previsto')
on conflict (id) do update
set
  title = excluded.title,
  start_at = excluded.start_at,
  end_at = excluded.end_at,
  impact = excluded.impact;

insert into public.system_insights (id, label, value, detail, sort_order, updated_at)
values
  ('a0b4f5f4-0b98-4c6f-b63b-7e2b0cc4ff91', 'Último deploy', 'v2.14.0', 'Atualização mobile concluída', 10, timezone('utc', now()) - interval '2 hours'),
  ('6f6d8d04-8218-4a32-921f-8cbd3b7c65a0', 'Erros captados (1h)', '3', 'Todos mitigados pelo circuito de retry', 20, timezone('utc', now()) - interval '12 minutes'),
  ('c2fbbf6a-6c98-43a7-8719-8f8991ef2e21', 'Sincronizações calendarizadas', '12', 'Próxima execução em 6 minutos', 30, timezone('utc', now()) - interval '6 minutes')
on conflict (id) do update
set
  label = excluded.label,
  value = excluded.value,
  detail = excluded.detail,
  sort_order = excluded.sort_order,
  updated_at = excluded.updated_at;
