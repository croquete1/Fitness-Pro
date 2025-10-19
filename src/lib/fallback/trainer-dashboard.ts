import { addDays, subDays } from 'date-fns';
import { buildTrainerDashboard } from '@/lib/trainer/dashboard/dashboard';
import {
  type TrainerApprovalRecord,
  type TrainerClientRecord,
  type TrainerDashboardResponse,
  type TrainerDashboardSource,
  type TrainerPlanRecord,
  type TrainerSessionRecord,
} from '@/lib/trainer/dashboard/types';

function iso(date: Date) {
  return date.toISOString();
}

function createClients(base: Date): TrainerClientRecord[] {
  return [
    {
      id: 'client-ana',
      name: 'Ana Marques',
      email: 'ana.marques@fitnesspro.pt',
      status: 'ACTIVE',
      linkedAt: iso(subDays(base, 120)),
      activePlanStatus: 'ACTIVE',
      lastSessionAt: iso(subDays(base, 1)),
      nextSessionAt: iso(addDays(base, 1)),
    },
    {
      id: 'client-pedro',
      name: 'Pedro Almeida',
      email: 'pedro.almeida@fitnesspro.pt',
      status: 'ACTIVE',
      linkedAt: iso(subDays(base, 90)),
      activePlanStatus: 'ACTIVE',
      lastSessionAt: iso(subDays(base, 3)),
      nextSessionAt: iso(addDays(base, 4)),
    },
    {
      id: 'client-rita',
      name: 'Rita Figueiredo',
      email: 'rita.figueiredo@fitnesspro.pt',
      status: 'PENDING',
      linkedAt: iso(subDays(base, 30)),
      activePlanStatus: 'DRAFT',
      lastSessionAt: iso(subDays(base, 7)),
      nextSessionAt: null,
    },
    {
      id: 'client-nuno',
      name: 'Nuno Ribeiro',
      email: 'nuno.ribeiro@fitnesspro.pt',
      status: 'ACTIVE',
      linkedAt: iso(subDays(base, 14)),
      activePlanStatus: 'ACTIVE',
      lastSessionAt: iso(subDays(base, 2)),
      nextSessionAt: iso(addDays(base, 2)),
    },
    {
      id: 'client-sofia',
      name: 'Sofia Martins',
      email: 'sofia.martins@fitnesspro.pt',
      status: 'ACTIVE',
      linkedAt: iso(subDays(base, 45)),
      activePlanStatus: 'ACTIVE',
      lastSessionAt: iso(subDays(base, 5)),
      nextSessionAt: iso(addDays(base, 6)),
    },
  ];
}

function createSessions(base: Date): TrainerSessionRecord[] {
  const baseMorning = new Date(base);
  baseMorning.setHours(8, 0, 0, 0);
  return [
    {
      id: 'session-1',
      clientId: 'client-ana',
      clientName: 'Ana Marques',
      startAt: iso(addDays(baseMorning, 1)),
      endAt: iso(addDays(baseMorning, 1 + 0 / 24)),
      durationMinutes: 60,
      status: 'confirmed',
      attendanceStatus: 'scheduled',
      location: 'Estúdio Norte',
    },
    {
      id: 'session-2',
      clientId: 'client-pedro',
      clientName: 'Pedro Almeida',
      startAt: iso(addDays(baseMorning, 2)),
      endAt: iso(addDays(baseMorning, 2 + 0 / 24)),
      durationMinutes: 55,
      status: 'confirmed',
      attendanceStatus: 'scheduled',
      location: 'Sala Funcional',
    },
    {
      id: 'session-3',
      clientId: 'client-rita',
      clientName: 'Rita Figueiredo',
      startAt: iso(addDays(baseMorning, 4)),
      endAt: iso(addDays(baseMorning, 4 + 0 / 24)),
      durationMinutes: 45,
      status: 'pending',
      attendanceStatus: 'pending',
      location: 'Estúdio Norte',
    },
    {
      id: 'session-4',
      clientId: 'client-nuno',
      clientName: 'Nuno Ribeiro',
      startAt: iso(addDays(baseMorning, 6)),
      endAt: iso(addDays(baseMorning, 6 + 0 / 24)),
      durationMinutes: 60,
      status: 'confirmed',
      attendanceStatus: 'scheduled',
      location: 'Outdoor Parque',
    },
    {
      id: 'session-5',
      clientId: 'client-sofia',
      clientName: 'Sofia Martins',
      startAt: iso(addDays(baseMorning, 8)),
      endAt: iso(addDays(baseMorning, 8 + 0 / 24)),
      durationMinutes: 50,
      status: 'confirmed',
      attendanceStatus: 'scheduled',
      location: 'Box HIIT',
    },
    {
      id: 'session-6',
      clientId: 'client-ana',
      clientName: 'Ana Marques',
      startAt: iso(subDays(baseMorning, 1)),
      endAt: iso(subDays(baseMorning, 1 - 0 / 24)),
      durationMinutes: 60,
      status: 'completed',
      attendanceStatus: 'completed',
      location: 'Estúdio Norte',
    },
    {
      id: 'session-7',
      clientId: 'client-pedro',
      clientName: 'Pedro Almeida',
      startAt: iso(subDays(baseMorning, 2)),
      endAt: iso(subDays(baseMorning, 2 - 0 / 24)),
      durationMinutes: 55,
      status: 'completed',
      attendanceStatus: 'completed',
      location: 'Sala Funcional',
    },
    {
      id: 'session-8',
      clientId: 'client-rita',
      clientName: 'Rita Figueiredo',
      startAt: iso(subDays(baseMorning, 3)),
      endAt: iso(subDays(baseMorning, 3 - 0 / 24)),
      durationMinutes: 45,
      status: 'cancelled',
      attendanceStatus: 'no_show',
      location: 'Estúdio Norte',
    },
    {
      id: 'session-9',
      clientId: 'client-nuno',
      clientName: 'Nuno Ribeiro',
      startAt: iso(subDays(baseMorning, 5)),
      endAt: iso(subDays(baseMorning, 5 - 0 / 24)),
      durationMinutes: 60,
      status: 'completed',
      attendanceStatus: 'completed',
      location: 'Outdoor Parque',
    },
    {
      id: 'session-10',
      clientId: 'client-sofia',
      clientName: 'Sofia Martins',
      startAt: iso(subDays(baseMorning, 6)),
      endAt: iso(subDays(baseMorning, 6 - 0 / 24)),
      durationMinutes: 50,
      status: 'completed',
      attendanceStatus: 'completed',
      location: 'Box HIIT',
    },
  ];
}

