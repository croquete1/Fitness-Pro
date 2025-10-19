import { addDays, subDays } from 'date-fns';

import type { ClientWalletDashboardData } from '@/lib/client/wallet/types';
import { buildClientWalletDashboard } from '@/lib/client/wallet/dashboard';
import type { ClientWalletEntryRow, ClientWalletRow } from '@/lib/client/dashboard/types';

function iso(date: Date): string {
  return date.toISOString();
}

function makeEntries(now: Date): ClientWalletEntryRow[] {
  return [
    {
      id: 'wallet-entry-boost',
      amount: 150,
      desc: 'Carregamento via MB Way — Plano PT Premium',
      created_at: iso(subDays(now, 4)),
    },
    {
      id: 'wallet-entry-session',
      amount: -45,
      desc: 'Sessão presencial — força total',
      created_at: iso(subDays(now, 3)),
    },
    {
      id: 'wallet-entry-group',
      amount: -18,
      desc: 'Aula de mobilidade em grupo',
      created_at: iso(subDays(now, 2)),
    },
    {
      id: 'wallet-entry-supp',
      amount: -22.5,
      desc: 'Suplementos — proteína vegetal',
      created_at: iso(subDays(now, 1)),
    },
    {
      id: 'wallet-entry-refill',
      amount: 80,
      desc: 'Carregamento MB Way — Plano trimestral',
      created_at: iso(subDays(now, 11)),
    },
    {
      id: 'wallet-entry-online',
      amount: -30,
      desc: 'Sessão online — HIIT 45min',
      created_at: iso(subDays(now, 12)),
    },
    {
      id: 'wallet-entry-equip',
      amount: -35,
      desc: 'Aluguer de equipamento funcional',
      created_at: iso(subDays(now, 14)),
    },
    {
      id: 'wallet-entry-credit',
      amount: 120,
      desc: 'Carregamento transferência bancária',
      created_at: iso(subDays(now, 22)),
    },
    {
      id: 'wallet-entry-promo',
      amount: 40,
      desc: 'Bónus de fidelização — campanha primavera',
      created_at: iso(subDays(now, 26)),
    },
    {
      id: 'wallet-entry-massage',
      amount: -28,
      desc: 'Massagem de recuperação muscular',
      created_at: iso(subDays(now, 27)),
    },
    {
      id: 'wallet-entry-renewal',
      amount: 150,
      desc: 'Renovação plano mensal PT',
      created_at: iso(subDays(now, 33)),
    },
    {
      id: 'wallet-entry-trial',
      amount: -12,
      desc: 'Aula experimental convidado',
      created_at: iso(subDays(now, 35)),
    },
    {
      id: 'wallet-entry-past-credit',
      amount: 90,
      desc: 'Carregamento de fevereiro',
      created_at: iso(subDays(now, 45)),
    },
  ];
}

export function getClientWalletFallback(userId: string, rangeDays = 30): ClientWalletDashboardData {
  const now = new Date();
  const wallet: ClientWalletRow = {
    balance: 164.5,
    currency: 'EUR',
    updated_at: iso(addDays(now, -1)),
  };

  const entries = makeEntries(now);

  return buildClientWalletDashboard({
    now,
    rangeDays,
    wallet,
    entries,
  });
}
