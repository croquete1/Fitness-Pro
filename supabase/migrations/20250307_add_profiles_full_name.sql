-- Cria uma coluna derivada "full_name" na tabela profiles para manter compatibilidade com o código existente.
-- A coluna é gerada automaticamente a partir de "name" (trimada) para evitar duplicar dados e garantir sincronização.
alter table public.profiles
  add column if not exists full_name text generated always as (nullif(btrim(name), '')) stored;

comment on column public.profiles.full_name is 'Nome completo derivado automaticamente da coluna name.';
