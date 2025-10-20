import { buildTrainerReschedulesDashboard } from '@/lib/trainer/reschedules/dashboard';
import type {
  TrainerAgendaSessionRecord,
  TrainerRescheduleRequestRecord,
  TrainerReschedulesDashboardData,
} from '@/lib/trainer/reschedules/types';

function addMinutes(base: Date, minutes: number) {
  const copy = new Date(base);
  copy.setMinutes(copy.getMinutes() + minutes);
  return copy;
}

function addDays(base: Date, days: number) {
  const copy = new Date(base);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function iso(date: Date) {
  return date.toISOString();
}

type RequestSeed = TrainerRescheduleRequestRecord & { trainerId: string };
type SessionSeed = TrainerAgendaSessionRecord & { trainerId: string };

const now = new Date();
const baseMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0, 0);

const REQUESTS: RequestSeed[] = [
  {
    trainerId: 'trainer-joao',
    id: 'req-tr-101',
    sessionId: 'sess-401',
    status: 'pending',
    requestedStart: iso(addDays(baseMorning, 1)),
    requestedEnd: iso(addMinutes(addDays(baseMorning, 1), 60)),
    proposedStart: null,
    proposedEnd: null,
    message: 'Posso antecipar para o início da manhã? Tenho reunião às 11h.',
    trainerNote: null,
    rescheduleNote: null,
    createdAt: iso(addMinutes(addDays(baseMorning, -1), 120)),
    updatedAt: iso(addMinutes(addDays(baseMorning, -1), 120)),
    respondedAt: null,
    proposedAt: null,
    clientId: 'client-ana',
    clientName: 'Ana Marques',
    clientEmail: 'ana.marques@fitnesspro.pt',
  },
  {
    trainerId: 'trainer-joao',
    id: 'req-tr-102',
    sessionId: 'sess-402',
    status: 'reschedule_pending',
    requestedStart: iso(addMinutes(addDays(baseMorning, 2), 480)),
    requestedEnd: iso(addMinutes(addDays(baseMorning, 2), 540)),
    proposedStart: iso(addMinutes(addDays(baseMorning, 2), 600)),
    proposedEnd: iso(addMinutes(addDays(baseMorning, 2), 660)),
    message: 'Preciso de trocar porque surgiu uma viagem.',
    trainerNote: 'Cliente viaja a trabalho, combinar pós-almoço.',
    rescheduleNote: 'Proposta enviada para depois das 15h.',
    createdAt: iso(addMinutes(addDays(baseMorning, -2), 30)),
    updatedAt: iso(addMinutes(addDays(baseMorning, -1), 300)),
    respondedAt: null,
    proposedAt: iso(addMinutes(addDays(baseMorning, -1), 300)),
    clientId: 'client-pedro',
    clientName: 'Pedro Almeida',
    clientEmail: 'pedro.almeida@fitnesspro.pt',
  },
  {
    trainerId: 'trainer-joao',
    id: 'req-tr-103',
    sessionId: 'sess-403',
    status: 'accepted',
    requestedStart: iso(addMinutes(addDays(baseMorning, -2), 240)),
    requestedEnd: iso(addMinutes(addDays(baseMorning, -2), 300)),
    proposedStart: iso(addMinutes(addDays(baseMorning, -2), 270)),
    proposedEnd: iso(addMinutes(addDays(baseMorning, -2), 330)),
    message: 'Podemos passar para o meio da tarde?',
    trainerNote: null,
    rescheduleNote: 'Reagendado para as 15h com foco em força.',
    createdAt: iso(addMinutes(addDays(baseMorning, -5), 90)),
    updatedAt: iso(addMinutes(addDays(baseMorning, -3), 110)),
    respondedAt: iso(addMinutes(addDays(baseMorning, -3), 110)),
    proposedAt: iso(addMinutes(addDays(baseMorning, -3), 30)),
    clientId: 'client-rita',
    clientName: 'Rita Figueiredo',
    clientEmail: 'rita.figueiredo@fitnesspro.pt',
  },
  {
    trainerId: 'trainer-joao',
    id: 'req-tr-104',
    sessionId: 'sess-404',
    status: 'reschedule_declined',
    requestedStart: iso(addMinutes(addDays(baseMorning, -4), 360)),
    requestedEnd: iso(addMinutes(addDays(baseMorning, -4), 420)),
    proposedStart: iso(addMinutes(addDays(baseMorning, -4), 480)),
    proposedEnd: iso(addMinutes(addDays(baseMorning, -4), 540)),
    message: 'Preferia manter o horário original.',
    trainerNote: 'Cliente prefere manter antes do almoço.',
    rescheduleNote: 'Proposta para final da tarde não foi aceite.',
    createdAt: iso(addMinutes(addDays(baseMorning, -8), 60)),
    updatedAt: iso(addMinutes(addDays(baseMorning, -4), 500)),
    respondedAt: iso(addMinutes(addDays(baseMorning, -4), 500)),
    proposedAt: iso(addMinutes(addDays(baseMorning, -5), 20)),
    clientId: 'client-nuno',
    clientName: 'Nuno Ribeiro',
    clientEmail: 'nuno.ribeiro@fitnesspro.pt',
  },
  {
    trainerId: 'trainer-sofia',
    id: 'req-tr-201',
    sessionId: 'sess-501',
    status: 'pending',
    requestedStart: iso(addMinutes(addDays(baseMorning, 3), 180)),
    requestedEnd: iso(addMinutes(addDays(baseMorning, 3), 240)),
    proposedStart: null,
    proposedEnd: null,
    message: 'Almoço de equipa marcado à última hora, podemos reagendar?',
    trainerNote: null,
    rescheduleNote: null,
    createdAt: iso(addMinutes(addDays(baseMorning, -1), 260)),
    updatedAt: iso(addMinutes(addDays(baseMorning, -1), 260)),
    respondedAt: null,
    proposedAt: null,
    clientId: 'client-maria',
    clientName: 'Maria Costa',
    clientEmail: 'maria.costa@fitnesspro.pt',
  },
  {
    trainerId: 'trainer-sofia',
    id: 'req-tr-202',
    sessionId: 'sess-502',
    status: 'declined',
    requestedStart: iso(addMinutes(addDays(baseMorning, -6), 540)),
    requestedEnd: iso(addMinutes(addDays(baseMorning, -6), 600)),
    proposedStart: null,
    proposedEnd: null,
    message: 'Estou constipado, talvez precise cancelar.',
    trainerNote: 'Sugerido descanso e reagendamento após recuperação.',
    rescheduleNote: 'Cancelado com remarcação para próxima semana.',
    createdAt: iso(addMinutes(addDays(baseMorning, -7), 420)),
    updatedAt: iso(addMinutes(addDays(baseMorning, -6), 560)),
    respondedAt: iso(addMinutes(addDays(baseMorning, -6), 560)),
    proposedAt: null,
    clientId: 'client-luis',
    clientName: 'Luís Carvalho',
    clientEmail: 'luis.carvalho@fitnesspro.pt',
  },
];

