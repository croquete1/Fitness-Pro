import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';
import { Role } from '@prisma/client';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({} as any));
  const trainerId = me.role === Role.ADMIN ? (body.trainerId || me.id) : me.id;
  const clientId  = body.clientId;
  if (!clientId) return NextResponse.json({ error: 'client_required' }, { status: 400 });

  const payload: any = {
    trainer_id: trainerId,
    client_id: clientId,
    title: body.title ?? null,
    notes: body.notes ?? null,
    exercises: body.exercises ?? [],
    status: (body.status || 'ACTIVE').toUpperCase(),
  };

  const sb = createServerClient();
  const { data, error } = await sb.from('training_plans').insert(payload).select('id').single();
  if (error || !data) return NextResponse.json({ error: 'create_failed' }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}
