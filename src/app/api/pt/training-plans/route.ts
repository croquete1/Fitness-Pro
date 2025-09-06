import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import { notifyPlanCreated } from '@/lib/notify';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });
  const role = toAppRole(user.role) || 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const payload = await req.json();
  // payload esperado: { client_id, title, notes?, ... }
  const sb = createServerClient();

  const { data, error } = await sb
    .from('training_plans')
    .insert({
      client_id: payload.client_id,
      trainer_id: user.id,
      title: payload.title,
      notes: payload.notes ?? null,
      status: 'ACTIVE'
    })
    .select('id, client_id')
    .single();

  if (error) return new NextResponse(error.message, { status: 500 });

  // 🔔 notificar cliente
  await notifyPlanCreated(sb, data.client_id, data.id);

  return NextResponse.json({ ok: true, id: data.id });
}
