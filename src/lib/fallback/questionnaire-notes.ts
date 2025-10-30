// src/lib/fallback/questionnaire-notes.ts
import { addMinutes, subMinutes } from 'date-fns';

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

const BASE_REFERENCE = new Date('2025-01-10T12:00:00.000Z');

const BASE_NOTES: QuestionnaireNoteFallback[] = [
  {
    id: 'fallback-note-shared-1',
    questionnaireId: 'placeholder-questionnaire',
    visibility: 'shared',
    body:
      'Cliente respondeu positivamente ao plano semanal. Prioridade em reforçar mobilidade de ombro nas próximas sessões.',
    createdAt: subMinutes(BASE_REFERENCE, 180).toISOString(),
    author: {
      id: 'trainer-ana',
      name: 'Ana Duarte',
      email: 'ana.duarte@neo.hms',
    },
    mine: false,
  },
  {
    id: 'fallback-note-private-1',
    questionnaireId: 'placeholder-questionnaire',
    visibility: 'private',
    body:
      'Observação privada: confirmar exames médicos antes de aumentar intensidade dos sprints. Rever em reunião de sexta.',
    createdAt: subMinutes(BASE_REFERENCE, 90).toISOString(),
    author: {
      id: 'trainer-miguel',
      name: 'Miguel Costa',
      email: 'miguel.costa@neo.hms',
    },
    mine: false,
  },
  {
    id: 'fallback-note-shared-2',
    questionnaireId: 'placeholder-questionnaire',
    visibility: 'shared',
    body: 'Agendar follow-up com nutricionista — cliente mostrou interesse em plano alimentar complementar.',
    createdAt: addMinutes(BASE_REFERENCE, -30).toISOString(),
    author: {
      id: 'coach-luisa',
      name: 'Luísa Matos',
      email: 'luisa.matos@neo.hms',
    },
    mine: false,
  },
];

function ensureViewerNote(options: FallbackOptions, notes: QuestionnaireNoteFallback[]): QuestionnaireNoteFallback[] {
  if (notes.some((note) => note.mine)) {
    return notes;
  }

  const viewerNote: QuestionnaireNoteFallback = {
    id: 'fallback-note-viewer',
    questionnaireId: options.questionnaireId,
    visibility: options.viewerRole === 'ADMIN' ? 'shared' : 'private',
    body:
      options.viewerRole === 'ADMIN'
        ? 'Nota partilhada automaticamente: manter equipa alinhada com métricas de progresso apresentadas no dashboard.'
        : 'Nota privada do operador: registar feedback individual do cliente assim que concluir avaliação.',
    createdAt: addMinutes(BASE_REFERENCE, 15).toISOString(),
    author: {
      id: options.viewerId,
      name: options.viewerRole === 'PT' ? 'Personal Trainer' : 'Operador Neo',
      email: null,
    },
    mine: true,
  };

  return [viewerNote, ...notes];
}

function applyScopeFilter(notes: QuestionnaireNoteFallback[], scope: Scope): QuestionnaireNoteFallback[] {
  if (scope === 'mine') {
    return notes.filter((note) => note.mine);
  }
  if (scope === 'shared') {
    return notes.filter((note) => note.visibility === 'shared' || note.mine);
  }
  return notes;
}

function applyVisibilityFilter(notes: QuestionnaireNoteFallback[], visibility: VisibilityFilter): QuestionnaireNoteFallback[] {
  if (visibility === 'shared') {
    return notes.filter((note) => note.visibility === 'shared');
  }
  if (visibility === 'private') {
    return notes.filter((note) => note.visibility === 'private' && note.mine);
  }
  return notes;
}

export function getQuestionnaireNotesFallback(options: FallbackOptions) {
  const scope = options.scope ?? 'all';
  const visibility = options.visibility ?? 'all';

  const seeded = BASE_NOTES.map((note) => ({
    ...note,
    questionnaireId: options.questionnaireId,
    mine: note.author.id === options.viewerId,
  }));

  const withViewer = ensureViewerNote(options, seeded);
  const scoped = applyScopeFilter(withViewer, scope);
  const filtered = applyVisibilityFilter(scoped, visibility);

  return {
    ok: true as const,
    source: 'fallback' as const,
    generatedAt: options.generatedAt ?? BASE_REFERENCE.toISOString(),
    notes: filtered,
  };
}
