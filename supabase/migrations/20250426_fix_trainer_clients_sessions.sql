-- supabase/migrations/20250426_fix_trainer_clients_sessions.sql
-- Corrige nomenclaturas camelCase herdadas e garante as foreign keys
-- necessárias para os joins usados no dashboard do personal trainer.

set check_function_bodies = off;

-- Normaliza colunas da tabela trainer_clients
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'trainer_clients'
      AND column_name = 'clientId'
  ) THEN
    EXECUTE 'alter table public.trainer_clients rename column "clientId" to client_id';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'trainer_clients'
      AND column_name = 'trainerId'
  ) THEN
    EXECUTE 'alter table public.trainer_clients rename column "trainerId" to trainer_id';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'trainer_clients'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'alter table public.trainer_clients rename column "createdAt" to created_at';
  END IF;
END;
$$;

-- Normaliza colunas da tabela sessions
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'sessions'
      AND column_name = 'clientId'
  ) THEN
    EXECUTE 'alter table public.sessions rename column "clientId" to client_id';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'sessions'
      AND column_name = 'trainerId'
  ) THEN
    EXECUTE 'alter table public.sessions rename column "trainerId" to trainer_id';
  END IF;
END;
$$;

-- Remove constraints desactualizadas nas tabelas afectadas
alter table if exists public.trainer_clients drop constraint if exists "trainer_clients_clientId_fkey";
alter table if exists public.trainer_clients drop constraint if exists "trainer_clients_trainerId_fkey";
alter table if exists public.trainer_clients drop constraint if exists trainer_clients_client_id_fkey;
alter table if exists public.trainer_clients drop constraint if exists trainer_clients_trainer_id_fkey;
alter table if exists public.sessions drop constraint if exists "sessions_clientId_fkey";
alter table if exists public.sessions drop constraint if exists "sessions_trainerId_fkey";
alter table if exists public.sessions drop constraint if exists sessions_client_id_fkey;
alter table if exists public.sessions drop constraint if exists sessions_trainer_id_fkey;

-- Recria foreign keys com naming consistente e alinhado com o código
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'trainer_clients'
      AND column_name = 'trainer_id'
  ) THEN
    ALTER TABLE public.trainer_clients
      ADD CONSTRAINT trainer_clients_trainer_id_fkey
      FOREIGN KEY (trainer_id)
      REFERENCES public.users (id)
      ON DELETE CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'trainer_clients'
      AND column_name = 'client_id'
  ) THEN
    ALTER TABLE public.trainer_clients
      ADD CONSTRAINT trainer_clients_client_id_fkey
      FOREIGN KEY (client_id)
      REFERENCES public.profiles (id)
      ON DELETE CASCADE;
  END IF;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'sessions'
      AND column_name = 'trainer_id'
  ) THEN
    ALTER TABLE public.sessions
      ADD CONSTRAINT sessions_trainer_id_fkey
      FOREIGN KEY (trainer_id)
      REFERENCES public.users (id)
      ON DELETE SET NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'sessions'
      AND column_name = 'client_id'
  ) THEN
    ALTER TABLE public.sessions
      ADD CONSTRAINT sessions_client_id_fkey
      FOREIGN KEY (client_id)
      REFERENCES public.users (id)
      ON DELETE SET NULL;
  END IF;
END;
$$;

-- Índices defensivos para acelerar consultas por trainer e cliente
create index if not exists trainer_clients_trainer_idx on public.trainer_clients (trainer_id);
create index if not exists trainer_clients_client_idx on public.trainer_clients (client_id);

