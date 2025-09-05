// src/app/api/pt/training-plans/route.ts (POST)  — VERSÃO FINAL
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';
import { notifyUsers } from '@/lib/notify';

type CreateBody = {
  client_id: string;
  title: string;
  notes?: string | null;
  exercises?: unknown;
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole((user as any).role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const body = (await req.json().catch(() => ({}))) as CreateBody;
  if (!body.client_id || !body.title) return new NextResponse('Missing fields', { status: 400 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from('training_plans')
    .insert({
      trainer_id: String(user.id),
      client_id: body.client_id,
      title: body.title,
      notes: body.notes ?? null,
      exercises: body.exercises ?? null,
      status: body.status ?? 'ACTIVE',
    })
    .select('id,trainer_id,client_id,title')
    .single();

  if (error) return new NextResponse(error.message, { status: 500 });

  await notifyUsers([{ userId: data.client_id }], {
    title: 'Novo plano de treino',
    body: `O plano "${data.title}" foi criado pelo teu PT.`,
    url: '/dashboard/my-plan',
    kind: 'plan',
  });

  return NextResponse.json({ ok: true, plan: data });
}
