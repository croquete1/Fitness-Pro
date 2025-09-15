import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET() {
  const session = await getSessionUserSafe();
  const user = (session as any)?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  // role pode ser útil para filtrar banners no futuro
  const _role = toAppRole(user.role) || 'CLIENT';

  const sb = createServerClient();
  const { data, error } = await sb
    .from('dashboard_banners')
    .select('id,title,body,level,href,created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    return NextResponse.json({ items: [] }, { status: 200 });
  }

  return NextResponse.json({ items: data ?? [] }, { status: 200 });
}
