-- supabase/migrations/20250417_add_notification_href.sql
-- Adiciona coluna href à tabela de notificações e tenta popular valores existentes.

alter table public.notifications
  add column if not exists href text;

update public.notifications
set href = nullif(trim(metadata ->> 'href'), '')
where href is null
  and metadata ? 'href';

comment on column public.notifications.href is 'Link primário associado à notificação (CTA).';
