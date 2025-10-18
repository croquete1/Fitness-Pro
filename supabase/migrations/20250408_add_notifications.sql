-- supabase/migrations/20250408_add_notifications.sql
-- Estrutura a camada de notificações para suportar o painel admin no tema Neo e dados reais.

set check_function_bodies = off;

create extension if not exists "pgcrypto";

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  title text not null default '',
  body text not null default '',
  type text not null default 'info',
  read boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.notifications
  add constraint notifications_user_fk
    foreign key (user_id) references public.profiles (id)
    on delete set null;

comment on table public.notifications is 'Notificações transaccionais/campanhas entregues via painel admin.';
comment on column public.notifications.metadata is 'Envelope JSONB para parâmetros adicionais (segmentação, CTA, etc.).';

create index if not exists notifications_created_at_idx on public.notifications (created_at desc, id);
create index if not exists notifications_type_idx on public.notifications (type);
create index if not exists notifications_read_idx on public.notifications (read);
create index if not exists notifications_user_idx on public.notifications (user_id);

create or replace function public.notifications_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists notifications_set_updated_at on public.notifications;
create trigger notifications_set_updated_at
  before update on public.notifications
  for each row
  execute function public.notifications_touch_updated_at();

alter table public.notifications enable row level security;

drop policy if exists "notifications service" on public.notifications;
create policy "notifications service"
  on public.notifications
  for all
  using (true)
  with check (true)
  to service_role;

drop policy if exists "notifications self read" on public.notifications;
create policy "notifications self read"
  on public.notifications
  for select
  using (auth.uid() = user_id)
  to authenticated;

drop policy if exists "notifications self update" on public.notifications;
create policy "notifications self update"
  on public.notifications
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id)
  to authenticated;
