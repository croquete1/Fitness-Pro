import type { PlanFeedbackDashboard, PlanFeedbackEntry } from '@/lib/plan-feedback/types';

function nowMinus(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

const SAMPLE_PLAN_ENTRIES: PlanFeedbackEntry[] = [
  {
    id: 'plan-fallback-1',
    scope: 'plan',
    planId: null,
    planTitle: 'Plano força · 8 semanas',
    targetLabel: 'Carga semanal',
    comment:
      'Gostei bastante da distribuição dos treinos desta semana. Consegui cumprir tudo e senti progressos no agachamento.',
    createdAt: nowMinus(3),
    mood: 'positive',
  },
  {
    id: 'plan-fallback-2',
    scope: 'plan',
    planId: null,
    planTitle: 'Fase de definição',
    targetLabel: 'Rotina completa',
    comment:
      'Podemos rever o volume dos treinos de quinta-feira? Ainda fico muito cansado para o finisher com corda.',
    createdAt: nowMinus(8),
    mood: 'neutral',
  },
];

const SAMPLE_DAY_ENTRIES: PlanFeedbackEntry[] = [
  {
    id: 'plan-day-fallback-1',
    scope: 'days',
    planId: null,
    planTitle: 'Plano força · 8 semanas',
    targetLabel: 'Dia B · Pull',
    comment: 'Os últimos dois exercícios ficaram muito longos. Talvez possamos reduzir o número de séries? ',
    createdAt: nowMinus(5),
    mood: 'neutral',
  },
  {
    id: 'plan-day-fallback-2',
    scope: 'days',
    planId: null,
    planTitle: 'Fase de definição',
    targetLabel: 'Dia de cardio',
    comment: 'Consegui fazer todo o bloco mas o HIIT final continua muito intenso, principalmente nas últimas repetições.',
    createdAt: nowMinus(10),
    mood: 'warning',
  },
];

const SAMPLE_EXERCISE_ENTRIES: PlanFeedbackEntry[] = [
  {
    id: 'plan-exercise-fallback-1',
    scope: 'exercises',
    planId: null,
    planTitle: 'Plano força · 8 semanas',
    targetLabel: 'Supino inclinado',
    comment: 'Senti desconforto no ombro direito quando uso mais de 14 kg. Talvez possamos ajustar o ângulo do banco?',
    createdAt: nowMinus(2),
    mood: 'negative',
  },
  {
    id: 'plan-exercise-fallback-2',
    scope: 'exercises',
    planId: null,
    planTitle: 'Fase de definição',
    targetLabel: 'Prancha lateral',
    comment: 'Já consigo manter 45 segundos com boa técnica! Podemos evoluir o desafio na próxima semana.',
    createdAt: nowMinus(6),
    mood: 'positive',
  },
];

export function getPlanFeedbackFallback(clientName?: string | null): PlanFeedbackDashboard {
  const label = clientName?.trim() || 'o cliente';
  return {
    source: 'fallback',
    updatedAt: nowMinus(1),
    plan: SAMPLE_PLAN_ENTRIES.map((entry) => ({
      ...entry,
      comment: entry.comment.replace('cliente', label),
    })),
    days: SAMPLE_DAY_ENTRIES,
    exercises: SAMPLE_EXERCISE_ENTRIES,
  };
}
