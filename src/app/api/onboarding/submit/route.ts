// src/app/api/onboarding/submit/route.ts
import { NextResponse } from 'next/server';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { isAdmin } from '@/lib/roles';
import { normalizeQuestionnaireInput, validateQuestionnairePayload } from '@/lib/questionnaire';

export async function POST(req: Request) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido.' }, { status: 400 });
  }

  const targetUserId = typeof body?.user_id === 'string' && body.user_id.trim()
    ? body.user_id.trim()
    : session.user.id;

  const adminViewer = isAdmin(session.user.role);
  if (!adminViewer && targetUserId !== session.user.id) {
    return NextResponse.json({ ok: false, error: 'Sem permissão para editar este registo.' }, { status: 403 });
  }

  const sb = createServerClient();

  const { data: existing, error: existingError } = await sb
    .from('fitness_questionnaire')
    .select('id,status')
    .eq('user_id', targetUserId)
    .maybeSingle();

  if (existingError && existingError.code !== 'PGRST116') {
    console.error('[questionnaire] failed to fetch existing record', existingError);
    return NextResponse.json({ ok: false, error: 'Falha ao carregar registo existente.' }, { status: 500 });
  }

  if (!adminViewer && existing?.status === 'submitted') {
    return NextResponse.json({
      ok: false,
      error: 'O questionário já foi submetido e não pode ser editado pelo cliente.',
    }, { status: 403 });
  }

  const sanitized = normalizeQuestionnaireInput(body);
  const validationErrors = validateQuestionnairePayload(sanitized);
  if (validationErrors.length) {
    return NextResponse.json({ ok: false, error: validationErrors[0] }, { status: 400 });
  }
  const now = new Date().toISOString();

  const upsertPayload = {
    user_id: targetUserId,
    wellbeing_0_to_5: sanitized.wellbeing_0_to_5,
    objective: sanitized.objective,
    job: sanitized.job,
    active: sanitized.active,
    sport: sanitized.sport,
    sport_time: sanitized.sport_time,
    pathologies: sanitized.pathologies,
    schedule: sanitized.schedule,
    metrics: sanitized.metrics,
    status: sanitized.status,
    updated_at: now,
  };

  const { data, error } = await sb
    .from('fitness_questionnaire')
    .upsert(upsertPayload, { onConflict: 'user_id' })
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('[questionnaire] upsert failed', error);
    return NextResponse.json({ ok: false, error: 'Não foi possível guardar o questionário.' }, { status: 500 });
  }

  if (!adminViewer) {
    try {
      const { data: admins } = await sb.from('users').select('id').eq('role', 'ADMIN');
      const items = (admins ?? []).map((admin: any) => ({
        user_id: admin.id,
        title: 'Questionário submetido',
        body: 'Um cliente submeteu a avaliação física.',
        read: false,
        href: '/dashboard/admin',
      }));
      if (items.length) await sb.from('notifications').insert(items);
    } catch (notifyError) {
      console.warn('[questionnaire] notification insert failed', notifyError);
    }
  }

  return NextResponse.json({ ok: true, id: data?.id ?? existing?.id ?? null });
}
