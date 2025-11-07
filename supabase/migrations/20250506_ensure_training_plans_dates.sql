-- Garante que as colunas start_date e end_date existem na tabela training_plans.
-- Atualiza automaticamente a partir de colunas antigas caso existam.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'training_plans' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE public.training_plans
      ADD COLUMN start_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'training_plans' AND column_name = 'end_date'
  ) THEN
    ALTER TABLE public.training_plans
      ADD COLUMN end_date timestamptz;
  END IF;

  PERFORM 1 FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'training_plans' AND column_name = 'start_at';
  IF FOUND THEN
    EXECUTE $$
      UPDATE public.training_plans
         SET start_date = COALESCE(start_date, start_at::timestamptz)
       WHERE start_date IS NULL
         AND start_at IS NOT NULL;
    $$;
  END IF;

  PERFORM 1 FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'training_plans' AND column_name = 'starts_at';
  IF FOUND THEN
    EXECUTE $$
      UPDATE public.training_plans
         SET start_date = COALESCE(start_date, starts_at::timestamptz)
       WHERE start_date IS NULL
         AND starts_at IS NOT NULL;
    $$;
  END IF;

  PERFORM 1 FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'training_plans' AND column_name = 'start_on';
  IF FOUND THEN
    EXECUTE $$
      UPDATE public.training_plans
         SET start_date = COALESCE(start_date, start_on::timestamptz)
       WHERE start_date IS NULL
         AND start_on IS NOT NULL;
    $$;
  END IF;

  PERFORM 1 FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'training_plans' AND column_name = 'starts_on';
  IF FOUND THEN
    EXECUTE $$
      UPDATE public.training_plans
         SET start_date = COALESCE(start_date, starts_on::timestamptz)
       WHERE start_date IS NULL
         AND starts_on IS NOT NULL;
    $$;
  END IF;

  PERFORM 1 FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'training_plans' AND column_name = 'end_at';
  IF FOUND THEN
    EXECUTE $$
      UPDATE public.training_plans
         SET end_date = COALESCE(end_date, end_at::timestamptz)
       WHERE end_date IS NULL
         AND end_at IS NOT NULL;
    $$;
  END IF;

  PERFORM 1 FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'training_plans' AND column_name = 'ends_at';
  IF FOUND THEN
    EXECUTE $$
      UPDATE public.training_plans
         SET end_date = COALESCE(end_date, ends_at::timestamptz)
       WHERE end_date IS NULL
         AND ends_at IS NOT NULL;
    $$;
  END IF;

  PERFORM 1 FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'training_plans' AND column_name = 'end_on';
  IF FOUND THEN
    EXECUTE $$
      UPDATE public.training_plans
         SET end_date = COALESCE(end_date, end_on::timestamptz)
       WHERE end_date IS NULL
         AND end_on IS NOT NULL;
    $$;
  END IF;

  PERFORM 1 FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'training_plans' AND column_name = 'ends_on';
  IF FOUND THEN
    EXECUTE $$
      UPDATE public.training_plans
         SET end_date = COALESCE(end_date, ends_on::timestamptz)
       WHERE end_date IS NULL
         AND ends_on IS NOT NULL;
    $$;
  END IF;
END;
$$;
