// src/app/api/onboarding/notes/route.ts
import { NextResponse } from 'next/server';

import { toAppRole } from '@/lib/roles';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { supabaseFallbackJson, supabaseUnavailableResponse } from '@/lib/supabase/responses';
import { getQuestionnaireNotesFallback } from '@/lib/fallback/questionnaire-notes';

type NotePayload = {
  questionnaire_id?: unknown;
  visibility?: unknown;
  body?: unknown;
};

const NOTE_VISIBILITY: Record<string, 'private' | 'shared'> = {
  private: 'private',
  shared: 'shared',
};

type ScopeParam = 'all' | 'shared' | 'mine';

function resolveScopeParam(value: string | null | undefined): ScopeParam {
  if (!value) return 'all';
  const normalized = value.trim().toLowerCase();
  if (normalized === 'shared') return 'shared';
  if (normalized === 'mine') return 'mine';
  return 'all';
}

function resolveVisibilityParam(value: string | null | undefined): 'all' | 'shared' | 'private' {
  if (!value) return 'all';
  const normalized = value.trim().toLowerCase();
  if (normalized === 'shared') return 'shared';
  if (normalized === 'private') return 'private';
  return 'all';
}

function sanitizeNoteBody(body: string): string {
  return body.replace(/\s+/g, (match) => (match.includes('\n') ? '\n' : ' ')).trim();
}

export async function GET(req: Request) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const url = new URL(req.url);
  const questionnaireId = (url.searchParams.get('questionnaire_id') ?? '').trim();
  if (!questionnaireId) {
    return NextResponse.json({ ok: false, error: 'Questionário inválido.' }, { status: 400 });
  }

  const scope = resolveScopeParam(url.searchParams.get('scope'));
  const visibilityFilter = resolveVisibilityParam(url.searchParams.get('visibility'));
  const viewerRole = toAppRole(session.user.role) ?? 'CLIENT';
  const generatedAt = new Date().toISOString();

  const sb = tryCreateServerClient();
  if (!sb) {
    return supabaseFallbackJson(
      getQuestionnaireNotesFallback({
        questionnaireId,
        viewerId: session.user.id,
        viewerRole,
        scope,
        visibility: visibilityFilter,
        generatedAt,
      }),
    );
  }

  let query = sb
    .from('fitness_questionnaire_notes')
    .select('id,questionnaire_id,author_id,visibility,body,created_at,author:author_id (id,name,email)')
    .eq('questionnaire_id', questionnaireId)
    .order('created_at', { ascending: false })
    .limit(200);

  if (scope === 'mine') {
    query = query.eq('author_id', session.user.id);
  }
  if (scope === 'shared' || visibilityFilter === 'shared') {
    query = query.eq('visibility', 'shared');
  } else if (visibilityFilter === 'private') {
    query = query.eq('visibility', 'private').eq('author_id', session.user.id);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[questionnaire-notes] fetch failed', error);
    return supabaseFallbackJson(
      getQuestionnaireNotesFallback({
        questionnaireId,
        viewerId: session.user.id,
        viewerRole,
        scope,
        visibility: visibilityFilter,
        generatedAt,
      }),
      { status: 503 },
    );
  }

  const notes = (data ?? []).map((row) => {
    const author = (row as any).author ?? null;
    const authorId = row.author_id ?? author?.id ?? null;
    return {
      id: row.id,
      questionnaireId: row.questionnaire_id,
      visibility: row.visibility === 'shared' ? 'shared' : 'private',
      body: row.body ?? '',
      createdAt: row.created_at,
      author: {
        id: author?.id ?? row.author_id ?? '',
        name: author?.name ?? null,
        email: author?.email ?? null,
      },
      mine: authorId === session.user.id,
    };
  });

  return NextResponse.json({
    ok: true,
    source: 'supabase',
    generatedAt,
    notes,
  });
}

export async function POST(req: Request) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let payload: NotePayload;
  try {
    payload = (await req.json()) as NotePayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido.' }, { status: 400 });
  }

  const questionnaireId = typeof payload.questionnaire_id === 'string' ? payload.questionnaire_id.trim() : '';
  if (!questionnaireId) {
    return NextResponse.json({ ok: false, error: 'Questionário inválido.' }, { status: 400 });
  }

  const visibilityKey = typeof payload.visibility === 'string' ? payload.visibility.trim().toLowerCase() : 'private';
  const visibility = NOTE_VISIBILITY[visibilityKey] ?? 'private';
  const body = typeof payload.body === 'string' ? sanitizeNoteBody(payload.body) : '';

  if (!body) {
    return NextResponse.json({ ok: false, error: 'Adiciona conteúdo à nota.' }, { status: 400 });
  }

  if (body.length > 4000) {
    return NextResponse.json(
      { ok: false, error: 'A nota é demasiado longa (máx. 4000 caracteres).' },
      { status: 400 },
    );
  }

  const sb = tryCreateServerClient();
  if (!sb) {
    return supabaseUnavailableResponse();
  }
  const { error } = await sb.from('fitness_questionnaire_notes').insert({
    questionnaire_id: questionnaireId,
    author_id: session.user.id,
    visibility,
    body,
  });

  if (error) {
    console.error('[questionnaire-notes] insert failed', error);
    return NextResponse.json({ ok: false, error: 'Não foi possível guardar a nota.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, createdAt: new Date().toISOString() });
}
