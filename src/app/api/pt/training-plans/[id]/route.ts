// src/app/api/pt/training-plans/[id]/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';
import { notifyUsers } from '@/lib/notify';

// remove recursivamente todas as chaves "notes" para comparar estrutura sem notas
function stripNotesDeep(value: any): any {
  if (Array.isArray(value)) return value.map(stripNotesDeep);
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === 'notes') continue;           // <- ignora notas
      out[k] = stripNotesDeep(v);
    }
    return out;
  }
  return value;
}
const jsonEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

type PatchBody = Partial<{
  title: string;
  notes: string | null;
  exercises: unknown;                // JSON
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
}>;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const appRole = toAppRole((user as any).role) ?? 'CLIENT';

  const planId = params.id;
  const body = (await req.json().catch(() => ({}))) as PatchBody;

  const sb = createServerClient();

  // carregar plano original (para permissões e diff)
  const { data: prev, error: prevErr } = await sb
    .from('training_plans')
    .select('id,trainer_id,client_id,title,notes,exercises,updated_at')
    .eq('id', planId)
    .single();

  if (prevErr) return new NextResponse(prevErr.message, { status: 500 });
  if (!prev) return new NextResponse('Not found', { status: 404 });

  // permissões: ADMIN pode sempre, PT apenas se for o dono do plano
  if (!(appRole === 'ADMIN' || (appRole === 'PT' && String(prev.trainer_id) === String(user.id)))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // construir update só com campos presentes
  const update: Record<string, any> = {};
  if ('title' in body) update.title = body.title;
  if ('notes' in body) update.notes = body.notes;
  if ('exercises' in body) update.exercises = body.exercises;
  if ('status' in body) update.status = body.status;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: true, unchanged: true, plan: prev });
  }

  const { data: next, error: upErr } = await sb
    .from('training_plans')
    .update(update)
    .eq('id', planId)
    .select('id,trainer_id,client_id,title,notes,exercises,updated_at')
    .single();

  if (upErr) return new NextResponse(upErr.message, { status: 500 });

  // ---------- diff & notificações ----------
  const beforeEx = prev.exercises ?? null;
  const afterEx  = ('exercises' in update) ? update.exercises : beforeEx;

  const changedExercises = !jsonEqual(beforeEx, afterEx);
  const changedTitle     = ('title' in update) && update.title !== prev.title;
  const changedNotesTop  = ('notes' in update) && update.notes !== prev.notes;   // notas do plano (top-level)

  // “Só notas dos dias” → apenas mudaram campos "notes" dentro do JSON
  const onlyDayNotesChanged =
    changedExercises &&
    jsonEqual(stripNotesDeep(beforeEx), stripNotesDeep(afterEx));

  // Se nada efetivo mudou (por alguma razão), não notifica.
  const somethingChanged = changedExercises || changedTitle || changedNotesTop || ('status' in update);
  if (somethingChanged) {
    if (onlyDayNotesChanged) {
      await notifyUsers([{ userId: next.client_id }], {
        title: 'Notas do treino atualizadas',
        body: `O teu PT atualizou notas nos dias do plano "${next.title}".`,
        url: '/dashboard/my-plan',
      });
    } else if (changedNotesTop && !changedTitle && !changedExercises) {
      await notifyUsers([{ userId: next.client_id }], {
        title: 'Notas do plano atualizadas',
        body: `O teu PT atualizou as notas do plano "${next.title}".`,
        url: '/dashboard/my-plan',
      });
    } else {
      await notifyUsers([{ userId: next.client_id }], {
        title: 'Plano de treino atualizado',
        body: `O plano "${next.title}" foi atualizado.`,
        url: '/dashboard/my-plan',
      });
    }
  }

  return NextResponse.json({ ok: true, plan: next });
}
