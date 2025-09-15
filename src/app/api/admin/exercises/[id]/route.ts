import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

type SessionUser = { id?: string; role?: string | null };
type SessionLike = { user?: SessionUser } | null;

type PatchExercise = Partial<{
  title: string;
  description: string | null;
  tags: string[] | null;
  published: boolean;
}>;

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const sb = createServerClient();
  const { data, error } = await sb
    .from('exercises')
    .select('id, title, description, tags, published, created_at, updated_at')
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
  if (role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const body = (await req.json().catch(() => null)) as PatchExercise | null;
  if (!body) return new NextResponse('Bad request', { status: 400 });

  const sb = createServerClient();
  const { data, error } = await sb.from('exercises').update(body).eq('id', params.id).select('*').maybeSingle();
  if (error) return new NextResponse(error.message, { status: 500 });
  if (!data) return new NextResponse('Not found', { status: 404 });
  return NextResponse.json(data);
}
