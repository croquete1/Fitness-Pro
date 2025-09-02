// src/app/api/admin/trainer-clients/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole((user as any).role);
  if (role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  let trainerId = '';
  let clientId = '';
  try {
    const body = await req.json();
    trainerId = String(body?.trainerId ?? '').trim();
    clientId = String(body?.clientId ?? '').trim();
  } catch {
    // noop
  }
  if (!trainerId || !clientId) {
    return new NextResponse('trainerId e clientId são obrigatórios', { status: 400 });
  }

  const supabase = createServerClient();

  // evita duplicados
  const { data: existing, error: errCheck } = await supabase
    .from('trainer_clients')
    .select('id')
    .eq('trainer_id', trainerId)
    .eq('client_id', clientId)
    .limit(1);

  if (errCheck) {
    return new NextResponse('Erro ao verificar vínculo', { status: 500 });
  }
  if (existing && existing.length > 0) {
    return new NextResponse('Já existe vínculo PT-Cliente', { status: 409 });
  }

  const now = new Date().toISOString();
  const { data: inserted, error: errIns } = await supabase
    .from('trainer_clients')
    .insert({
      trainer_id: trainerId,
      client_id: clientId,
      created_by: user.id,
      created_at: now,
      updated_at: now,
    })
    .select('id')
    .single();

  if (errIns || !inserted) {
    return new NextResponse('Falha ao criar vínculo', { status: 500 });
  }

  await logAudit({
    actorId: user.id,
    kind: 'ACCOUNT_ROLE_CHANGE',
    message: 'Atribuição de cliente ao PT',
    targetType: 'TRAINER_CLIENT', // <- agora válido
    targetId: inserted.id,
    diff: { trainerId, clientId },
  });

  return NextResponse.json({ id: inserted.id, trainerId, clientId });
}