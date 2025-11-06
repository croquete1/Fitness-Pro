export type TrainerClientScheduleFallback = {
  id: string;
  name: string;
  goal: string;
  focus: string;
  linkedAt: string;
  lastSessionAt: string | null;
  nextSessionAt: string | null;
};

export function getFallbackTrainerClientOptions(): TrainerClientScheduleFallback[] {
  return [];
}
