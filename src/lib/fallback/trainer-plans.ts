import { buildTrainerPlansDashboard } from '@/lib/trainer/plans/dashboard';
import type { TrainerPlanRecord, TrainerPlansDashboardData } from '@/lib/trainer/plans/types';

function addDays(base: Date, offset: number) {
  const date = new Date(base);
  date.setDate(date.getDate() + offset);
  return date;
}

function iso(date: Date) {
  return date.toISOString();
}

type TrainerPlanSeed = TrainerPlanRecord & { trainerId: string };

const now = new Date();
const base = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0, 0);

const FALLBACK_TRAINER_PLANS: TrainerPlanSeed[] = [
  {
    trainerId: 'trainer-joao',
    id: 'tp-001',
    title: 'Base de força 8 semanas',
    status: 'ACTIVE',
    clientId: 'client-ana',
    clientName: 'Ana Marques',
    clientEmail: 'ana.marques@fitnesspro.pt',
    startDate: iso(addDays(base, -28)),
    endDate: iso(addDays(base, 28)),
    createdAt: iso(addDays(base, -35)),
    updatedAt: iso(addDays(base, -2)),
  },
  {
    trainerId: 'trainer-joao',
    id: 'tp-002',
    title: 'Hipertrofia membros inferiores',
    status: 'ACTIVE',
    clientId: 'client-pedro',
    clientName: 'Pedro Almeida',
    clientEmail: 'pedro.almeida@fitnesspro.pt',
    startDate: iso(addDays(base, -14)),
    endDate: iso(addDays(base, 42)),
    createdAt: iso(addDays(base, -21)),
    updatedAt: iso(addDays(base, -9)),
  },
  {
    trainerId: 'trainer-joao',
    id: 'tp-003',
    title: 'Recuperação pós-lesão',
    status: 'DRAFT',
    clientId: 'client-rita',
    clientName: 'Rita Figueiredo',
    clientEmail: 'rita.figueiredo@fitnesspro.pt',
    startDate: iso(addDays(base, 6)),
    endDate: iso(addDays(base, 60)),
    createdAt: iso(addDays(base, -3)),
    updatedAt: iso(addDays(base, -1)),
  },
  {
    trainerId: 'trainer-joao',
    id: 'tp-004',
    title: 'Programa mobilidade avançada',
    status: 'ARCHIVED',
    clientId: 'client-nuno',
    clientName: 'Nuno Ribeiro',
    clientEmail: 'nuno.ribeiro@fitnesspro.pt',
    startDate: iso(addDays(base, -120)),
    endDate: iso(addDays(base, -28)),
    createdAt: iso(addDays(base, -150)),
    updatedAt: iso(addDays(base, -25)),
  },
  {
    trainerId: 'trainer-joao',
    id: 'tp-005',
    title: 'Preparação trail 50K',
    status: 'ACTIVE',
    clientId: 'client-ines',
    clientName: 'Inês Carvalho',
    clientEmail: 'ines.carvalho@fitnesspro.pt',
    startDate: iso(addDays(base, -70)),
    endDate: iso(addDays(base, 14)),
    createdAt: iso(addDays(base, -90)),
    updatedAt: iso(addDays(base, -29)),
  },
  {
    trainerId: 'trainer-sofia',
    id: 'tp-006',
    title: 'Reforço de core e estabilidade',
    status: 'ACTIVE',
    clientId: 'client-maria',
    clientName: 'Maria Costa',
    clientEmail: 'maria.costa@fitnesspro.pt',
    startDate: iso(addDays(base, -21)),
    endDate: iso(addDays(base, 35)),
    createdAt: iso(addDays(base, -30)),
    updatedAt: iso(addDays(base, -6)),
  },
  {
    trainerId: 'trainer-sofia',
    id: 'tp-007',
    title: 'Plano manutenção verão',
    status: 'DRAFT',
    clientId: 'client-luis',
    clientName: 'Luís Carvalho',
    clientEmail: 'luis.carvalho@fitnesspro.pt',
    startDate: iso(addDays(base, 10)),
    endDate: iso(addDays(base, 70)),
    createdAt: iso(addDays(base, -1)),
    updatedAt: iso(addDays(base, -1)),
  },
  {
    trainerId: 'trainer-sofia',
    id: 'tp-008',
    title: 'Resistência aeróbica intermédia',
    status: 'ARCHIVED',
    clientId: 'client-joana',
    clientName: 'Joana Faria',
    clientEmail: 'joana.faria@fitnesspro.pt',
    startDate: iso(addDays(base, -200)),
    endDate: iso(addDays(base, -90)),
    createdAt: iso(addDays(base, -220)),
    updatedAt: iso(addDays(base, -95)),
  },
  {
    trainerId: 'trainer-tomas',
    id: 'tp-009',
    title: 'Condicionamento funcional corporativo',
    status: 'ACTIVE',
    clientId: 'client-equipa',
    clientName: 'Equipa Lince',
    clientEmail: 'equipa.lince@fitnesspro.pt',
    startDate: iso(addDays(base, -10)),
    endDate: iso(addDays(base, 90)),
    createdAt: iso(addDays(base, -15)),
    updatedAt: iso(addDays(base, -3)),
  },
  {
    trainerId: 'trainer-tomas',
    id: 'tp-010',
    title: 'Plano detox pós-época',
    status: 'DELETED',
    clientId: 'client-tiago',
    clientName: 'Tiago Neves',
    clientEmail: 'tiago.neves@fitnesspro.pt',
    startDate: iso(addDays(base, -40)),
    endDate: iso(addDays(base, -15)),
    createdAt: iso(addDays(base, -50)),
    updatedAt: iso(addDays(base, -20)),
  },
];

export function getTrainerPlansFallback(trainerId: string): TrainerPlansDashboardData {
  const sample = FALLBACK_TRAINER_PLANS.filter((row) => row.trainerId === trainerId);
  const dataset = (sample.length ? sample : FALLBACK_TRAINER_PLANS.filter((row) => row.trainerId === 'trainer-joao')).map(
    ({ trainerId: _trainerId, ...rest }) => rest,
  );
  return buildTrainerPlansDashboard(dataset, { supabase: false });
}

export function getTrainerPlanRowsFallback(trainerId: string): TrainerPlanRecord[] {
  const sample = FALLBACK_TRAINER_PLANS.filter((row) => row.trainerId === trainerId);
  return (sample.length ? sample : FALLBACK_TRAINER_PLANS.filter((row) => row.trainerId === 'trainer-joao')).map(
    ({ trainerId: _trainerId, ...rest }) => rest,
  );
}
