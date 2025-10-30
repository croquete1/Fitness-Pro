'use client';

import * as React from 'react';
import useSWR from 'swr';
import { Loader2, Lock, Share2 } from 'lucide-react';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import { formatRelativeTime } from '@/lib/datetime/relative';

type ViewerRole = 'ADMIN' | 'PT';

type ScopeFilter = 'all' | 'shared' | 'mine';

type ApiNote = {
  id: string;
  questionnaireId: string;
  visibility: 'shared' | 'private';
  body: string;
  createdAt: string | null;
  author: {
    id: string;
    name: string | null;
    email: string | null;
  };
  mine: boolean;
};

type ApiResponse = {
  ok: boolean;
  source: 'supabase' | 'fallback';
  generatedAt: string | null;
  notes: ApiNote[];
};

type Props = {
  questionnaireId: string | null;
  viewerRole: ViewerRole;
};

const fetcher = async (url: string): Promise<ApiResponse> => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Não foi possível carregar as notas.');
  }
  return (await response.json()) as ApiResponse;
};

function formatAbsolute(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('pt-PT', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return '—';
  }
}

function describeAuthor(note: ApiNote): string {
  if (note.mine) return 'Tu';
  if (note.author?.name) return note.author.name;
  if (note.author?.email) return note.author.email;
  return 'Utilizador interno';
}

function visibilityVariant(visibility: 'shared' | 'private'): 'success' | 'warning' {
  return visibility === 'shared' ? 'success' : 'warning';
}

function visibilityLabel(visibility: 'shared' | 'private'): string {
  return visibility === 'shared' ? 'Partilhada' : 'Privada';
}

function emptyMessage(filter: ScopeFilter, hasNotes: boolean): string {
  if (!hasNotes) {
    return 'Ainda não existem notas para este questionário.';
  }
  switch (filter) {
    case 'mine':
      return 'Ainda não registaste notas.';
    case 'shared':
      return 'Não há notas partilhadas nesta vista.';
    default:
      return 'Sem notas visíveis com os filtros actuais.';
  }
}

