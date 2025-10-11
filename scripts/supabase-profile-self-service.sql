-- scripts/supabase-profile-self-service.sql
-- Ajustes de esquema para suportar edição de perfil/self-service no dashboard.

begin;

-- Campos públicos adicionais para perfis (username e bio).
alter table if exists public.profiles
  add column if not exists username text,
  add column if not exists bio text;

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username))
  where username is not null;

-- Tabela de dados privados do perfil (telefone, preferências, etc.).
create table if not exists public.profile_private (
  user_id uuid primary key references public.users (id) on delete cascade,
  phone text,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

alter table if exists public.profile_private
  add column if not exists phone text,
  add column if not exists settings jsonb default '{}'::jsonb,
  add column if not exists created_at timestamptz default timezone('utc', now()),
  add column if not exists updated_at timestamptz default timezone('utc', now());

alter table if exists public.profile_private
  alter column settings set default '{}'::jsonb;

update public.profile_private
  set settings = '{}'::jsonb
  where settings is null;

commit;
