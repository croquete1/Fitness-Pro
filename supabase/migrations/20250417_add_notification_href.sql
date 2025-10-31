-- supabase/migrations/20250417_add_notification_href.sql
-- Adiciona coluna href à tabela de notificações e tenta popular valores existentes.

alter table public.notifications
  add column if not exists href text;

comment on column public.notifications.href is 'Link primário associado à notificação (CTA).';

-- Preenche href com base em metadata->>'href' quando a coluna metadata existir.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'notifications'
      AND column_name = 'metadata'
  ) THEN
    EXECUTE $$
      update public.notifications
         set href = nullif(btrim(metadata ->> 'href'), '')
       where href is null
         and metadata ? 'href';
    $$;
  END IF;
END;
$$;