export default function QuestionnaireNotesPanel({ questionnaireId, viewerRole }: Props) {
  const [scope, setScope] = React.useState<ScopeFilter>(viewerRole === 'ADMIN' ? 'all' : 'shared');
  const [visibility, setVisibility] = React.useState<'shared' | 'private'>(viewerRole === 'ADMIN' ? 'shared' : 'shared');
  const [body, setBody] = React.useState('');
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [relativeNow, setRelativeNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    const interval = window.setInterval(() => setRelativeNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const shouldLoad = Boolean(questionnaireId);
  const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse>(
    shouldLoad ? `/api/onboarding/notes?questionnaire_id=${encodeURIComponent(questionnaireId!)}` : null,
    fetcher,
    { refreshInterval: 60_000 },
  );

  const notes = data?.notes ?? [];
  const filteredNotes = React.useMemo(() => {
    if (scope === 'mine') {
      return notes.filter((note) => note.mine);
    }
    if (scope === 'shared') {
      return notes.filter((note) => note.visibility === 'shared' || note.mine);
    }
    return notes;
  }, [notes, scope]);

  const hasNotes = notes.length > 0;
  const emptyState = !filteredNotes.length;

  const disableSubmit = submitting || !body.trim() || !questionnaireId;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!questionnaireId || disableSubmit) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/onboarding/notes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          questionnaire_id: questionnaireId,
          visibility,
          body,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.ok) {
        setSubmitError(payload?.error ?? 'Não foi possível guardar a nota.');
        return;
      }
      setBody('');
      await mutate();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro inesperado ao guardar a nota.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!questionnaireId) {
    return (
      <div className="questionnaire-notes">
        <div className="questionnaire-notes__header">
          <div>
            <h3>Notas operacionais</h3>
            <p>Cria o questionário para poderes registar notas internas.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="questionnaire-notes">
      <div className="questionnaire-notes__header">
        <div className="questionnaire-notes__title">
          <h3>Notas operacionais</h3>
          <p>Centraliza observações internas ligadas à avaliação física deste cliente.</p>
        </div>
        <DataSourceBadge source={data?.source} generatedAt={data?.generatedAt ?? null} />
      </div>

      <form className="questionnaire-notes__form" onSubmit={onSubmit}>
        <div className="questionnaire-notes__field">
          <label htmlFor="questionnaire-note-body" className="questionnaire-notes__label">
            Nova nota
          </label>
          <textarea
            id="questionnaire-note-body"
            className="neo-input neo-input--textarea"
            rows={4}
            maxLength={4000}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Partilha contexto operacional, follow-ups ou alertas a acompanhar."
          />
        </div>

        <div className="questionnaire-notes__formActions">
          <div className="questionnaire-notes__visibility">
            <button
              type="button"
              className="questionnaire-notes__visibilityButton"
              data-active={visibility === 'shared' || undefined}
              onClick={() => setVisibility('shared')}
            >
              <Share2 aria-hidden />
              Partilhada
            </button>
            <button
              type="button"
              className="questionnaire-notes__visibilityButton"
              data-active={visibility === 'private' || undefined}
              onClick={() => setVisibility('private')}
            >
              <Lock aria-hidden />
              Privada
            </button>
          </div>
          <Button type="submit" loading={submitting} disabled={disableSubmit} loadingText="A guardar…">
            Guardar nota
          </Button>
        </div>
        {submitError ? <p className="questionnaire-notes__error">{submitError}</p> : null}
      </form>

      <div className="questionnaire-notes__toolbar">
        <div className="questionnaire-notes__filters" role="tablist" aria-label="Filtrar notas por visibilidade">
          <button
            type="button"
            className="questionnaire-notes__filter"
            data-active={scope === 'all' || undefined}
            onClick={() => setScope('all')}
            role="tab"
            aria-selected={scope === 'all'}
          >
            Tudo
          </button>
          <button
            type="button"
            className="questionnaire-notes__filter"
            data-active={scope === 'shared' || undefined}
            onClick={() => setScope('shared')}
            role="tab"
            aria-selected={scope === 'shared'}
          >
            Partilhadas
          </button>
          <button
            type="button"
            className="questionnaire-notes__filter"
            data-active={scope === 'mine' || undefined}
            onClick={() => setScope('mine')}
            role="tab"
            aria-selected={scope === 'mine'}
          >
            As minhas
          </button>
        </div>
        {isValidating ? (
          <div className="questionnaire-notes__loading" role="status">
            <Loader2 className="questionnaire-notes__spinner" aria-hidden /> A sincronizar…
          </div>
        ) : null}
      </div>

      <div className="questionnaire-notes__list">
        {isLoading ? (
          <div className="questionnaire-notes__empty" role="status">
            <Loader2 className="questionnaire-notes__spinner" aria-hidden /> A carregar notas…
          </div>
        ) : error ? (
          <div className="questionnaire-notes__empty" role="alert">
            Não foi possível carregar as notas. Tenta novamente mais tarde.
          </div>
        ) : emptyState ? (
          <div className="questionnaire-notes__empty">{emptyMessage(scope, hasNotes)}</div>
        ) : (
          filteredNotes.map((note) => {
            const relative = note.createdAt ? formatRelativeTime(note.createdAt, new Date(relativeNow)) : null;
            const absolute = formatAbsolute(note.createdAt);
            return (
              <article key={note.id} className="questionnaire-notes__item">
                <header className="questionnaire-notes__itemHeader">
                  <div className="questionnaire-notes__itemMeta">
                    <span className="questionnaire-notes__author">{describeAuthor(note)}</span>
                    <span className="questionnaire-notes__timestamp">
                      {relative ? `${relative} · ${absolute}` : absolute}
                    </span>
                  </div>
                  <Badge variant={visibilityVariant(note.visibility)}>{visibilityLabel(note.visibility)}</Badge>
                </header>
                <p className="questionnaire-notes__body">{note.body}</p>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
