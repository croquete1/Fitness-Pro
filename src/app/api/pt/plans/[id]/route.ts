import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

type SessionUser = { id?: string; role?: string | null };
type SessionLike = { user?: SessionUser } | null;

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const sb = createServerClient();
  const { data, error } = await sb
    .from('training_plans')
    .select('id, title, status, client_id, trainer_id, updated_at, created_at, content')
    .eq('id', params.id)
    .maybeSingle();
  if (error) return new NextResponse(error.message, { status: 500 });
  if (!data) return new NextResponse('Not found', { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = (await getSessionUserSafe()) as SessionLike;
  const me = session?.user;
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });
  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const payload = await req.json().catch(() => null) as Partial<{
    title: string;
    status: string;
    content: unknown;
  }> | null;
  if (!payload) return new NextResponse('Bad request', { status: 400 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from('training_plans')
    .update(payload)
    .eq('id', params.id)
    .select('id, title, status, content, updated_at')
    .maybeSingle();
  if (error) return new NextResponse(error.message, { status: 500 });
  if (!data) return new NextResponse('Not found', { status: 404 });
  return NextResponse.json(data);
}
