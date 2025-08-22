export type PlanKind = 'TRAINING' | 'NUTRITION';

export type PurchasedPlan = {
  id: string;
  kind: PlanKind;
  title: string;
  durationMonths: 1 | 2 | 3;
  startDate: string; // ISO
  endDate: string;   // ISO
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING';
};

export type ExtraPurchase = {
  id: string;
  kind: 'PHYSICAL_ASSESSMENT';
  label: string;
  date: string; // ISO
  price: number; // em EUR
};

export type Payment = {
  id: string;
  date: string;  // ISO
  description: string;
  amount: number; // positivo = pago pelo cliente
  method: 'MBWAY' | 'CARD' | 'CASH' | 'TRANSFER';
};

export type ClientBilling = {
  customerId: string;
  plans: PurchasedPlan[];
  extras: ExtraPurchase[];
  payments: Payment[];
};

function addMonthsISO(startISO: string, months: 1 | 2 | 3): string {
  const d = new Date(startISO);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

/**
 * Stub: devolve dados do cliente autenticado.
 * Futuro: trocar pela query a Prisma (assignments/subscriptions).
 */
export async function getBillingForUser(userId: string): Promise<ClientBilling> {
  // mock consistente mas previsível (para não quebrar no build/prerender)
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - 1, 10).toISOString();

  const trainingPlan: PurchasedPlan = {
    id: 'pl_training_001',
    kind: 'TRAINING',
    title: 'Plano de Treino — Hipertrofia',
    durationMonths: 3,
    startDate: start,
    endDate: addMonthsISO(start, 3),
    status: 'ACTIVE',
  };

  const maybeNutrition: PurchasedPlan = {
    id: 'pl_nutri_002',
    kind: 'NUTRITION',
    title: 'Plano de Alimentação — Cutting',
    durationMonths: 1,
    startDate: start,
    endDate: addMonthsISO(start, 1),
    status: 'EXPIRED',
  };

  const extras: ExtraPurchase[] = [
    { id: 'ex_001', kind: 'PHYSICAL_ASSESSMENT', label: 'Avaliação Física — Dobras Cutâneas', date: new Date(today.getFullYear(), today.getMonth(), 2).toISOString(), price: 25 },
    { id: 'ex_002', kind: 'PHYSICAL_ASSESSMENT', label: 'Avaliação Física — Bioimpedância', date: new Date(today.getFullYear(), today.getMonth() - 1, 18).toISOString(), price: 20 },
  ];

  const payments: Payment[] = [
    { id: 'pay_001', date: start, description: 'Plano de Treino (3 meses)', amount: 90, method: 'MBWAY' },
    { id: 'pay_002', date: new Date(today.getFullYear(), today.getMonth() - 1, 12).toISOString(), description: 'Avaliação Física', amount: 25, method: 'CARD' },
    { id: 'pay_003', date: new Date(today.getFullYear(), today.getMonth() - 2, 5).toISOString(), description: 'Plano de Alimentação (1 mês)', amount: 40, method: 'TRANSFER' },
  ];

  return {
    customerId: userId,
    plans: [trainingPlan, maybeNutrition],
    extras,
    payments,
  };
}
