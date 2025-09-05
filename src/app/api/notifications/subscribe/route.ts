// src/app/api/notifications/subscribe/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';

type Sub = { endpoint: string; keys: { p256dh: string; auth: string } };

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  let body: { subscription: Sub; role?: string | null };
  try { body = await req.json(); } catch { return new NextResponse('Invalid JSON', { status: 400 }); }

  const { subscription } = body;
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth)
    return new NextResponse('Bad subscription', { status: 400 });

  const user_id = String(session.user.id);
  const role = toAppRole((session.user as any).role) ?? null;

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id,
        role: role === 'PT' ? 'TRAINER' : role, // alinhado com DB enum
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      { onConflict: 'endpoint' }
    );

  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json({ ok: true });
}
