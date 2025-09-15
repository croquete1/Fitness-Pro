// src/app/api/dashboard/stats/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';

type Json = Record<string, number>;

type SB = ReturnType<typeof createServerClient>;

/** Conta com segurança; se falhar, devolve 0 (não rebenta o build) */
async function safeCount(
  sb: SB,
  table: string,
  build?: (q: any) => any
): Promise<number> {
  try {
    let q: any = sb.from(table).select('*', { count: 'exact', head: true });
    if (build) q = build(q);
    const { count } = await q;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function GET(): Promise<Response> {
  const me = await getSessionUserSafe();
  if (!me?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = toAppRole(me.role) ?? 'CLIENT';
  const sb = createServerClient();

  const now = new Date();
  const in7 = new Date(now);
  in7.setDate(now.getDate() + 7);

  let data: Json = {};
  try {
    if (role === 'ADMIN') {
      const [clients, trainers, admins, sessions7d, unreadNotifs] = await Promise.all([
        safeCount(sb, 'users', (q) => q.eq('role', 'CLIENT')),
        safeCount(sb, 'users', (q) => q.eq('role', 'PT')),
        safeCount(sb, 'users', (q) => q.eq('role', 'ADMIN')),
        safeCount(sb, 'sessions', (q) =>
          q.gte('scheduled_at', now.toISOString()).lt('scheduled_at', in7.toISOString())
        ),
        safeCount(sb, 'notifications', (q) => q.eq('user_id', me.id).eq('read', false)),
      ]);
      data = { clients, trainers, admins, sessions7d, unreadNotifs };
    } else if (role === 'PT') {
      const [myClients, myPlans, myUpcoming, unread] = await Promise.all([
        safeCount(sb, 'trainer_clients', (q) => q.eq('trainer_id', me.id)),
        safeCount(sb, 'training_plans', (q) => q.eq('trainer_id', me.id)),
        safeCount(sb, 'sessions', (q) =>
          q.eq('trainer_id', me.id).gte('scheduled_at', now.toISOString()).lt('scheduled_at', in7.toISOString())
        ),
        safeCount(sb, 'notifications', (q) => q.eq('user_id', me.id).eq('read', false)),
      ]);
      data = { myClients, myPlans, myUpcoming, unread };
    } else {
      const [myPlans, myUpcoming, unread] = await Promise.all([
        safeCount(sb, 'training_plans', (q) => q.eq('client_id', me.id)),
        safeCount(sb, 'sessions', (q) =>
          q.eq('client_id', me.id).gte('scheduled_at', now.toISOString()).lt('scheduled_at', in7.toISOString())
        ),
        safeCount(sb, 'notifications', (q) => q.eq('user_id', me.id).eq('read', false)),
      ]);
      data = { myPlans, myUpcoming, unread };
    }
  } catch {
    // fallback super seguro (0 em tudo)
    data ||= {};
  }

  return NextResponse.json({ ok: true, role, stats: data });
}
