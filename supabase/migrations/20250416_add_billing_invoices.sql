-- Cria tabela de faturação com histórico de recibos e faturas emitidas para os clientes.
create table if not exists public.billing_invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) on delete set null,
  client_name text not null,
  service_name text not null,
  amount numeric(10,2) not null,
  status text not null check (status in ('paid','pending','refunded')),
  method text not null check (method in ('mbway','visa','transfer','multibanco','cash')),
  issued_at timestamptz not null default timezone('utc', now()),
  due_at timestamptz,
  paid_at timestamptz,
  refunded_at timestamptz,
  reference text,
  notes text
);

comment on table public.billing_invoices is 'Histórico de faturação emitido pela box para cada cliente.';
comment on column public.billing_invoices.client_id is 'Ligação opcional ao perfil do cliente quando existe uma conta na plataforma.';
comment on column public.billing_invoices.client_name is 'Nome apresentado no recibo emitido.';
comment on column public.billing_invoices.service_name is 'Serviço/descrição do lançamento.';
comment on column public.billing_invoices.amount is 'Montante positivo em euros cobrado ao cliente.';
comment on column public.billing_invoices.status is 'Estado actual do documento: paid, pending ou refunded.';
comment on column public.billing_invoices.method is 'Método de pagamento seleccionado pelo cliente.';
comment on column public.billing_invoices.issued_at is 'Data/hora de emissão do documento.';
comment on column public.billing_invoices.due_at is 'Data limite de pagamento para o lançamento.';
comment on column public.billing_invoices.paid_at is 'Data em que o pagamento foi confirmado (quando aplicável).';
comment on column public.billing_invoices.refunded_at is 'Data em que o valor foi devolvido ao cliente (quando aplicável).';
comment on column public.billing_invoices.reference is 'Identificador interno ou referência MB/Mbway do documento.';
comment on column public.billing_invoices.notes is 'Notas internas adicionais relevantes para a equipa financeira.';

create index if not exists billing_invoices_client_id_idx on public.billing_invoices (client_id);
create index if not exists billing_invoices_status_idx on public.billing_invoices (status);
create index if not exists billing_invoices_issued_at_idx on public.billing_invoices (issued_at desc);

