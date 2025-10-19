export type AdminExerciseRecord = {
  id: string;
  name: string;
  description: string | null;
  muscleGroup: string | null;
  equipment: string | null;
  difficulty: string | null;
  videoUrl: string | null;
  isGlobal: boolean;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  ownerId: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  creatorId: string | null;
  creatorName: string | null;
  creatorEmail: string | null;
};

export type AdminExerciseRow = AdminExerciseRecord & {
  muscleTags: string[];
  equipmentTags: string[];
  audienceLabel: string;
  creatorLabel: string;
  createdLabel: string;
};

export type AdminExercisesHeroMetric = {
  id: string;
  label: string;
  value: string;
  helper?: string;
  tone: 'primary' | 'positive' | 'warning' | 'neutral';
  trend?: {
    direction: 'up' | 'down';
    label: string;
  } | null;
};

export type AdminExercisesTimelinePoint = {
  iso: string;
  label: string;
  created: number;
  published: number;
  global: number;
};

export type AdminExercisesDistributionSegment = {
  key: string;
  label: string;
  count: number;
  share: number;
  tone: 'primary' | 'positive' | 'warning' | 'neutral';
};

export type AdminExercisesHighlight = {
  id: string;
  title: string;
  description: string;
  tone: 'primary' | 'positive' | 'warning' | 'neutral';
};

export type AdminExercisesFacets = {
  muscles: string[];
  equipments: string[];
  difficulties: string[];
};

export type AdminExercisesTable = {
  rows: AdminExerciseRow[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminExercisesDashboardData = {
  generatedAt: string;
  rangeLabel: string;
  hero: AdminExercisesHeroMetric[];
  timeline: AdminExercisesTimelinePoint[];
  difficulties: AdminExercisesDistributionSegment[];
  muscles: AdminExercisesDistributionSegment[];
  equipments: AdminExercisesDistributionSegment[];
  highlights: AdminExercisesHighlight[];
  table: AdminExercisesTable;
  facets: AdminExercisesFacets;
};

export type AdminExercisesDashboardResponse = {
  ok: true;
  data: AdminExercisesDashboardData;
};

export type AdminExercisesDashboardError = {
  ok: false;
  error: string;
};

export type AdminExercisesDashboardResult =
  | AdminExercisesDashboardResponse
  | AdminExercisesDashboardError;

export type AdminExercisesDashboardParams = {
  q?: string;
  scope?: 'all' | 'global' | 'personal';
  published?: 'all' | 'published' | 'draft';
  difficulty?: string;
  equipment?: string;
  muscle?: string;
  range?: '30d' | '90d' | '180d' | '365d';
  page?: number;
  pageSize?: number;
  sort?: 'created_desc' | 'updated_desc' | 'name_asc';
};
