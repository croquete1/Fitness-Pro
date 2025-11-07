-- Adds support for template/unassigned training plans for personal trainers
alter table if exists public.training_plans
  add column if not exists description text,
  add column if not exists is_template boolean not null default false,
  add column if not exists template_id uuid null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'training_plans_template_id_fkey'
  ) then
    alter table public.training_plans
      add constraint training_plans_template_id_fkey
        foreign key (template_id)
        references public.training_plans (id)
        on delete set null;
  end if;
end$$;

create index if not exists training_plans_is_template_idx on public.training_plans (is_template);
create index if not exists training_plans_template_id_idx on public.training_plans (template_id);
