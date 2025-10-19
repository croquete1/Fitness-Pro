import { subDays } from 'date-fns';

export type PTExerciseFallbackRow = {
  id: string;
  name: string;
  muscle_group: string | null;
  equipment: string | null;
  difficulty: string | null;
  updated_at: string;
};

function iso(daysAgo: number) {
  return subDays(new Date(), daysAgo).toISOString();
}

export function getPTExercisesFallback(): PTExerciseFallbackRow[] {
  return [
    {
      id: 'ex-a1',
      name: 'Agachamento com barra',
      muscle_group: 'Inferiores',
      equipment: 'Barra olímpica',
      difficulty: 'Intermédio',
      updated_at: iso(2),
    },
    {
      id: 'ex-a2',
      name: 'Peso morto romeno',
      muscle_group: 'Posteriores',
      equipment: 'Barra + discos',
      difficulty: 'Avançado',
      updated_at: iso(4),
    },
    {
      id: 'ex-a3',
      name: 'Press de ombros sentado',
      muscle_group: 'Ombros',
      equipment: 'Halteres',
      difficulty: 'Intermédio',
      updated_at: iso(6),
    },
    {
      id: 'ex-a4',
      name: 'Remada curvada',
      muscle_group: 'Costas',
      equipment: 'Barra olímpica',
      difficulty: 'Intermédio',
      updated_at: iso(1),
    },
    {
      id: 'ex-a5',
      name: 'Prancha frontal',
      muscle_group: 'Core',
      equipment: 'Peso corporal',
      difficulty: 'Iniciante',
      updated_at: iso(3),
    },
    {
      id: 'ex-a6',
      name: 'Hip thrust',
      muscle_group: 'Glúteos',
      equipment: 'Banco + barra',
      difficulty: 'Intermédio',
      updated_at: iso(5),
    },
    {
      id: 'ex-a7',
      name: 'Sprint em bicicleta ergométrica',
      muscle_group: 'Cardio',
      equipment: 'Bicicleta',
      difficulty: 'Avançado',
      updated_at: iso(8),
    },
    {
      id: 'ex-a8',
      name: 'Flexão diamante',
      muscle_group: 'Peito/Tríceps',
      equipment: 'Peso corporal',
      difficulty: 'Intermédio',
      updated_at: iso(9),
    },
  ];
}
