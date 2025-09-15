import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

export async function GET() {
  const session = await getSessionUserSafe();
  const user = (session as any)?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });
  if ((toAppRole(user.role) ?? 'CLIENT') !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from('approval_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}
