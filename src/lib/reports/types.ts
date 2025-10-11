// src/lib/reports/types.ts
// Tipos compartilhados entre o carregamento de dados de relatórios e os componentes de UI.

export type NamedEntity = {
  id: string;
  name: string;
};

export type FinancialEntry = {
  id: string;
  userId: string;
  userName: string;
  date: string | null;
  amount: number;
  description: string | null;
};

export type FinancialBalance = {
  userId: string;
  userName: string;
  balance: number;
  currency: string | null;
};

export type TrainerSessionRecord = {
  id: string;
  trainerId: string | null;
  trainerName: string | null;
  clientId: string | null;
  clientName: string | null;
  status: string | null;
  startedAt: string | null;
  endedAt: string | null;
  durationMin: number | null;
};

export type MeasurementRecord = {
  id: string;
  userId: string;
  userName: string;
  measuredAt: string;
  weightKg: number | null;
  bodyFatPct: number | null;
};

export type ReportsData = {
  financial: {
    entries: FinancialEntry[];
    balances: FinancialBalance[];
    currency: string;
  };
  trainerSessions: TrainerSessionRecord[];
  measurements: MeasurementRecord[];
  meta: {
    trainers: NamedEntity[];
    clients: NamedEntity[];
    generatedAt: string;
  };
};
