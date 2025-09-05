// src/app/api/admin/users/bulk-status/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';

type Body = { ids: string[]; status: 'ACTIVE' | 'SUSPENDED' };

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
  if (toAppRole((session.user as any).role) !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  let body: Body;
  try { body = await req.json(); } catch { return new NextResponse('Invalid JSON', { status: 400 }); }
  if (!Array.isArray(body.ids) || body.ids.length === 0) return new NextResponse('No ids', { status: 400 });
  if (!['ACTIVE', 'SUSPENDED'].includes(body.status)) return new NextResponse('Invalid status', { status: 400 });

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from('users')
    .update({ status: body.status })
    .in('id', body.ids)
    .select('id'); // devolve linhas atualizadas

  if (error) return new NextResponse(error.message, { status: 500 });
  const updated = (data ?? []).length;

  return NextResponse.json({ ok: true, updated });
}
