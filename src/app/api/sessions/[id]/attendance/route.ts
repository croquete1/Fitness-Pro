import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

const BodySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const me = await getSessionUserSafe();
  if (!me?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
  }

  const sb = createServerClient();
  const { data, error } = await sb
    .from('sessions' as any)
    .select('id,trainer_id,client_id,client_attendance_status,client_attendance_at')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
  }

  const role = toAppRole(me.role);
  const canUpdate =
    role === 'ADMIN' ||
    me.id === data.client_id ||
    me.id === data.trainer_id;

  if (!canUpdate) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const nowIso = new Date().toISOString();
  const update = {
    client_attendance_status: parsed.data.status,
    client_attendance_at: nowIso,
  };

  const { error: updateError } = await sb
    .from('sessions' as any)
    .update(update)
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, status: parsed.data.status, at: nowIso });
}
