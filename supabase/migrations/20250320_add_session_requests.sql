-- supabase/migrations/20250320_add_session_requests.sql
-- Cria tabela de pedidos de sessão entre clientes e personal trainers.

set check_function_bodies = off;

-- Create enum type if it does not exist. If it exists, skip creation.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'session_request_status' AND n.nspname = 'public') THEN
    CREATE TYPE public.session_request_status AS ENUM (
      'pending',
      'accepted',
      'declined',
      'cancelled',
      'reschedule_pending',
      'reschedule_declined'
    );
  END IF;
END;
$$;

-- If the enum type already exists but is missing labels, add them (no-op if present).
-- Note: ALTER TYPE ... ADD VALUE cannot add values before others; it appends.
DO $$
DECLARE
  missing text;
BEGIN
  -- helper to add a value if missing
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname='public' AND t.typname='session_request_status' AND e.enumlabel = 'pending') THEN
    ALTER TYPE public.session_request_status ADD VALUE 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname='public' AND t.typname='session_request_status' AND e.enumlabel = 'accepted') THEN
    ALTER TYPE public.session_request_status ADD VALUE 'accepted';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname='public' AND t.typname='session_request_status' AND e.enumlabel = 'declined') THEN
    ALTER TYPE public.session_request_status ADD VALUE 'declined';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname='public' AND t.typname='session_request_status' AND e.enumlabel = 'cancelled') THEN
    ALTER TYPE public.session_request_status ADD VALUE 'cancelled';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname='public' AND t.typname='session_request_status' AND e.enumlabel = 'reschedule_pending') THEN
    ALTER TYPE public.session_request_status ADD VALUE 'reschedule_pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname='public' AND t.typname='session_request_status' AND e.enumlabel = 'reschedule_declined') THEN
    ALTER TYPE public.session_request_status ADD VALUE 'reschedule_declined';
  END IF;
END;
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
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

-- Trigger function to update updated_at on modification
create or replace function public.session_requests_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Ensure there is no duplicate trigger, then create it
drop trigger if exists session_requests_set_updated_at on public.session_requests;
create trigger session_requests_set_updated_at
  before update on public.session_requests
  for each row
  execute function public.session_requests_touch_updated_at();
