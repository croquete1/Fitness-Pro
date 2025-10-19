export type TrainerLibraryScope = 'personal' | 'global';

export type TrainerLibraryDifficultyKey =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'unspecified';

export type TrainerLibraryExerciseRecord = {
  id: string;
  name: string;
  description: string | null;
  scope: TrainerLibraryScope;
  muscleGroup: string | null;
  muscleTags: string[];
  equipment: string | null;
  equipmentTags: string[];
  difficulty: TrainerLibraryDifficultyKey;
  difficultyRaw: string | null;
  isPublished: boolean;
  videoUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  ownerId: string | null;
};

export type TrainerLibraryHeroMetric = {
  id: string;
  label: string;
  value: string;
  hint?: string | null;
  trend?: string | null;
  tone?: 'positive' | 'warning' | 'critical' | 'neutral';
};

export type TrainerLibraryTimelinePoint = {
  week: string;
  label: string;
  personal: number;
  global: number;
  total: number;
};

export type TrainerLibraryDistributionStat = {
  id: string;
  label: string;
  count: number;
  percentage: number;
  tone: 'positive' | 'warning' | 'critical' | 'neutral';
};

export type TrainerLibraryHighlight = {
  id: string;
  title: string;
  description: string;
  tone: 'positive' | 'warning' | 'critical' | 'neutral';
  meta?: string | null;
  href?: string | null;
};

export type TrainerLibraryFacet = {
  id: string;
  label: string;
  count: number;
};

export type TrainerLibraryTableRow = {
  id: string;
  name: string;
  description: string | null;
  scope: TrainerLibraryScope;
  scopeLabel: string;
  scopeTone: 'positive' | 'warning' | 'critical' | 'neutral';
  muscleTags: string[];
  equipmentTags: string[];
  muscleGroup: string | null;
  equipment: string | null;
  difficulty: TrainerLibraryDifficultyKey;
  difficultyLabel: string;
  difficultyTone: 'positive' | 'warning' | 'critical' | 'neutral';
  difficultyRaw: string | null;
  createdAt: string | null;
  createdLabel: string;
  createdRelative: string | null;
  updatedAt: string | null;
  updatedLabel: string;
  updatedRelative: string | null;
  videoUrl: string | null;
};

export type TrainerLibraryDashboardData = {
  updatedAt: string;
  supabase: boolean;
  hero: TrainerLibraryHeroMetric[];
  timeline: TrainerLibraryTimelinePoint[];
  difficulties: TrainerLibraryDistributionStat[];
  muscleFocus: TrainerLibraryDistributionStat[];
  highlights: TrainerLibraryHighlight[];
  rows: TrainerLibraryTableRow[];
  facets: {
    muscles: TrainerLibraryFacet[];
    equipments: TrainerLibraryFacet[];
    difficulties: TrainerLibraryFacet[];
  };
};
