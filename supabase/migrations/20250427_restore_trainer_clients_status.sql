-- supabase/migrations/20250427_restore_trainer_clients_status.sql
-- Restaura a coluna status em trainer_clients para compatibilidade com políticas e queries do dashboard.

set check_function_bodies = off;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'trainer_clients'
      AND column_name = 'status'
  ) THEN
    ALTER TABLE public.trainer_clients
      ADD COLUMN status text;
  END IF;
END;
$$;

-- Garante que há sempre um estado definido e consistente.
UPDATE public.trainer_clients
SET status = COALESCE(NULLIF(status, ''), 'ACTIVE')
WHERE status IS DISTINCT FROM COALESCE(NULLIF(status, ''), 'ACTIVE');

ALTER TABLE public.trainer_clients
  ALTER COLUMN status SET DEFAULT 'ACTIVE';

-- Evita nulos futuros mas só depois de preencher valores existentes.
ALTER TABLE public.trainer_clients
  ALTER COLUMN status SET NOT NULL;

-- Índice auxiliar para filtros por estado caso venham a ser usados novamente.
CREATE INDEX IF NOT EXISTS trainer_clients_status_idx ON public.trainer_clients (status);
