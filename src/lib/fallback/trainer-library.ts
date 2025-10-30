import { buildTrainerLibraryDashboard } from '@/lib/trainer/library/dashboard';
import type {
  TrainerLibraryDashboardData,
  TrainerLibraryExerciseRecord,
} from '@/lib/trainer/library/types';

function addDays(base: Date, days: number) {
  const date = new Date(base.getTime());
  date.setDate(date.getDate() + days);
  return date;
}

function iso(date: Date) {
  return date.toISOString();
}

type TrainerLibrarySeed = TrainerLibraryExerciseRecord & { trainerId: string };

function seedToRecord(seed: TrainerLibrarySeed): TrainerLibraryExerciseRecord {
  const { trainerId: _trainerId, ...record } = seed;
  return record;
}

const now = new Date();
const base = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0, 0);

const FALLBACK_TRAINER_LIBRARY: TrainerLibrarySeed[] = [
  {
    trainerId: 'trainer-joao',
    id: 'lib-joao-001',
    name: 'Supino com barra',
    description: 'Trabalho de força horizontal com foco em peito e tríceps.',
    scope: 'personal',
    muscleGroup: 'Peito, Tríceps',
    muscleTags: ['Peito', 'Tríceps'],
    equipment: 'Barra olímpica, Banco plano',
    equipmentTags: ['Barra olímpica', 'Banco plano'],
    difficulty: 'advanced',
    difficultyRaw: 'ADVANCED',
    isPublished: true,
    videoUrl: 'https://videos.fitnesspro.pt/exercises/supino-barra.mp4',
    createdAt: iso(addDays(base, -42)),
    updatedAt: iso(addDays(base, -6)),
    ownerId: 'trainer-joao',
  },
  {
    trainerId: 'trainer-joao',
    id: 'lib-joao-002',
    name: 'Remada unilateral',
    description: 'Remada com haltere para foco em dorsais e core anti-rotação.',
    scope: 'personal',
    muscleGroup: 'Dorsal, Core',
    muscleTags: ['Dorsal', 'Core'],
    equipment: 'Halteres, Banco inclinado',
    equipmentTags: ['Halteres', 'Banco inclinado'],
    difficulty: 'intermediate',
    difficultyRaw: 'INTERMEDIATE',
    isPublished: true,
    videoUrl: 'https://videos.fitnesspro.pt/exercises/remada-unilateral.mp4',
    createdAt: iso(addDays(base, -21)),
    updatedAt: iso(addDays(base, -4)),
    ownerId: 'trainer-joao',
  },
  {
    trainerId: 'trainer-joao',
    id: 'lib-joao-003',
    name: 'Agachamento goblet',
    description: 'Variante técnica para principiantes consolidarem o padrão.',
    scope: 'personal',
    muscleGroup: 'Quadríceps, Glúteos',
    muscleTags: ['Quadríceps', 'Glúteos'],
    equipment: 'Kettlebell',
    equipmentTags: ['Kettlebell'],
    difficulty: 'beginner',
    difficultyRaw: 'BEGINNER',
    isPublished: true,
    videoUrl: null,
    createdAt: iso(addDays(base, -12)),
    updatedAt: iso(addDays(base, -2)),
    ownerId: 'trainer-joao',
  },
  {
    trainerId: 'trainer-joao',
    id: 'lib-joao-004',
    name: 'Prancha com elevação alternada',
    description: 'Variante anti-rotação para estabilidade global.',
    scope: 'personal',
    muscleGroup: 'Core, Ombros',
    muscleTags: ['Core', 'Ombros'],
    equipment: 'Peso corporal',
    equipmentTags: ['Peso corporal'],
    difficulty: 'intermediate',
    difficultyRaw: 'INTERMEDIATE',
    isPublished: true,
    videoUrl: 'https://videos.fitnesspro.pt/exercises/prancha-elevacao.mp4',
    createdAt: iso(addDays(base, -8)),
    updatedAt: iso(addDays(base, -1)),
    ownerId: 'trainer-joao',
  },
  {
    trainerId: 'trainer-sofia',
    id: 'lib-sofia-001',
    name: 'Elevação pélvica com miniband',
    description: 'Reforço de glúteo médio com foco em estabilidade pélvica.',
    scope: 'personal',
    muscleGroup: 'Glúteos, Posterior',
    muscleTags: ['Glúteos', 'Posterior'],
    equipment: 'Miniband',
    equipmentTags: ['Miniband'],
    difficulty: 'beginner',
    difficultyRaw: 'BEGINNER',
    isPublished: true,
    videoUrl: null,
    createdAt: iso(addDays(base, -30)),
    updatedAt: iso(addDays(base, -7)),
    ownerId: 'trainer-sofia',
  },
  {
    trainerId: 'trainer-sofia',
    id: 'lib-sofia-002',
    name: 'Puxada alta com corda',
    description: 'Activação de dorsal e deltóide posterior em ritmo controlado.',
    scope: 'personal',
    muscleGroup: 'Dorsal, Deltoide posterior',
    muscleTags: ['Dorsal', 'Deltoide posterior'],
    equipment: 'Máquina cabo',
    equipmentTags: ['Máquina cabo'],
    difficulty: 'intermediate',
    difficultyRaw: 'INTERMEDIATE',
    isPublished: true,
    videoUrl: 'https://videos.fitnesspro.pt/exercises/puxada-corda.mp4',
    createdAt: iso(addDays(base, -18)),
    updatedAt: iso(addDays(base, -5)),
    ownerId: 'trainer-sofia',
  },
  {
    trainerId: 'trainer-sofia',
    id: 'lib-sofia-003',
    name: 'Split squat búlgaro',
    description: 'Desenvolve estabilidade unilateral e mobilidade de anca.',
    scope: 'personal',
    muscleGroup: 'Quadríceps, Glúteos, Core',
    muscleTags: ['Quadríceps', 'Glúteos', 'Core'],
    equipment: 'Banco, Halteres',
    equipmentTags: ['Banco', 'Halteres'],
    difficulty: 'advanced',
    difficultyRaw: 'ADVANCED',
    isPublished: true,
    videoUrl: 'https://videos.fitnesspro.pt/exercises/split-squat-bulgaro.mp4',
    createdAt: iso(addDays(base, -55)),
    updatedAt: iso(addDays(base, -14)),
    ownerId: 'trainer-sofia',
  },
  {
    trainerId: 'catalog-global',
    id: 'lib-global-001',
    name: 'Good morning com barra',
    description: 'Hinge para reforço de cadeia posterior com foco técnico.',
    scope: 'global',
    muscleGroup: 'Posterior, Core',
    muscleTags: ['Posterior', 'Core'],
    equipment: 'Barra olímpica',
    equipmentTags: ['Barra olímpica'],
    difficulty: 'advanced',
    difficultyRaw: 'ADVANCED',
    isPublished: true,
    videoUrl: 'https://videos.fitnesspro.pt/exercises/good-morning.mp4',
    createdAt: iso(addDays(base, -90)),
    updatedAt: iso(addDays(base, -30)),
    ownerId: null,
  },
  {
    trainerId: 'catalog-global',
    id: 'lib-global-002',
    name: 'Bear crawl',
    description: 'Padrão locomotor com foco em core integrado.',
    scope: 'global',
    muscleGroup: 'Core, Ombros',
    muscleTags: ['Core', 'Ombros'],
    equipment: 'Peso corporal',
    equipmentTags: ['Peso corporal'],
    difficulty: 'intermediate',
    difficultyRaw: 'INTERMEDIATE',
    isPublished: true,
    videoUrl: 'https://videos.fitnesspro.pt/exercises/bear-crawl.mp4',
    createdAt: iso(addDays(base, -120)),
    updatedAt: iso(addDays(base, -45)),
    ownerId: null,
  },
  {
    trainerId: 'catalog-global',
    id: 'lib-global-003',
    name: 'Prancha lateral com abdução',
    description: 'Integração de core lateral com estabilização de ombro.',
    scope: 'global',
    muscleGroup: 'Core, Glúteos',
    muscleTags: ['Core', 'Glúteos'],
    equipment: 'Peso corporal',
    equipmentTags: ['Peso corporal'],
    difficulty: 'advanced',
    difficultyRaw: 'ADVANCED',
    isPublished: true,
    videoUrl: 'https://videos.fitnesspro.pt/exercises/prancha-lateral.mp4',
    createdAt: iso(addDays(base, -75)),
    updatedAt: iso(addDays(base, -21)),
    ownerId: null,
  },
  {
    trainerId: 'catalog-global',
    id: 'lib-global-004',
    name: 'Respiração crocodile',
    description: 'Técnica de controlo respiratório e mobilidade costal.',
    scope: 'global',
    muscleGroup: 'Respiratório, Core',
    muscleTags: ['Respiratório', 'Core'],
    equipment: 'Peso corporal',
    equipmentTags: ['Peso corporal'],
    difficulty: 'beginner',
    difficultyRaw: 'BEGINNER',
    isPublished: true,
    videoUrl: null,
    createdAt: iso(addDays(base, -15)),
    updatedAt: iso(addDays(base, -3)),
    ownerId: null,
  },
  {
    trainerId: 'catalog-global',
    id: 'lib-global-005',
    name: 'Mobilidade torácica com foam roller',
    description: 'Sequência de mobilidade torácica para aquecimento.',
    scope: 'global',
    muscleGroup: 'Torácica, Ombros',
    muscleTags: ['Torácica', 'Ombros'],
    equipment: 'Foam roller',
    equipmentTags: ['Foam roller'],
    difficulty: 'beginner',
    difficultyRaw: 'BEGINNER',
    isPublished: true,
    videoUrl: 'https://videos.fitnesspro.pt/exercises/mobilidade-toracica.mp4',
    createdAt: iso(addDays(base, -32)),
    updatedAt: iso(addDays(base, -9)),
    ownerId: null,
  },
];

export function getTrainerLibraryRecordsFallback(trainerId: string): TrainerLibraryExerciseRecord[] {
  const personal = FALLBACK_TRAINER_LIBRARY.filter(
    (seed) => seed.scope === 'personal' && seed.trainerId === trainerId,
  );
  const dataset = personal.length
    ? personal
    : FALLBACK_TRAINER_LIBRARY.filter((seed) => seed.scope === 'personal' && seed.trainerId === 'trainer-joao');

  const catalog = FALLBACK_TRAINER_LIBRARY.filter((seed) => seed.scope === 'global');

  return [...dataset, ...catalog].map(seedToRecord);
}

export function getTrainerLibraryGlobalFallback(): TrainerLibraryExerciseRecord[] {
  return FALLBACK_TRAINER_LIBRARY.filter((seed) => seed.scope === 'global').map(seedToRecord);
}

export function getTrainerLibraryDashboardFallback(trainerId: string): TrainerLibraryDashboardData {
  const records = getTrainerLibraryRecordsFallback(trainerId);
  return buildTrainerLibraryDashboard(records, { supabase: false });
}
