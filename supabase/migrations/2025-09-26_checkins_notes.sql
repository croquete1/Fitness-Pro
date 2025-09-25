alter table public.checkins
  add column if not exists energy smallint check (energy between 1 and 5),
  add column if not exists sleep  smallint check (sleep  between 1 and 5),
  add column if not exists soreness smallint check (soreness between 1 and 5);
