export type PTExerciseFallbackRow = {
  id: string;
  name: string;
  muscle_group: string | null;
  equipment: string | null;
  difficulty: string | null;
  updated_at: string;
};

export function getPTExercisesFallback(): PTExerciseFallbackRow[] {
  return [];
}
