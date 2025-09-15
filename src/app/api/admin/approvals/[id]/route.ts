import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

type SessionUser = { id?: string; role?: string | null };
type SessionLike = { user?: SessionUser } | null;

type PatchBody = { action: 'approve' | 'reject' };

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = (await getSessionUserSafe()) as SessionLike;
  const user = session?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });
  const role = toAppRole(user.role) ?? 'CLIENT';
  if (role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from('users')
    .select('id, name, email, role, status, created_at')
    .eq('id', params.id)
    .maybeSingle();

  if (error) return new NextResponse(error.message, { status: 500 });
  if (!data) return new NextResponse('Not found', { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = (await getSessionUserSafe()) as SessionLike;
  const admin = session?.user;
  if (!admin?.id) return new NextResponse('Unauthorized', { status: 401 });
  const role = toAppRole(admin.role) ?? 'CLIENT';
  if (role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const body = (await req.json().catch(() => null)) as PatchBody | null;
  if (!body || (body.action !== 'approve' && body.action !== 'reject')) {
    return new NextResponse('Bad request', { status: 400 });
  }

  const newStatus = body.action === 'approve' ? 'ACTIVE' : 'REJECTED';
  const sb = createServerClient();
  const { data, error } = await sb.from('users').update({ status: newStatus }).eq('id', params.id).select('id, status').maybeSingle();
  if (error) return new NextResponse(error.message, { status: 500 });
  if (!data) return new NextResponse('Not found', { status: 404 });
  return NextResponse.json(data);
}
