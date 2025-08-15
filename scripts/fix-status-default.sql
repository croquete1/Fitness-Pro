-- scripts/fix-status-default.sql

-- 1) Ver o default atual (debug)
-- SELECT column_default
-- FROM information_schema.columns
-- WHERE table_schema='public' AND table_name='users' AND column_name='status';

-- 2) Corrigir o DEFAULT para usar o enum correto "UserStatus"
ALTER TABLE public.users
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status SET DEFAULT 'PENDING'::"UserStatus";

-- 3) (Opcional) Se algum valor estiver de tipo antigo, re-castar:
-- ALTER TABLE public.users
--   ALTER COLUMN status TYPE "UserStatus"
--   USING (status::text)::"UserStatus";

-- 4) Verificação (opcional)
-- SELECT column_default
-- FROM information_schema.columns
-- WHERE table_schema='public' AND table_name='users' AND column_name='status';
