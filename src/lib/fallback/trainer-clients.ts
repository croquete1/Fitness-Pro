import { addDays, subDays } from 'date-fns';

export type TrainerClientScheduleFallback = {
  id: string;
  name: string;
  goal: string;
  focus: string;
  linkedAt: string;
  lastSessionAt: string | null;
  nextSessionAt: string | null;
};

function iso(date: Date): string {
  return date.toISOString();
}

export function getFallbackTrainerClientOptions(): TrainerClientScheduleFallback[] {
  const today = new Date();
  const baseMorning = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0, 0);
  return [
    {
      id: 'client-ana',
      name: 'Ana Marques',
      goal: 'Hipertrofia e performance funcional',
      focus: 'Blocos de força e mobilidade de ombro',
      linkedAt: iso(subDays(today, 180)),
      lastSessionAt: iso(subDays(baseMorning, 2)),
      nextSessionAt: iso(addDays(baseMorning, 1)),
    },
    {
      id: 'client-pedro',
      name: 'Pedro Almeida',
      goal: 'Preparação meia maratona Lisboa',
      focus: 'Gatilhos metabólicos + técnica de corrida',
      linkedAt: iso(subDays(today, 120)),
      lastSessionAt: iso(subDays(baseMorning, 1)),
      nextSessionAt: iso(addDays(baseMorning, 3)),
    },
    {
      id: 'client-sofia',
      name: 'Sofia Martins',
      goal: 'Reforço de core pós-parto',
      focus: 'Estabilidade lombar e progressões de prancha',
      linkedAt: iso(subDays(today, 75)),
      lastSessionAt: iso(subDays(baseMorning, 4)),
      nextSessionAt: iso(addDays(baseMorning, 5)),
    },
    {
      id: 'client-nuno',
      name: 'Nuno Ribeiro',
      goal: 'Performance padel circuito regional',
      focus: 'Padrões rotacionais e sprints curtos',
      linkedAt: iso(subDays(today, 90)),
      lastSessionAt: iso(subDays(baseMorning, 3)),
      nextSessionAt: iso(addDays(baseMorning, 2)),
    },
    {
      id: 'client-rita',
      name: 'Rita Figueiredo',
      goal: 'Redução de massa gorda e postura',
      focus: 'Circuitos HIIT moderados + mobilidade cervical',
      linkedAt: iso(subDays(today, 45)),
      lastSessionAt: iso(subDays(baseMorning, 5)),
      nextSessionAt: null,
    },
  ];
}
