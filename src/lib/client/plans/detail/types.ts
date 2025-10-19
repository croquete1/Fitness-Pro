export type ClientPlanDetailExercise = {
  id: string;
  dayIndex: number;
  order: number | null;
  exerciseId: string;
  sets?: number | null;
  reps?: string | number | null;
  restSeconds?: number | null;
  notes?: string | null;
  exercise?: {
    id: string;
    name: string | null;
    gifUrl?: string | null;
    videoUrl?: string | null;
  } | null;
};

export type ClientPlanDetailDay = {
  dayIndex: number;
  items: ClientPlanDetailExercise[];
};

export type ClientPlanDetail = {
  id: string;
  title: string | null;
  status: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string | null;
  clientId: string | null;
  trainerId: string | null;
  trainerName: string | null;
  trainerEmail: string | null;
  days: ClientPlanDetailDay[];
};
