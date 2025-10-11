// src/lib/fallback/reports.ts
import { ReportsData } from '@/lib/reports/types';

const PT_TRAINERS = [
  { id: 'pt_ana', name: 'Ana Marques' },
  { id: 'pt_joao', name: 'João Costa' },
  { id: 'pt_rui', name: 'Rui Pereira' },
];

const PT_CLIENTS = [
  { id: 'cl_maria', name: 'Maria Santos' },
  { id: 'cl_carla', name: 'Carla Vieira' },
  { id: 'cl_pedro', name: 'Pedro Almeida' },
];

function monthsBack(date: Date, offset: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() - offset);
  return d;
}

function iso(date: Date) {
  return date.toISOString();
}

export function getSampleReportsData(): ReportsData {
  const today = new Date();
  const currency = 'EUR';

  const entries: ReportsData['financial']['entries'] = [];
  for (let i = 0; i < 8; i += 1) {
    const when = monthsBack(today, i);
    const value = 3200 + Math.round(Math.sin(i / 2) * 450);
    const client = PT_CLIENTS[i % PT_CLIENTS.length];
    entries.push({
      id: `fin_${i}`,
      userId: client.id,
      userName: client.name,
      date: iso(when),
      amount: value,
      description: 'Mensalidade planos PT',
    });
  }

  const balances: ReportsData['financial']['balances'] = PT_CLIENTS.map((client, index) => ({
    userId: client.id,
    userName: client.name,
    balance: index === 1 ? -120 : 0,
    currency,
  }));

  const trainerSessions: ReportsData['trainerSessions'] = [];
  for (let i = 0; i < 18; i += 1) {
    const trainer = PT_TRAINERS[i % PT_TRAINERS.length];
    const client = PT_CLIENTS[(i + 1) % PT_CLIENTS.length];
    const startsAt = new Date(today);
    startsAt.setDate(startsAt.getDate() - i * 3);
    const endedAt = new Date(startsAt);
    endedAt.setHours(endedAt.getHours() + 1);
    trainerSessions.push({
      id: `sess_${i}`,
      trainerId: trainer.id,
      trainerName: trainer.name,
      clientId: client.id,
      clientName: client.name,
      status: i % 6 === 0 ? 'cancelled' : 'completed',
      startedAt: iso(startsAt),
      endedAt: iso(endedAt),
      durationMin: 60,
    });
  }

  const measurements: ReportsData['measurements'] = [];
  PT_CLIENTS.forEach((client, idx) => {
    for (let i = 0; i < 6; i += 1) {
      const measuredAt = monthsBack(today, i + idx);
      measurements.push({
        id: `${client.id}_${i}`,
        userId: client.id,
        userName: client.name,
        measuredAt: iso(measuredAt),
        weightKg: 78 - idx * 3 - i,
        bodyFatPct: 26 - idx * 2 - i * 0.5,
      });
    }
  });

  return {
    financial: {
      entries,
      balances,
      currency,
    },
    trainerSessions,
    measurements,
    meta: {
      trainers: PT_TRAINERS,
      clients: PT_CLIENTS,
      generatedAt: iso(today),
    },
  };
}
