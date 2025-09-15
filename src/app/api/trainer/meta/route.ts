import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

export async function GET() {
  const session = await getSessionUserSafe();
  const user = (session as any)?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole(user.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const sb = createServerClient();
  const now = new Date();
  const in7 = new Date(now);
  in7.setDate(now.getDate() + 7);

  const [{ count: clients = 0 }, { count: sessions = 0 }] = await Promise.all([
    sb.from('trainer_clients').select('*', { head: true, count: 'exact' }).eq('trainer_id', user.id),
    sb
      .from('sessions')
      .select('*', { head: true, count: 'exact' })
      .eq('trainer_id', user.id)
      .gte('scheduled_at', now.toISOString())
      .lt('scheduled_at', in7.toISOString()),
  ]);

  return NextResponse.json({ clients, upcoming7d: sessions });
}
