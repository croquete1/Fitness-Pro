-- supabase/migrations/20250430_add_training_plans_client_id.sql
-- Garante que training_plans expõe client_id com dados consistentes para o dashboard do PT.
set check_function_bodies = off;

-- Renomeia a coluna camelCase se existir.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'training_plans'
      and column_name = 'clientId'
  ) then
    execute 'alter table public.training_plans rename column "clientId" to client_id';
  end if;
end;
$$;

-- Cria a coluna client_id quando ainda não existir.
alter table public.training_plans
  add column if not exists client_id uuid;

-- Tenta preencher client_id a partir de colunas antigas.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'training_plans'
      and column_name = 'client_id'
  ) then
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'training_plans'
        and column_name = 'user_id'
    ) then
      execute $sql$
        update public.training_plans
        set client_id = coalesce(client_id, user_id)
        where client_id is null and user_id is not null;
      $sql$;
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'training_plans'
        and column_name = 'profile_id'
    ) then
      execute $sql$
        update public.training_plans
        set client_id = coalesce(client_id, profile_id)
        where client_id is null and profile_id is not null;
      $sql$;
    end if;

  end if;
end;
$$;

-- Reforça a FK para perfis/contas.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'training_plans_client_id_fkey'
  ) then
    alter table public.training_plans
      add constraint training_plans_client_id_fkey
      foreign key (client_id) references public.users(id)
      on delete set null;
  end if;
end;
$$;

create index if not exists training_plans_client_idx on public.training_plans (client_id);
