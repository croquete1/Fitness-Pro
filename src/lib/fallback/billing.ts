import { buildBillingDashboard } from '../billing/dashboard';
import type { BillingDashboardData, BillingInvoiceRecord } from '../billing/types';

const BASE_CLIENTS = [
  'Ana Marques',
  'João Pires',
  'Maria Costa',
  'Pedro Almeida',
  'Sara Nogueira',
  'Miguel Tavares',
  'Helena Duarte',
  'Ricardo Fonseca',
  'Joana Faria',
  'Tiago Neves',
  'Rita Figueiredo',
];

const SERVICES = [
  'Plano Personal Training — Pack 12',
  'Mensalidade Treino Online',
  'Plano Nutrição + Treino',
  'Avaliação Física + Bioimpedância',
  'Mensalidade Aulas Grupo',
];

const METHODS: Array<{ method: 'mbway' | 'visa' | 'transfer' | 'multibanco' | 'cash'; amount: number }>[] = [
  [
    { method: 'mbway', amount: 120 },
    { method: 'visa', amount: 85 },
    { method: 'transfer', amount: 60 },
  ],
  [
    { method: 'mbway', amount: 95 },
    { method: 'multibanco', amount: 25 },
    { method: 'transfer', amount: 210 },
  ],
];

function rotate<T>(values: readonly T[], index: number): T {
  return values[index % values.length]!;
}

function buildRecord(seed: number, override?: Partial<BillingInvoiceRecord>): BillingInvoiceRecord {
  const now = Date.now();
  const issuedAt = new Date(now - seed * 86_400_000).toISOString();
  const dueAt = new Date(new Date(issuedAt).getTime() + 7 * 86_400_000).toISOString();
  const templateMethod = rotate(METHODS[seed % METHODS.length], seed);
  const base: BillingInvoiceRecord = {
    id: `fb-bill-${seed.toString().padStart(3, '0')}`,
    clientId: null,
    clientName: rotate(BASE_CLIENTS, seed),
    serviceName: rotate(SERVICES, seed),
    amount: templateMethod.amount,
    status: seed % 7 === 0 ? 'refunded' : seed % 4 === 0 ? 'pending' : 'paid',
    method: templateMethod.method,
    issuedAt,
    dueAt,
    paidAt: seed % 4 === 0 ? null : new Date(new Date(issuedAt).getTime() + 3 * 86_400_000).toISOString(),
    refundedAt:
      seed % 7 === 0
        ? new Date(new Date(issuedAt).getTime() + 5 * 86_400_000).toISOString()
        : null,
    reference: `PT-FALLBACK-${2024}-${seed.toString().padStart(4, '0')}`,
    notes: seed % 5 === 0 ? 'Dados de demonstração actualizados para testes offline.' : null,
  };
  return { ...base, ...override };
}

export function getBillingDashboardFallback(viewerName?: string | null): BillingDashboardData {
  const dataset: BillingInvoiceRecord[] = [];
  for (let index = 0; index < 18; index += 1) {
    dataset.push(buildRecord(index + 1));
  }

  if (viewerName) {
    dataset.unshift(
      buildRecord(2, {
        id: 'fb-bill-viewer',
        clientName: viewerName,
        serviceName: 'Plano Personal Training — Trimestral',
        amount: 189,
        status: 'pending',
        method: 'mbway',
        notes: 'Gerado automaticamente para pré-visualização do cliente.',
      }),
    );
  }

  return buildBillingDashboard(dataset);
}

export const fallbackBillingDataset: BillingDashboardData = getBillingDashboardFallback();
