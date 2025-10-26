// src/app/(app)/dashboard/pt/summary/route.ts
import { NextResponse } from 'next/server';
import { createServerClient, MissingSupabaseEnvError } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

export async function GET() {
  const me = await getSessionUserSafe();
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });

  let sb;
  try {
    sb = createServerClient();
  } catch (err) {
    if (err instanceof MissingSupabaseEnvError) {
      return NextResponse.json(
        { message: 'Servidor não está configurado.' },
        { status: 503 }
      );
    }
    throw err;
  }
  const now = new Date();
  const in7 = new Date(now); in7.setDate(now.getDate() + 7);

  async function count(from: string, build?: (q: any) => any) {
    try {
      let q = sb.from(from).select('*', { count: 'exact', head: true });
      if (build) q = build(q);
      const { count } = await q;
      return count ?? 0;
    } catch {
      return 0;
    }
  }

  const [clients, plans, upcoming7d, unread] = await Promise.all([
    count('trainer_clients', q => q.eq('trainer_id', me.id)),
    count('training_plans', q => q.eq('trainer_id', me.id)),
    count('sessions', q => q.eq('trainer_id', me.id).gte('scheduled_at', now.toISOString()).lt('scheduled_at', in7.toISOString())),
    count('notifications', q => q.eq('user_id', me.id).eq('read', false)),
  ]);

  return NextResponse.json({ clients, plans, upcoming7d, unread });
}
