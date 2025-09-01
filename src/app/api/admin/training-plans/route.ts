// src/app/api/admin/training-plans/route.ts
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole, isAdmin } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const user = await getSessionUser();
  const role = user ? toAppRole((user as any).role) : null;
  if (!user?.id || !role || !isAdmin(role)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return new NextResponse('Bad Request', { status: 400 });
  }

  const title = String(body?.title ?? '').trim();
  if (!title) return new NextResponse('Título obrigatório', { status: 400 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from('training_plans')
    .insert([
      {
        title,
        status: 'ACTIVE',      // podes mudar para 'DRAFT' se preferires
        trainer_id: null,      // sem PT => é template global
        client_id: null,       // sem cliente
      },
    ])
    .select('id,title,status,updated_at,trainer_id,client_id')
    .limit(1)
    .single();

  if (error) {
    return new NextResponse(error.message || 'Erro ao criar template', { status: 500 });
  }

  return NextResponse.json(data);
}

export async function GET() {
  const user = await getSessionUser();
  const role = user ? toAppRole((user as any).role) : null;
  if (!user?.id || !role || !isAdmin(role)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const sb = createServerClient();
  const { data, error } = await sb
    .from('training_plans')
    .select('id,title,status,updated_at,trainer_id,client_id')
    .is('trainer_id', null)
    .is('client_id', null)
    .order('updated_at', { ascending: false })
    .limit(100);

  if (error) {
    return new NextResponse(error.message || 'Erro ao listar templates', { status: 500 });
  }

  return NextResponse.json(data ?? []);
}