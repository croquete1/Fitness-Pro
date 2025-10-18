import type { SessionHistoryDataset, SessionHistoryRow } from '@/lib/history/types';

function addDays(base: Date, offset: number) {
  return new Date(base.getTime() + offset * 86_400_000);
}

function iso(date: Date) {
  return date.toISOString();
}

const TRAINERS = [
  { id: 'pt-ana', name: 'Ana Ribeiro', email: 'ana.ribeiro@fitness.pro' },
  { id: 'pt-joao', name: 'João Martins', email: 'joao.martins@fitness.pro' },
  { id: 'pt-sara', name: 'Sara Costa', email: 'sara.costa@fitness.pro' },
];

const CLIENTS = [
  { id: 'cl-luis', name: 'Luís Figueiredo', email: 'luis.figueiredo@email.com' },
  { id: 'cl-maria', name: 'Maria Lopes', email: 'maria.lopes@email.com' },
  { id: 'cl-tiago', name: 'Tiago Cunha', email: 'tiago.cunha@email.com' },
  { id: 'cl-sofia', name: 'Sofia Almeida', email: 'sofia.almeida@email.com' },
];

export function getSampleSessionHistory(): SessionHistoryDataset {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0, 0);
  const rows: SessionHistoryRow[] = [
    {
      id: 'sess-4012',
      scheduledAt: iso(addDays(base, -2)),
      startAt: iso(addDays(base, -2)),
      endAt: iso(addDays(base, -2 + 0.0417)),
      durationMin: 60,
      status: 'confirmed',
      attendance: 'completed',
      location: 'Estúdio A',
      notes: 'Foco em HIIT e core.',
      trainer: TRAINERS[0],
      client: CLIENTS[0],
    },
    {
      id: 'sess-4013',
      scheduledAt: iso(addDays(base, -1)),
      startAt: iso(addDays(base, -1)),
      endAt: iso(addDays(base, -1 + 0.033)),
      durationMin: 45,
      status: 'completed',
      attendance: 'completed',
      location: 'Box Funcional',
      notes: 'Treino metabólico + alongamentos',
      trainer: TRAINERS[1],
      client: CLIENTS[1],
    },
    {
      id: 'sess-4014',
      scheduledAt: iso(addDays(base, -6)),
      startAt: iso(addDays(base, -6)),
      endAt: iso(addDays(base, -6 + 0.05)),
      durationMin: 75,
      status: 'completed',
      attendance: 'completed',
      location: 'Piscina',
      notes: 'Preparação triatlo — endurance.',
      trainer: TRAINERS[2],
      client: CLIENTS[2],
    },
    {
      id: 'sess-4015',
      scheduledAt: iso(addDays(base, -9)),
      startAt: iso(addDays(base, -9)),
      endAt: iso(addDays(base, -9 + 0.0417)),
      durationMin: 60,
      status: 'cancelled',
      attendance: 'cancelled',
      location: 'Estúdio B',
      notes: 'Cliente avisou indisposição na véspera.',
      trainer: TRAINERS[0],
      client: CLIENTS[3],
    },
    {
      id: 'sess-4016',
      scheduledAt: iso(addDays(base, -12)),
      startAt: iso(addDays(base, -12)),
      endAt: iso(addDays(base, -12 + 0.05)),
      durationMin: 75,
      status: 'confirmed',
      attendance: 'completed',
      location: 'Ginásio principal',
      notes: 'Ciclo de força — agachamento e peso morto.',
      trainer: TRAINERS[1],
      client: CLIENTS[0],
    },
    {
      id: 'sess-4017',
      scheduledAt: iso(addDays(base, -15)),
      startAt: iso(addDays(base, -15)),
      endAt: iso(addDays(base, -15 + 0.033)),
      durationMin: 45,
      status: 'scheduled',
      attendance: 'pending',
      location: 'Estúdio A',
      notes: 'Avaliação física trimestral.',
      trainer: TRAINERS[2],
      client: CLIENTS[1],
    },
    {
      id: 'sess-4018',
      scheduledAt: iso(addDays(base, 1)),
      startAt: iso(addDays(base, 1)),
      endAt: iso(addDays(base, 1 + 0.0417)),
      durationMin: 60,
      status: 'confirmed',
      attendance: 'pending',
      location: 'Estúdio B',
      notes: 'Pré-prova — treinos de mobilidade.',
      trainer: TRAINERS[0],
      client: CLIENTS[2],
    },
    {
      id: 'sess-4019',
      scheduledAt: iso(addDays(base, 2)),
      startAt: iso(addDays(base, 2)),
      endAt: iso(addDays(base, 2 + 0.033)),
      durationMin: 45,
      status: 'scheduled',
      attendance: 'pending',
      location: 'Ar livre',
      notes: 'Treino funcional em circuito.',
      trainer: TRAINERS[1],
      client: CLIENTS[3],
    },
    {
      id: 'sess-4020',
      scheduledAt: iso(addDays(base, 5)),
      startAt: iso(addDays(base, 5)),
      endAt: iso(addDays(base, 5 + 0.0417)),
      durationMin: 60,
      status: 'reschedule_pending',
      attendance: 'pending',
      location: 'Ginásio principal',
      notes: 'Cliente pediu ajuste para o fim-de-semana.',
      trainer: TRAINERS[2],
      client: CLIENTS[0],
    },
    {
      id: 'sess-4021',
      scheduledAt: iso(addDays(base, -20)),
      startAt: iso(addDays(base, -20)),
      endAt: iso(addDays(base, -20 + 0.0417)),
      durationMin: 60,
      status: 'completed',
      attendance: 'completed',
      location: 'Estúdio A',
      notes: 'Progressão de força — PR em supino.',
      trainer: TRAINERS[0],
      client: CLIENTS[0],
    },
  ];

  return {
    generatedAt: now.toISOString(),
    rows,
  };
}
