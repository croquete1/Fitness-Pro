-- Adiciona colunas para confirmar presença nas sessões
alter table public.sessions
  add column if not exists client_attendance_status text check (client_attendance_status in ('pending','confirmed','completed','cancelled','no_show')) default 'pending',
  add column if not exists client_attendance_at timestamptz;

comment on column public.sessions.client_attendance_status is 'Estado de presença indicado pelo cliente';
comment on column public.sessions.client_attendance_at    is 'Última vez que o cliente atualizou o estado de presença';

update public.sessions
  set client_attendance_status = 'pending'
where client_attendance_status is null;
