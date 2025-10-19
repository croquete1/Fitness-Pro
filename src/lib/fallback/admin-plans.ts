import { subDays } from 'date-fns';

export type AdminPlanFallbackRow = {
  id: string;
  name: string;
  description: string;
  difficulty: 'Iniciante' | 'Intermédio' | 'Avançado' | 'Especializado';
  duration_weeks: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

function iso(daysAgo: number) {
  return subDays(new Date(), daysAgo).toISOString();
}

export function getAdminPlansFallback(): AdminPlanFallbackRow[] {
  return [
    {
      id: 'plan-pt-strength',
      name: 'Força Total 12 semanas',
      description: 'Progresso focado em padrões básicos com ênfase em agachamento, supino e peso morto.',
      difficulty: 'Avançado',
      duration_weeks: 12,
      is_public: true,
      created_at: iso(24),
      updated_at: iso(2),
    },
    {
      id: 'plan-pt-fatloss',
      name: 'Definição Metabólica 8 semanas',
      description: 'Blocos híbridos de HIIT, resistência e core para clientes com objectivo de recomposição.',
      difficulty: 'Intermédio',
      duration_weeks: 8,
      is_public: true,
      created_at: iso(31),
      updated_at: iso(5),
    },
    {
      id: 'plan-pt-starter',
      name: 'Fundamentos Funcionais 6 semanas',
      description: 'Programa de iniciação com reforço de mobilidade, estabilidade e padrões básicos.',
      difficulty: 'Iniciante',
      duration_weeks: 6,
      is_public: false,
      created_at: iso(45),
      updated_at: iso(14),
    },
    {
      id: 'plan-pt-athlete',
      name: 'Preparação Pré-Época 10 semanas',
      description: 'Periodização para atletas amadores com foco em potência, velocidade e agilidade.',
      difficulty: 'Avançado',
      duration_weeks: 10,
      is_public: false,
      created_at: iso(58),
      updated_at: iso(9),
    },
    {
      id: 'plan-pt-postural',
      name: 'Correção Postural 9 semanas',
      description: 'Enfoque em fortalecimento do core, mobilidade torácica e estabilidade escapular.',
      difficulty: 'Intermédio',
      duration_weeks: 9,
      is_public: true,
      created_at: iso(63),
      updated_at: iso(12),
    },
    {
      id: 'plan-pt-hybrid',
      name: 'Híbrido Força + Cardio 16 semanas',
      description: 'Macro-ciclo dividido em fases de força máxima, hipertrofia e capacidade aeróbia.',
      difficulty: 'Especializado',
      duration_weeks: 16,
      is_public: false,
      created_at: iso(72),
      updated_at: iso(3),
    },
    {
      id: 'plan-pt-endurance',
      name: 'Resistência Progressiva 14 semanas',
      description: 'Integração de sessões em pista, ginásio e mobilidade com controlo de carga semanal.',
      difficulty: 'Avançado',
      duration_weeks: 14,
      is_public: true,
      created_at: iso(88),
      updated_at: iso(7),
    },
    {
      id: 'plan-pt-recovery',
      name: 'Reforço Pós-Lesão 5 semanas',
      description: 'Microciclos de readaptação com progressões controladas para retorno à carga.',
      difficulty: 'Iniciante',
      duration_weeks: 5,
      is_public: false,
      created_at: iso(19),
      updated_at: iso(4),
    },
  ];
}
