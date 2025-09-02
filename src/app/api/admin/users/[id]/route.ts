// src/app/api/admin/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import { logAudit } from '@/lib/audit';

type Body = { status?: string; role?: string };

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const actor = await getSessionUser();
  if (!actor) return new NextResponse('Unauthorized', { status: 401 });

  const actorRole = toAppRole((actor as any).role);
  if (actorRole !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const id = params.id;
  const body = (await req.json().catch(() => ({}))) as Body;

  // Validação & normalização
  const update: Record<string, any> = {};

  if (body.status != null) {
    const s = String(body.status).toUpperCase();
    const allowedStatus = ['PENDING', 'ACTIVE', 'SUSPENDED'];
    if (!allowedStatus.includes(s)) {
      return new NextResponse('Bad Request: invalid status', { status: 400 });
    }
    update.status = s;
  }

  if (body.role != null) {
    const r = toAppRole(body.role); // -> 'ADMIN' | 'TRAINER' | 'CLIENT' | null
    if (!r) return new NextResponse('Bad Request: invalid role', { status: 400 });
    update.role = r;
  }

  if (Object.keys(update).length === 0) {
    return new NextResponse('Bad Request: nothing to update', { status: 400 });
  }

  const supabase = createServerClient();

  // Antes (para diff no audit)
  const { data: before, error: beforeErr } = await supabase
    .from('users')
    .select('id, email, name, status, role')
    .eq('id', id)
    .single();

  if (beforeErr || !before) return new NextResponse('Not Found', { status: 404 });

  // Atualização
  const { data: after, error: updErr } = await supabase
    .from('users')
    .update(update)
    .eq('id', id)
    .select('id, email, name, status, role')
    .single();

  if (updErr || !after) {
    console.error('[admin/users PATCH] supabase update error', updErr);
    return new NextResponse('Failed to update', { status: 500 });
  }

  // Audit (sem a propriedade inválida "target")
  const kind =
    body.status != null
      ? 'ACCOUNT_STATUS_CHANGE'
      : body.role != null
      ? 'ACCOUNT_ROLE_CHANGE'
      : 'ACCOUNT_APPROVAL';

  await logAudit({
    actorId: actor.id,
    kind,
    message: 'Admin atualizou conta do utilizador',
    targetType: 'USER',
    targetId: String(id),
    diff: { before, after },
  });

  return NextResponse.json(after);
}