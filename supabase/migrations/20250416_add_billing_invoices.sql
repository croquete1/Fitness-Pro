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

-- Dados iniciais para dar contexto às métricas neo.
insert into public.billing_invoices (client_name, client_id, service_name, amount, status, method, issued_at, due_at, paid_at, reference, notes)
values
  ('Ana Marques', null, 'Plano Personal Training — Abril', 120.00, 'paid', 'mbway', timezone('utc', now()) - interval '2 days', timezone('utc', now()) - interval '1 days', timezone('utc', now()) - interval '1 days', 'PT-2024-0001', 'Pagamento concluído via MB Way (referência #1188).'),
  ('João Pires', null, 'Pack Avaliação Física + Plano Nutrição', 85.00, 'pending', 'visa', timezone('utc', now()) - interval '3 days', timezone('utc', now()) + interval '4 days', null, 'PT-2024-0002', 'Cliente solicitou envio do recibo para contabilidade.'),
  ('Maria Costa', null, 'Mensalidade Treino Online', 60.00, 'paid', 'transfer', timezone('utc', now()) - interval '8 days', timezone('utc', now()) - interval '3 days', timezone('utc', now()) - interval '2 days', 'PT-2024-0003', 'Pagamento confirmado pelo extrato bancário.'),
  ('Pedro Almeida', null, 'Plano Premium PT 12 Sessões', 240.00, 'paid', 'mbway', timezone('utc', now()) - interval '15 days', timezone('utc', now()) - interval '5 days', timezone('utc', now()) - interval '5 days', 'PT-2024-0004', 'Cliente aderiu ao upgrade anual.'),
  ('Sara Nogueira', null, 'Reavaliação Bioimpedância', 25.00, 'pending', 'multibanco', timezone('utc', now()) - interval '1 day', timezone('utc', now()) + interval '6 days', null, 'PT-2024-0005', 'Esperar confirmação da referência MB.'),
  ('Miguel Tavares', null, 'Plano Nutrição — Maio', 75.00, 'paid', 'visa', timezone('utc', now()) - interval '20 days', timezone('utc', now()) - interval '10 days', timezone('utc', now()) - interval '9 days', 'PT-2024-0006', 'Pagamento efectuado com cartão corporate.'),
  ('Helena Duarte', null, 'Personal Training — Pack 8 Sessões', 160.00, 'refunded', 'transfer', timezone('utc', now()) - interval '32 days', timezone('utc', now()) - interval '22 days', timezone('utc', now()) - interval '22 days', 'PT-2024-0007', 'Plano cancelado por lesão, reembolso emitido.'),
  ('Ricardo Fonseca', null, 'Plano Empresarial — Treino Equipa', 320.00, 'paid', 'transfer', timezone('utc', now()) - interval '40 days', timezone('utc', now()) - interval '30 days', timezone('utc', now()) - interval '29 days', 'PT-2024-0008', 'Fatura enviada para departamento financeiro.'),
  ('Joana Faria', null, 'Plano Personal Training — Março', 120.00, 'paid', 'cash', timezone('utc', now()) - interval '45 days', timezone('utc', now()) - interval '35 days', timezone('utc', now()) - interval '35 days', 'PT-2024-0009', 'Pagamento registado na recepção.'),
  ('Tiago Neves', null, 'Avaliação Física + Plano Treino', 95.00, 'paid', 'mbway', timezone('utc', now()) - interval '55 days', timezone('utc', now()) - interval '45 days', timezone('utc', now()) - interval '44 days', 'PT-2024-0010', 'Cliente fidelizado há 18 meses.'),
  ('Rita Figueiredo', null, 'Plano Online — Trimestral', 150.00, 'pending', 'visa', timezone('utc', now()) - interval '12 days', timezone('utc', now()) + interval '2 days', null, 'PT-2024-0011', 'A aguardar autorização do cartão.'),
  ('Diogo Rocha', null, 'Treino Semi-Presencial', 110.00, 'refunded', 'multibanco', timezone('utc', now()) - interval '65 days', timezone('utc', now()) - interval '55 days', timezone('utc', now()) - interval '54 days', 'PT-2024-0012', 'Reembolso parcial após ajuste de agenda.'),
  ('Andreia Lopes', null, 'Plano Personal Training — Fevereiro', 120.00, 'paid', 'mbway', timezone('utc', now()) - interval '70 days', timezone('utc', now()) - interval '60 days', timezone('utc', now()) - interval '60 days', 'PT-2024-0013', 'Pagamento recorrente via MB Way.'),
  ('Nuno Ribeiro', null, 'Plano de Nutrição + Treino', 210.00, 'paid', 'transfer', timezone('utc', now()) - interval '5 days', timezone('utc', now()) + interval '5 days', timezone('utc', now()) - interval '1 days', 'PT-2024-0014', 'Inclui acompanhamento semanal.'),
  ('Beatriz Lemos', null, 'Mensalidade Aulas Grupo', 45.00, 'paid', 'mbway', timezone('utc', now()) - interval '6 days', timezone('utc', now()) - interval '1 days', timezone('utc', now()) - interval '1 days', 'PT-2024-0015', 'Pagamento automático confirmado.'),
  ('Luis Carvalho', null, 'Sessão Avulso Personal Training', 35.00, 'pending', 'cash', timezone('utc', now()) - interval '4 days', timezone('utc', now()) + interval '1 days', null, 'PT-2024-0016', 'Cliente pretende liquidar em mãos na próxima sessão.');
