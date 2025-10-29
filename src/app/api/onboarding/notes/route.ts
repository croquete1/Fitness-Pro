// src/app/api/onboarding/notes/route.ts
import { NextResponse } from 'next/server';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';

type NotePayload = {
  questionnaire_id?: unknown;
  visibility?: unknown;
  body?: unknown;
};

const NOTE_VISIBILITY: Record<string, 'private' | 'shared'> = {
  private: 'private',
  shared: 'shared',
};

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
  const body = typeof payload.body === 'string' ? payload.body.trim() : '';

  if (!body) {
    return NextResponse.json({ ok: false, error: 'Adiciona conteúdo à nota.' }, { status: 400 });
  }

  const sb = createServerClient();
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

  return NextResponse.json({ ok: true });
}
