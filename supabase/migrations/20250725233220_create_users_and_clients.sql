-- extension pgcrypto para geração de UUIDs (Supabase já inclui)
-- create extension if not exists "pgcrypto";

create table if not exists users (
  id           uuid    primary key default gen_random_uuid(),
  email        text    unique not null,
  password_hash text   not null,
  role         text    not null,
  created_at   timestamptz default now()
);

create table if not exists clients (
  id             uuid    primary key default gen_random_uuid(),
  user_id        uuid    references users(id) on delete cascade,
  objetivos      text,
  dados_pessoais jsonb,
  foto_url       text,
  created_at     timestamptz default now()
);
