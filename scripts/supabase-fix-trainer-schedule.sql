-- scripts/supabase-fix-trainer-schedule.sql
--
-- Executar no SQL Editor do Supabase (com transação) para alinhar a
-- identificação dos personal trainers com o NextAuth.
--
-- 1. Normaliza roles para maiúsculas.
-- 2. Garante que auth_id fica preenchido (default = id) quando não houver
--    integração directa com o Auth do Supabase.
-- 3. Força consistência em novos registos / updates.
--
-- ⚠️ Rever sempre em staging antes de aplicar em produção.

begin;

update public.users
set role = upper(role)
where role is not null
  and role <> upper(role);

update public.users
set auth_id = id
where auth_id is null
  and role = 'TRAINER';

create or replace function public.users_fill_auth_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is not null then
    new.role := upper(new.role);
  end if;

  if new.auth_id is null then
    new.auth_id := new.id;
  end if;

  return new;
end;
$$;

comment on function public.users_fill_auth_id() is 'Mantém auth_id sincronizado com id e role em maiúsculas.';

drop trigger if exists users_fill_auth_id on public.users;
create trigger users_fill_auth_id
  before insert or update
  on public.users
  for each row
  execute function public.users_fill_auth_id();

commit;
