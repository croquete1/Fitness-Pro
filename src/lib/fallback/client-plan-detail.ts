import type { ClientPlanDetail } from '@/lib/client/plans/detail/types';

export function getClientPlanDetailFallback(planId: string): ClientPlanDetail {
  const days = Array.from({ length: 7 }, (_, idx) => ({
    dayIndex: idx,
    items: [] as ClientPlanDetail['days'][number]['items'],
  }));

  days[0].items.push({
    id: `${planId}-d1-squat`,
    dayIndex: 0,
    order: 1,
    exerciseId: 'squat',
    sets: 4,
    reps: '8-10',
    restSeconds: 90,
    notes: 'Mantém o tronco firme e controla a descida.',
    exercise: {
      id: 'exercise-squat',
      name: 'Agachamento com barra',
      gifUrl: 'https://media.fitness-pro.ai/exercises/squat.gif',
      videoUrl: null,
    },
  });

  days[2].items.push({
    id: `${planId}-d3-press`,
    dayIndex: 2,
    order: 1,
    exerciseId: 'press',
    sets: 3,
    reps: '10',
    restSeconds: 75,
    notes: 'Controla a fase excêntrica durante 3 segundos.',
    exercise: {
      id: 'exercise-press',
      name: 'Shoulder press com halteres',
      gifUrl: null,
      videoUrl: 'https://media.fitness-pro.ai/exercises/shoulder-press.mp4',
    },
  });

  days[4].items.push({
    id: `${planId}-d5-row`,
    dayIndex: 4,
    order: 2,
    exerciseId: 'row',
    sets: 4,
    reps: '12',
    restSeconds: 60,
    notes: 'Foca a retração das omoplatas no final do movimento.',
    exercise: {
      id: 'exercise-row',
      name: 'Remada baixa na polia',
      gifUrl: null,
      videoUrl: null,
    },
  });

  return {
    id: planId,
    title: 'Plano funcional — exemplo offline',
    status: 'ACTIVE',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 42 * 86_400_000).toISOString(),
    createdAt: new Date(Date.now() - 14 * 86_400_000).toISOString(),
    clientId: null,
    trainerId: 'trainer-fallback',
    trainerName: 'João Martins',
    trainerEmail: 'joao.martins@fitnesspro.pt',
    days,
  } satisfies ClientPlanDetail;
}
