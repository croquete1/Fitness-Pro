import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

async function safeCount(sb: ReturnType<typeof createServerClient>, table: string, build?: (q: any) => any) {
  try {
    let q = sb.from(table).select('*', { count: 'exact', head: true });
    if (build) q = build(q);
    const { count, error } = await q;
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function GET(): Promise<Response> {
  const me = await getSessionUserSafe();
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole(me.role) ?? 'CLIENT';
  const sb = createServerClient();
  const now = new Date();
  const in7 = new Date(now); in7.setDate(now.getDate() + 7);

  if (role === 'ADMIN') {
    const [clients, trainers, admins, sessions7d, unread] = await Promise.all([
      safeCount(sb, 'users', (q) => q.eq('role', 'CLIENT')),
      safeCount(sb, 'users', (q) => q.eq('role', 'PT')),
      safeCount(sb, 'users', (q) => q.eq('role', 'ADMIN')),
      safeCount(sb, 'sessions', (q) => q.gte('scheduled_at', now.toISOString()).lt('scheduled_at', in7.toISOString())),
      safeCount(sb, 'notifications', (q) => q.eq('user_id', me.id).eq('read', false)),
    ]);
    return NextResponse.json({ ok: true, clients, trainers, admins, sessions7d, unread });
  }

  if (role === 'PT') {
    const [myClients, myPlans, myUpcoming, unread] = await Promise.all([
      safeCount(sb, 'trainer_clients', (q) => q.eq('trainer_id', me.id)),
      safeCount(sb, 'training_plans', (q) => q.eq('trainer_id', me.id)),
      safeCount(sb, 'sessions', (q) => q.eq('trainer_id', me.id)
        .gte('scheduled_at', now.toISOString()).lt('scheduled_at', in7.toISOString())),
      safeCount(sb, 'notifications', (q) => q.eq('user_id', me.id).eq('read', false)),
    ]);
    return NextResponse.json({ ok: true, myClients, myPlans, myUpcoming, unread });
  }

  // CLIENT
  const [myPlans, myUpcoming, unread] = await Promise.all([
    safeCount(sb, 'training_plans', (q) => q.eq('client_id', me.id)),
    safeCount(sb, 'sessions', (q) => q.eq('client_id', me.id)
      .gte('scheduled_at', now.toISOString()).lt('scheduled_at', in7.toISOString())),
    safeCount(sb, 'notifications', (q) => q.eq('user_id', me.id).eq('read', false)),
  ]);
  return NextResponse.json({ ok: true, myPlans, myUpcoming, unread });
}
