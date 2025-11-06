// src/lib/fallback/questionnaire-notes.ts
import type { AppRole } from '@/lib/roles';

export type QuestionnaireNoteFallback = {
  id: string;
  questionnaireId: string;
  visibility: 'shared' | 'private';
  body: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    email: string | null;
  };
  mine: boolean;
};

type Scope = 'all' | 'shared' | 'mine';
type VisibilityFilter = 'all' | 'shared' | 'private';

type FallbackOptions = {
  questionnaireId: string;
  viewerId: string;
  viewerRole: AppRole;
  scope?: Scope;
  visibility?: VisibilityFilter;
  generatedAt?: string;
};

export function getQuestionnaireNotesFallback(options: FallbackOptions) {
  const generatedAt = options.generatedAt ?? new Date().toISOString();

  return {
    ok: true as const,
    source: 'fallback' as const,
    generatedAt,
    notes: [] as QuestionnaireNoteFallback[],
  };
}
