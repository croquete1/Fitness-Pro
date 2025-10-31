-- supabase/migrations/20250417_add_notification_href.sql
-- Adiciona coluna href à tabela de notificações e tenta popular valores existentes.

DO $do$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'notifications'
      AND column_name = 'metadata'
  ) THEN
    EXECUTE $sql$
      UPDATE public.notifications
         SET href = nullif(btrim(metadata ->> 'href'), '')
       WHERE href IS NULL
         AND metadata ? 'href';
    $sql$;
  END IF;
END;
$do$;