const SESSIONS: SessionSeed[] = [
  {
    trainerId: 'trainer-joao',
    id: 'sess-401',
    start: iso(addMinutes(addDays(baseMorning, 1), 120)),
    end: iso(addMinutes(addDays(baseMorning, 1), 180)),
    durationMin: 60,
    location: 'Estúdio A',
    status: 'scheduled',
    clientId: 'client-ana',
    clientName: 'Ana Marques',
  },
  {
    trainerId: 'trainer-joao',
    id: 'sess-405',
    start: iso(addMinutes(addDays(baseMorning, 2), 540)),
    end: iso(addMinutes(addDays(baseMorning, 2), 600)),
    durationMin: 60,
    location: 'Outdoor',
    status: 'scheduled',
    clientId: 'client-pedro',
    clientName: 'Pedro Almeida',
  },
  {
    trainerId: 'trainer-joao',
    id: 'sess-406',
    start: iso(addMinutes(addDays(baseMorning, 3), 300)),
    end: iso(addMinutes(addDays(baseMorning, 3), 360)),
    durationMin: 60,
    location: 'Estúdio B',
    status: 'completed',
    clientId: 'client-rita',
    clientName: 'Rita Figueiredo',
  },
  {
    trainerId: 'trainer-sofia',
    id: 'sess-501',
    start: iso(addMinutes(addDays(baseMorning, 3), 180)),
    end: iso(addMinutes(addDays(baseMorning, 3), 240)),
    durationMin: 60,
    location: 'Estúdio A',
    status: 'scheduled',
    clientId: 'client-maria',
    clientName: 'Maria Costa',
  },
  {
    trainerId: 'trainer-sofia',
    id: 'sess-503',
    start: iso(addMinutes(addDays(baseMorning, 4), 540)),
    end: iso(addMinutes(addDays(baseMorning, 4), 630)),
    durationMin: 90,
    location: 'Piscina',
    status: 'scheduled',
    clientId: 'client-luis',
    clientName: 'Luís Carvalho',
  },
];

export function getTrainerReschedulesFallback(trainerId: string): TrainerReschedulesDashboardData {
  const requestRows = REQUESTS.filter((request) => request.trainerId === trainerId);
  const sessionRows = SESSIONS.filter((session) => session.trainerId === trainerId);
  const data = requestRows.length ? requestRows : REQUESTS.filter((request) => request.trainerId === 'trainer-joao');
  const agenda = sessionRows.length ? sessionRows : SESSIONS.filter((session) => session.trainerId === 'trainer-joao');
  return buildTrainerReschedulesDashboard(
    data.map((item) => ({ ...item })),
    agenda.map((item) => ({ ...item })),
    { supabase: false },
  );
}
