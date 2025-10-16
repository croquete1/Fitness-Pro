-- supabase/migrations/20250320_add_session_requests.sql
-- Cria tabela de pedidos de sessão entre clientes e personal trainers.

set check_function_bodies = off;

-- Create enum type if it doesn't exist (portable across Postgres versions)
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'session_request_status' and n.nspname = 'public'
  ) then
    create type public.session_request_status as enum (
      'pending',
      'accepted',
      'declined',
      'cancelled',
      'reschedule_pending',
      'reschedule_declined'
    );
  end if;
end
$$;

create table if not exists public.session_requests (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(id) on delete set null,
  trainer_id uuid not null references public.users(id) on delete cascade,
  client_id uuid not null references public.users(id) on delete cascade,
  requested_start timestamptz not null,
  requested_end timestamptz not null,
  proposed_start timestamptz,
  proposed_end timestamptz,
  status public.session_request_status not null default 'pending',
  message text,
  trainer_note text,
  reschedule_note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  responded_at timestamptz,
  proposed_at timestamptz,
  proposed_by uuid references public.users(id) on delete set null,
  responded_by uuid references public.users(id) on delete set null
);

comment on table public.session_requests is 'Pedidos de agendamento de sessões entre clientes e personal trainers.';
comment on column public.session_requests.status is 'Estado do pedido (pendente, aceite, recusado, cancelado ou remarcação em curso).';
comment on column public.session_requests.requested_start is 'Hora inicial proposta pelo cliente.';
comment on column public.session_requests.requested_end is 'Hora final proposta pelo cliente.';
comment on column public.session_requests.proposed_start is 'Nova hora inicial sugerida pelo PT durante uma remarcação.';
comment on column public.session_requests.proposed_end is 'Nova hora final sugerida pelo PT durante uma remarcação.';

create index if not exists session_requests_trainer_status_idx on public.session_requests (trainer_id, status);
create index if not exists session_requests_client_status_idx on public.session_requests (client_id, status);
create index if not exists session_requests_session_idx on public.session_requests (session_id);
create index if not exists session_requests_requested_interval_idx on public.session_requests (requested_start, requested_end);

create or replace function public.session_requests_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists session_requests_set_updated_at on public.session_requests;
create trigger session_requests_set_updated_at
  before update
  on public.session_requests
  for each row
  execute function public.session_requests_touch_updated_at();
  -- If your Postgres version errors on "execute function", replace the last line with:
  -- execute procedure public.session_requests_touch_updated_at();