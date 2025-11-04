-- supabase/migrations/20250425_add_admin_cascade_delete_exercise.sql
-- Introduz função utilitária para remover dependências de exercícios antes de apagar o registo principal.

set check_function_bodies = off;

create or replace function public.admin_cascade_delete_exercise(target_exercise_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate record;
  column_candidates constant text[] := array['exercise_id', 'exercise_uuid', 'ex_id', 'exercise'];
begin
  if target_exercise_id is null then
    return;
  end if;

  for candidate in
    select c.table_schema, c.table_name, c.column_name
    from information_schema.columns c
    join information_schema.tables t
      on t.table_schema = c.table_schema
     and t.table_name = c.table_name
    where c.table_schema = 'public'
      and t.table_type = 'BASE TABLE'
      and c.column_name = any(column_candidates)
      and (c.table_name, c.column_name) <> ('exercises', 'id')
  loop
    execute format(
      'delete from %I.%I where %I::text = $1::text',
      candidate.table_schema,
      candidate.table_name,
      candidate.column_name
    )
    using target_exercise_id;
  end loop;
end;
$$;

comment on function public.admin_cascade_delete_exercise(uuid) is
  'Apaga referências conhecidas a um exercício (colunas exercise_id/ex_id/exercise_uuid) antes da remoção do registo principal.';

grant execute on function public.admin_cascade_delete_exercise(uuid) to authenticated, service_role;
