// src/app/api/pt/training-plans/[id]/meta/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requirePtOrAdminGuard, isGuardErr } from '@/lib/api-guards';

type Body = { title?: string | null; status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' };

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  const guard = await requirePtOrAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof body.title !== 'undefined') updates.title = body.title;
  if (typeof body.status !== 'undefined') updates.status = body.status;

  if (!Object.keys(updates).length) {
    return NextResponse.json({ ok: false, error: 'empty_update' }, { status: 400 });
  }

  const sb = createServerClient();
  const { error } = await sb.from('training_plans' as const).update(updates).eq('id', params.id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
