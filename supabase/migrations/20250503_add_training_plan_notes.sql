-- Adds dedicated columns for public and private training plan notes and backfills existing data.
alter table if exists public.training_plans
  add column if not exists private_notes text,
  add column if not exists public_notes text;

update public.training_plans
set private_notes = coalesce(nullif(private_notes, ''), notes)
where notes is not null
  and (private_notes is null or private_notes = '' or private_notes is distinct from notes);

update public.training_plans
set notes = private_notes
where private_notes is not null
  and (notes is null or notes <> private_notes);
