// src/app/api/exercises/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase.server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, isAdmin, isPT } from '@/lib/roles';

type ExerciseRow = {
  id: string;
  name: string;
  muscle_group: string | null;
  equipment: string | null;
  difficulty: string | null;
  // opcionalmente: created_at?: string | null; updated_at?: string | null;
};

function badRequest(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}
function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
function serverError() {
  return NextResponse.json({ error: 'Internal error' }, { status: 500 });
}

/**
 * POST /api/exercises
 * Body: { name: string; muscle_group?: string; equipment?: string; difficulty?: string }
 * Permissões: ADMIN e PT
 */
export async function POST(req: Request) {
  const me = await getSessionUserSafe();
  if (!me?.user?.id) return unauthorized();

  const role = toAppRole(me.user.role) ?? 'CLIENT';
  if (!isAdmin(role) && !isPT(role)) return forbidden();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest('Invalid JSON');
  }

  const name = String(body?.name ?? '').trim();
  if (!name) return badRequest('Missing name');

  const muscle_group = body?.muscle_group ?? null;
  const equipment = body?.equipment ?? null;
  const difficulty = body?.difficulty ?? null;

  const s = supabaseAdmin();
  const insertQ = s
    .from('exercises')
    .insert({ name, muscle_group, equipment, difficulty })
    .select('id,name,muscle_group,equipment,difficulty')
    .limit(1);

  const { data, error } = await insertQ.returns<ExerciseRow[]>();
  if (error) return serverError();

  const exercise = data?.[0] ?? null;
  return NextResponse.json({ ok: true, exercise }, { status: 201 });
}

/**
 * PATCH /api/exercises
 * Body: { id: string; name?: string; muscle_group?: string|null; equipment?: string|null; difficulty?: string|null }
 * Permissões: ADMIN e PT
 */
export async function PATCH(req: Request) {
  const me = await getSessionUserSafe();
  if (!me?.user?.id) return unauthorized();

  const role = toAppRole(me.user.role) ?? 'CLIENT';
  if (!isAdmin(role) && !isPT(role)) return forbidden();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest('Invalid JSON');
  }

  const id = String(body?.id ?? '').trim();
  if (!id) return badRequest('Missing id');

  const update: Record<string, any> = {};
  if ('name' in body) {
    const nm = String(body.name ?? '').trim();
    if (!nm) return badRequest('Missing name');
    update.name = nm;
  }
  if ('muscle_group' in body) update.muscle_group = body.muscle_group ?? null;
  if ('equipment' in body) update.equipment = body.equipment ?? null;
  if ('difficulty' in body) update.difficulty = body.difficulty ?? null;

  if (Object.keys(update).length === 0) {
    return badRequest('No fields to update');
  }

  const s = supabaseAdmin();
  const updQ = s
    .from('exercises')
    .update(update)
    .eq('id', id)
    .select('id,name,muscle_group,equipment,difficulty')
    .limit(1);

  const { data, error } = await updQ.returns<ExerciseRow[]>();
  if (error) return serverError();

  const exercise = data?.[0] ?? null;
  if (!exercise) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, exercise }, { status: 200 });
}

/**
 * DELETE /api/exercises
 * Querystring ou Body: { id: string }  (aceita ?id=... também)
 * Permissões: apenas ADMIN
 */
export async function DELETE(req: Request) {
  const me = await getSessionUserSafe();
  if (!me?.user?.id) return unauthorized();

  const role = toAppRole(me.user.role) ?? 'CLIENT';
  if (!isAdmin(role)) return forbidden(); // PT NÃO pode eliminar

  // aceita id via query (?id=) ou body { id }
  const url = new URL(req.url);
  const qsId = url.searchParams.get('id');

  let bodyId: string | undefined;
  try {
    const b: any = await req.json().catch(() => ({}));
    if (b && typeof b.id !== 'undefined') bodyId = String(b.id ?? '').trim();
  } catch {
    // ignore malformed body; we still might have qsId
  }

  const id = String(qsId ?? bodyId ?? '').trim();
  if (!id) return badRequest('Missing id');

  const s = supabaseAdmin();
  const delQ = s.from('exercises').delete().eq('id', id).select('id').limit(1);

  const { data, error } = await delQ.returns<Pick<ExerciseRow, 'id'>[]>();
  if (error) return serverError();

  const row = data?.[0] ?? null;
  if (!row) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, id: row.id }, { status: 200 });
}