function createPlans(base: Date): TrainerPlanRecord[] {
  return [
    {
      id: 'plan-ana',
      clientId: 'client-ana',
      status: 'ACTIVE',
      startDate: iso(subDays(base, 28)),
      endDate: iso(addDays(base, 30)),
      updatedAt: iso(subDays(base, 2)),
      title: 'Plano força funcional',
    },
    {
      id: 'plan-pedro',
      clientId: 'client-pedro',
      status: 'ACTIVE',
      startDate: iso(subDays(base, 14)),
      endDate: iso(addDays(base, 45)),
      updatedAt: iso(subDays(base, 6)),
      title: 'Hipertrofia avançada',
    },
    {
      id: 'plan-rita',
      clientId: 'client-rita',
      status: 'DRAFT',
      startDate: iso(addDays(base, 7)),
      endDate: iso(addDays(base, 70)),
      updatedAt: iso(subDays(base, 1)),
      title: 'Reabilitação joelho',
    },
    {
      id: 'plan-nuno',
      clientId: 'client-nuno',
      status: 'ACTIVE',
      startDate: iso(subDays(base, 7)),
      endDate: iso(addDays(base, 56)),
      updatedAt: iso(subDays(base, 1)),
      title: 'Preparação trail',
    },
    {
      id: 'plan-sofia',
      clientId: 'client-sofia',
      status: 'ACTIVE',
      startDate: iso(subDays(base, 21)),
      endDate: iso(addDays(base, 21)),
      updatedAt: iso(subDays(base, 4)),
      title: 'Mobilidade e estabilidade',
    },
  ];
}

function createApprovals(base: Date): TrainerApprovalRecord[] {
  return [
    {
      id: 'approval-1',
      clientId: 'client-rita',
      clientName: 'Rita Figueiredo',
      requestedAt: iso(subDays(base, 1)),
      status: 'pending',
      type: 'Plano de treino',
      notes: 'Aguardar confirmação para iniciar programa de força.',
    },
    {
      id: 'approval-2',
      clientId: 'client-nuno',
      clientName: 'Nuno Ribeiro',
      requestedAt: iso(subDays(base, 2)),
      status: 'approved',
      type: 'Sessão extra',
      notes: 'Sessão extra ao sábado aprovada.',
    },
    {
      id: 'approval-3',
      clientId: 'client-ana',
      clientName: 'Ana Marques',
      requestedAt: iso(subDays(base, 4)),
      status: 'pending',
      type: 'Actualização avaliação',
      notes: 'Solicitou avaliação de composição corporal.',
    },
    {
      id: 'approval-4',
      clientId: 'client-sofia',
      clientName: 'Sofia Martins',
      requestedAt: iso(subDays(base, 8)),
      status: 'rejected',
      type: 'Alteração plano',
      notes: 'Plano revisto com nova proposta enviada.',
    },
  ];
}

export function getTrainerDashboardFallback(
  trainerId: string,
  trainerName: string | null = 'Treinador',
): TrainerDashboardResponse {
  const now = new Date();
  const clients = createClients(now);
  const sessions = createSessions(now);
  const plans = createPlans(now);
  const approvals = createApprovals(now);

  const source: TrainerDashboardSource = {
    trainerId,
    trainerName,
    now,
    clients,
    sessions,
    plans,
    approvals,
  };

  const data = buildTrainerDashboard(source, { supabase: false });
  return { ...data, source: 'fallback' };
}
