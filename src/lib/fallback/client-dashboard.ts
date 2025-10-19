import { addDays, subDays } from 'date-fns';

import { buildClientDashboard } from '@/lib/client/dashboard/dashboard';
import type {
  ClientDashboardData,
  ClientDashboardSource,
  ClientMeasurementRow,
  ClientNotificationRow,
  ClientPlanRow,
  ClientSessionRowRaw,
  ClientWalletEntryRow,
  ClientWalletRow,
} from '@/lib/client/dashboard/types';

function iso(date: Date): string {
  return date.toISOString();
}

function makePlan(now: Date, clientId: string): ClientPlanRow {
  const start = subDays(now, 21);
  const end = addDays(now, 35);
  return {
    id: 'plan-fallback-001',
    title: 'Plano Híbrido — Força & Mobilidade',
    status: 'ACTIVE',
    client_id: clientId,
    trainer_id: 'trainer-joana',
    start_date: iso(start),
    end_date: iso(end),
    updated_at: iso(addDays(now, -2)),
    notes:
      'Foco em reforço de core, mobilidade torácica e progressões de força superiores. Inclui 3 sessões semanais com cargas progressivas.',
  } as ClientPlanRow;
}

function makeSessions(now: Date, rangeDays: number): ClientSessionRowRaw[] {
  const sessions: ClientSessionRowRaw[] = [];

  for (let offset = rangeDays; offset >= 1; offset -= 1) {
    const date = subDays(now, offset);
    sessions.push({
      id: `session-past-${offset}`,
      trainer_id: 'trainer-joana',
      scheduled_at: iso(date),
      duration_min: 55,
      location: offset % 2 === 0 ? 'Box Matinal' : 'Online',
      client_attendance_status: offset % 5 === 0 ? 'cancelled' : 'completed',
    });
  }

  const upcomingOffsets = [1, 2, 4, 6, 9, 12];
  upcomingOffsets.forEach((offset, index) => {
    const date = addDays(now, offset);
    sessions.push({
      id: `session-upcoming-${index + 1}`,
      trainer_id: index % 2 === 0 ? 'trainer-joana' : 'trainer-tomas',
      scheduled_at: iso(date),
      duration_min: 55,
      location: index % 3 === 0 ? 'Estúdio Neo' : 'Online',
      client_attendance_status: index === 2 ? 'pending' : 'confirmed',
    });
  });

  return sessions;
}

function makeMeasurements(now: Date): ClientMeasurementRow[] {
  const baseWeight = 72.4;
  const measurements: ClientMeasurementRow[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const date = subDays(now, i * 14 + 2);
    measurements.push({
      measured_at: iso(date),
      weight_kg: Number((baseWeight - i * 0.6).toFixed(1)),
      body_fat_pct: Number((24.5 - i * 0.4).toFixed(1)),
      bmi: Number((23.1 - i * 0.2).toFixed(1)),
    });
  }
  return measurements;
}

function makeNotifications(now: Date): ClientNotificationRow[] {
  return [
    {
      id: 'notif-1',
      title: 'Sessão de quinta confirmada pelo PT João',
      type: 'session',
      read: false,
      created_at: iso(subDays(now, 1)),
    },
    {
      id: 'notif-2',
      title: 'Novo plano alimentar disponível',
      type: 'plan',
      read: false,
      created_at: iso(subDays(now, 3)),
    },
    {
      id: 'notif-3',
      title: 'Feedback da avaliação física registado',
      type: 'metrics',
      read: true,
      created_at: iso(subDays(now, 6)),
    },
    {
      id: 'notif-4',
      title: 'Recorde pessoal: tempo no remo 500m',
      type: 'celebration',
      read: true,
      created_at: iso(subDays(now, 9)),
    },
  ];
}

function makeWallet(now: Date): { wallet: ClientWalletRow; entries: ClientWalletEntryRow[] } {
  const entries: ClientWalletEntryRow[] = [
    {
      id: 'wallet-entry-1',
      amount: 120,
      desc: 'Carregamento Mensal PT Premium',
      created_at: iso(subDays(now, 2)),
    },
    {
      id: 'wallet-entry-2',
      amount: -45,
      desc: 'Sessão presencial — Treino força',
      created_at: iso(subDays(now, 4)),
    },
    {
      id: 'wallet-entry-3',
      amount: -30,
      desc: 'Aula de mobilidade em grupo',
      created_at: iso(subDays(now, 6)),
    },
    {
      id: 'wallet-entry-4',
      amount: -15,
      desc: 'Suplemento proteína vegetal',
      created_at: iso(subDays(now, 12)),
    },
    {
      id: 'wallet-entry-5',
      amount: 80,
      desc: 'Carregamento MBWay — Plano trimestral',
      created_at: iso(subDays(now, 18)),
    },
  ];

  const wallet: ClientWalletRow = {
    balance: 132.4,
    currency: 'EUR',
    updated_at: iso(subDays(now, 1)),
  };

  return { wallet, entries };
}

export function getClientDashboardFallback(clientId: string, rangeDays = 30): ClientDashboardData {
  const now = new Date();

  const plan = makePlan(now, clientId);
  const sessions = makeSessions(now, rangeDays);
  const measurements = makeMeasurements(now);
  const notifications = makeNotifications(now);
  const { wallet, entries } = makeWallet(now);

  const source: ClientDashboardSource = {
    now,
    rangeDays,
    plans: [plan],
    sessions,
    measurements,
    notifications,
    wallet,
    walletEntries: entries,
    trainerNames: {
      'trainer-joana': 'Joana Ribeiro',
      'trainer-tomas': 'Tomás Fernandes',
    },
  };

  return buildClientDashboard(source);
}
