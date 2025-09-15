import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

type PlanRow = {
  id: string;
  title: string;
  description: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | string | null;
  trainer_id: string;
  client_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

const CreatePlanSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  clientId: z.string().uuid().optional().nullable(),
});

export async function GET() {
  const session = await getSessionUserSafe();
  const user = (session as any)?.user as { id: string; role?: string | null } | undefined;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const sb = createServerClient();
  const role = toAppRole(user.role) ?? 'CLIENT';

  // PT vê seus planos; ADMIN vê todos.
  const query =
    role === 'ADMIN'
      ? sb.from('training_plans').select('id,title,description,status,trainer_id,client_id,created_at,updated_at').order('updated_at', { ascending: false }).limit(200)
      : sb.from('training_plans').select('id,title,description,status,trainer_id,client_id,created_at,updated_at').eq('trainer_id', user.id).order('updated_at', { ascending: false }).limit(200);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as PlanRow[];
  return NextResponse.json(rows, { status: 200 });
}

export async function POST(req: Request) {
  const session = await getSessionUserSafe();
  const user = (session as any)?.user as { id: string; role?: string | null } | undefined;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole(user.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = CreatePlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, description, clientId } = parsed.data;

  const sb = createServerClient();
  const insert = {
    title,
    description: description ?? null,
    status: 'DRAFT',
    trainer_id: user.id,
    client_id: clientId ?? null,
  };

  const { data, error } = await sb.from('training_plans').insert(insert).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id: data?.id }, { status: 201 });
}
