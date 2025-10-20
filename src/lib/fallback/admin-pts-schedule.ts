import { buildAdminPtsScheduleDashboard } from '@/lib/admin/pts-schedule/dashboard';
import type { AdminPtsScheduleDashboardData, AdminPtsScheduleRecord } from '@/lib/admin/pts-schedule/types';

function isoWithOffset(base: Date, days: number, hours: number, minutes: number): string {
  const copy = new Date(base);
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() + days);
  copy.setHours(hours, minutes, 0, 0);
  return copy.toISOString();
}

function buildRecords(now: Date): AdminPtsScheduleRecord[] {
  const trainers = [
    { id: 'pt-ines', name: 'Inês Silva', email: 'ines.silva@fitnesspro.pt' },
    { id: 'pt-miguel', name: 'Miguel Rocha', email: 'miguel.rocha@fitnesspro.pt' },
    { id: 'pt-raquel', name: 'Raquel Almeida', email: 'raquel.almeida@fitnesspro.pt' },
  ];

  const clients = [
    { id: 'cl-joana', name: 'Joana Costa', email: 'joana.costa@email.com' },
    { id: 'cl-tiago', name: 'Tiago Marques', email: 'tiago.marques@email.com' },
    { id: 'cl-luis', name: 'Luís Pereira', email: 'luis.pereira@email.com' },
    { id: 'cl-maria', name: 'Maria Lopes', email: 'maria.lopes@email.com' },
    { id: 'cl-ana', name: 'Ana Pinto', email: 'ana.pinto@email.com' },
  ];

  const startToday = new Date(now);
  startToday.setHours(6, 0, 0, 0);

  const make = (
    id: string,
    trainerIndex: number,
    clientIndex: number,
    dayOffset: number,
    startHour: number,
    startMinute: number,
    duration: number,
    status: string,
    extras: Partial<AdminPtsScheduleRecord> = {},
  ): AdminPtsScheduleRecord => {
    const start = isoWithOffset(startToday, dayOffset, startHour, startMinute);
    const endDate = new Date(start);
    endDate.setMinutes(endDate.getMinutes() + duration);
    return {
      id,
      start,
      end: endDate.toISOString(),
      status,
      location: 'Estúdio principal',
      notes: null,
      durationMinutes: duration,
      createdAt: new Date(startToday.getTime() - 2 * 86_400_000).toISOString(),
      updatedAt: new Date(startToday.getTime() - 86_400_000).toISOString(),
      trainer: trainers[trainerIndex] ?? trainers[0],
      client: clients[clientIndex] ?? clients[0],
      ...extras,
    } satisfies AdminPtsScheduleRecord;
  };

  return [
    make('sess-001', 0, 0, 0, 8, 0, 60, 'scheduled'),
    make('sess-002', 0, 1, 0, 9, 30, 45, 'scheduled', { location: 'Sala funcional' }),
    make('sess-003', 1, 2, 1, 7, 30, 60, 'confirmed'),
    make('sess-004', 1, 3, 1, 18, 0, 55, 'scheduled', { notes: 'Plano focado em mobilidade.' }),
    make('sess-005', 2, 4, 2, 12, 0, 50, 'done', { updatedAt: new Date(now.getTime() - 4 * 86_400_000).toISOString() }),
    make('sess-006', 2, 0, -1, 17, 30, 60, 'done'),
    make('sess-007', 0, 3, -2, 8, 30, 45, 'cancelled', { notes: 'Cliente doente — reagendar para a próxima semana.' }),
    make('sess-008', 1, 1, 3, 19, 0, 60, 'scheduled', { location: 'Online (Teams)' }),
    make('sess-009', 0, 2, 4, 7, 45, 50, 'scheduled'),
    make('sess-010', 2, 3, 5, 10, 0, 60, 'scheduled', { location: 'Outdoor – Parque da Cidade' }),
    make('sess-011', 1, 4, 6, 16, 30, 45, 'scheduled'),
  ];
}

export function getAdminPtsScheduleFallback(now = new Date()): AdminPtsScheduleDashboardData {
  const rangeStart = new Date(now);
  rangeStart.setDate(rangeStart.getDate() - 3);
  rangeStart.setHours(0, 0, 0, 0);
  const rangeEnd = new Date(now);
  rangeEnd.setDate(rangeEnd.getDate() + 14);
  rangeEnd.setHours(23, 59, 59, 999);

  const records = buildRecords(now);

  const dataset = buildAdminPtsScheduleDashboard(records, {
    now,
    supabaseConfigured: false,
    rangeStart,
    rangeEnd,
    generatedAt: now,
  });

  return dataset satisfies AdminPtsScheduleDashboardData;
}
