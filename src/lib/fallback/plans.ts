import { buildClientPlansDashboard } from '@/lib/plans/dashboard';
import type { ClientPlan, PlansDashboardData } from '@/lib/plans/types';

function addDays(base: Date, offset: number) {
  return new Date(base.getTime() + offset * 86_400_000);
}

function iso(date: Date) {
  return date.toISOString();
}

const now = new Date();
const base = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30, 0, 0);

const FALLBACK_PLANS: ClientPlan[] = [
  {
    id: 'plan-neo-001',
    title: 'Força funcional avançada',
    status: 'ACTIVE',
    createdAt: iso(addDays(base, -60)),
    updatedAt: iso(addDays(base, -2)),
    startDate: iso(addDays(base, -45)),
    endDate: iso(addDays(base, 30)),
    trainerId: 'trainer-joao',
    trainerName: 'João Martins',
    trainerEmail: 'joao.martins@fitnesspro.pt',
  },
  {
    id: 'plan-neo-002',
    title: 'Recomposição corporal 12 semanas',
    status: 'ACTIVE',
    createdAt: iso(addDays(base, -34)),
    updatedAt: iso(addDays(base, -8)),
    startDate: iso(addDays(base, -28)),
    endDate: iso(addDays(base, 56)),
    trainerId: 'trainer-sara',
    trainerName: 'Sara Costa',
    trainerEmail: 'sara.costa@fitnesspro.pt',
  },
  {
    id: 'plan-neo-003',
    title: 'Base aeróbica e mobilidade',
    status: 'DRAFT',
    createdAt: iso(addDays(base, -12)),
    updatedAt: iso(addDays(base, -5)),
    startDate: iso(addDays(base, 2)),
    endDate: iso(addDays(base, 72)),
    trainerId: 'trainer-joao',
    trainerName: 'João Martins',
    trainerEmail: 'joao.martins@fitnesspro.pt',
  },
  {
    id: 'plan-neo-004',
    title: 'Hipertrofia focada em membros inferiores',
    status: 'ACTIVE',
    createdAt: iso(addDays(base, -96)),
    updatedAt: iso(addDays(base, -33)),
    startDate: iso(addDays(base, -90)),
    endDate: iso(addDays(base, -5)),
    trainerId: 'trainer-sofia',
    trainerName: 'Sofia Almeida',
    trainerEmail: 'sofia.almeida@fitnesspro.pt',
  },
  {
    id: 'plan-neo-005',
    title: 'Regresso pós-maratonas',
    status: 'ARCHIVED',
    createdAt: iso(addDays(base, -140)),
    updatedAt: iso(addDays(base, -9)),
    startDate: iso(addDays(base, -130)),
    endDate: iso(addDays(base, -14)),
    trainerId: 'trainer-tomas',
    trainerName: 'Tomás Nogueira',
    trainerEmail: 'tomas.nogueira@fitnesspro.pt',
  },
  {
    id: 'plan-neo-006',
    title: 'Estabilidade lombar & core',
    status: 'ACTIVE',
    createdAt: iso(addDays(base, -20)),
    updatedAt: iso(addDays(base, -1)),
    startDate: iso(addDays(base, -14)),
    endDate: iso(addDays(base, 42)),
    trainerId: 'trainer-sara',
    trainerName: 'Sara Costa',
    trainerEmail: 'sara.costa@fitnesspro.pt',
  },
  {
    id: 'plan-neo-007',
    title: 'Preparação trail 50K',
    status: 'ACTIVE',
    createdAt: iso(addDays(base, -180)),
    updatedAt: iso(addDays(base, -42)),
    startDate: iso(addDays(base, -176)),
    endDate: iso(addDays(base, -15)),
    trainerId: 'trainer-joao',
    trainerName: 'João Martins',
    trainerEmail: 'joao.martins@fitnesspro.pt',
  },
  {
    id: 'plan-neo-008',
    title: 'Plano de manutenção verão 2024',
    status: 'DRAFT',
    createdAt: iso(addDays(base, -7)),
    updatedAt: iso(addDays(base, -3)),
    startDate: iso(addDays(base, 21)),
    endDate: iso(addDays(base, 84)),
    trainerId: 'trainer-sofia',
    trainerName: 'Sofia Almeida',
    trainerEmail: 'sofia.almeida@fitnesspro.pt',
  },
];

export function getClientPlansFallback(): PlansDashboardData {
  return buildClientPlansDashboard(FALLBACK_PLANS, { supabase: false });
}

export function getClientPlansRowsFallback(): ClientPlan[] {
  return FALLBACK_PLANS;
}
