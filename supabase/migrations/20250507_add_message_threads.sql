-- supabase/migrations/20250507_add_message_threads.sql
-- Cria as tabelas de threads/mensagens e respectivos anexos para suportar o chat cliente ↔ PT.
-- Também provisiona um bucket privado para anexos e garante políticas mínimas para o serviço.

set check_function_bodies = off;

-- Bucket dedicado a anexos das mensagens (privado por omissão).
insert into storage.buckets as b (id, name, public, file_size_limit, allowed_mime_types)
values (
  'message-attachments',
  'message-attachments',
  false,
  52428800, -- 50 MB
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

comment on table storage.buckets is 'Bucket de storage do Supabase';
comment on column storage.buckets.id is 'Identificador único do bucket.';

create table if not exists public.message_threads (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  trainer_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'archived')),
  last_message_at timestamptz,
  last_message_preview text,
  last_message_author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint message_threads_unique_pair unique (client_id, trainer_id)
);

comment on table public.message_threads is 'Threads individuais de conversa entre cliente e personal trainer.';
comment on column public.message_threads.status is 'Estado do thread (active/archived).';
comment on column public.message_threads.last_message_preview is 'Resumo curto do último conteúdo enviado.';

create index if not exists message_threads_client_idx on public.message_threads (client_id);
create index if not exists message_threads_trainer_idx on public.message_threads (trainer_id);
create index if not exists message_threads_last_message_idx on public.message_threads (last_message_at desc nulls last);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  from_id uuid not null references public.profiles(id) on delete cascade,
  to_id uuid references public.profiles(id) on delete set null,
  body text,
  channel text not null default 'in-app' check (channel in ('in-app','whatsapp','email','sms','call','social','file')),
  status text not null default 'sent' check (status in ('draft','sent','delivered','read','failed')),
  metadata jsonb not null default '{}'::jsonb,
  sent_at timestamptz not null default timezone('utc', now()),
  read_at timestamptz,
  reply_to_id uuid references public.messages(id) on delete set null,
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.messages is 'Mensagens trocadas dentro de um thread (conteúdo e metadados).';
comment on column public.messages.metadata is 'Envelope flexível para integrações (ex.: origem, anexos, sinais).';

create index if not exists messages_thread_idx on public.messages (thread_id, sent_at desc);
create index if not exists messages_from_idx on public.messages (from_id);
create index if not exists messages_to_idx on public.messages (to_id);
create index if not exists messages_read_idx on public.messages (to_id, read_at);

create table if not exists public.message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  bucket text not null default 'message-attachments',
  storage_path text not null,
  file_name text not null,
  content_type text,
  size_bytes bigint check (size_bytes >= 0),
  is_ephemeral boolean not null default false,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.message_attachments is 'Registo dos anexos associados a cada mensagem.';
comment on column public.message_attachments.is_ephemeral is 'Flag para anexos temporários (expiração automática).';

create index if not exists message_attachments_message_idx on public.message_attachments (message_id);
create index if not exists message_attachments_expires_idx on public.message_attachments (expires_at) where expires_at is not null;

create or replace function public.message_threads_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists message_threads_set_updated_at on public.message_threads;
create trigger message_threads_set_updated_at
  before update on public.message_threads
  for each row
  execute function public.message_threads_touch_updated_at();

create or replace function public.messages_touch_timestamps()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  if new.sent_at is null then
    new.sent_at := timezone('utc', now());
  end if;
  return new;
end;
$$;

drop trigger if exists messages_set_timestamps on public.messages;
create trigger messages_set_timestamps
  before update on public.messages
  for each row
  execute function public.messages_touch_timestamps();

create or replace function public.message_threads_sync_last_message()
returns trigger
language plpgsql
as $$
begin
  update public.message_threads
  set
    last_message_at = coalesce(new.sent_at, timezone('utc', now())),
    last_message_author_id = new.from_id,
    last_message_preview = case when coalesce(new.body, '') <> '' then left(btrim(new.body), 200) else last_message_preview end,
    updated_at = timezone('utc', now())
  where id = new.thread_id;
  return new;
end;
$$;

drop trigger if exists message_threads_after_message_insert on public.messages;
create trigger message_threads_after_message_insert
  after insert on public.messages
  for each row
  execute function public.message_threads_sync_last_message();

alter table public.message_threads enable row level security;
alter table public.messages enable row level security;
alter table public.message_attachments enable row level security;

drop policy if exists "message_threads service" on public.message_threads;
create policy "message_threads service"
  on public.message_threads
  for all
  using (true)
  with check (true)
  to service_role;

drop policy if exists "messages service" on public.messages;
create policy "messages service"
  on public.messages
  for all
  using (true)
  with check (true)
  to service_role;

drop policy if exists "message_attachments service" on public.message_attachments;
create policy "message_attachments service"
  on public.message_attachments
  for all
  using (true)
  with check (true)
  to service_role;
