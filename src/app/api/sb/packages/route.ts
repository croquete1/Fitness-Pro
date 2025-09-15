import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

type PackageRow = {
  id: string;
  user_id: string;
  name: string;
  sessions_total: number;
  sessions_used: number;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | string;
  created_at: string | null;
};

const CreatePackageSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1),
  sessionsTotal: z.number().int().positive(),
});

export async function GET() {
  const session = await getSessionUserSafe();
  const user = (session as any)?.user as { id: string; role?: string | null } | undefined;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole(user.role) ?? 'CLIENT';
  const sb = createServerClient();

  const query =
    role === 'ADMIN'
      ? sb.from('packages').select('id,user_id,name,sessions_total,sessions_used,status,created_at').order('created_at', { ascending: false })
      : sb.from('packages').select('id,user_id,name,sessions_total,sessions_used,status,created_at').eq('user_id', user.id).order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json((data ?? []) as PackageRow[], { status: 200 });
}

export async function POST(req: Request) {
  const session = await getSessionUserSafe();
  const user = (session as any)?.user as { id: string; role?: string | null } | undefined;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole(user.role) ?? 'CLIENT';
  if (role !== 'ADMIN' && role !== 'PT') {
    // só admin/PT podem criar pacotes para clientes
    return new NextResponse('Forbidden', { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = CreatePackageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { userId, name, sessionsTotal } = parsed.data;

  const sb = createServerClient();
  const insert = {
    user_id: userId,
    name,
    sessions_total: sessionsTotal,
    sessions_used: 0,
    status: 'ACTIVE',
  };

  const { data, error } = await sb.from('packages').insert(insert).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id: data?.id }, { status: 201 });
}
