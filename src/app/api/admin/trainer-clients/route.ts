// src/app/api/admin/trainer-clients/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { isPT, toAppRole } from '@/lib/roles';

type LinkBody = { trainerId: string; clientId: string };

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole((session.user as any).role);
  if (!role) return new NextResponse('Forbidden', { status: 403 });

  let body: LinkBody;
  try { body = await req.json(); } catch { return new NextResponse('Invalid JSON', { status: 400 }); }
  if (!body.trainerId || !body.clientId) return new NextResponse('Missing ids', { status: 400 });

  if (isPT(role) && String(session.user.id) !== body.trainerId) return new NextResponse('Forbidden', { status: 403 });

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from('trainer_clients')
    .upsert({ trainer_id: body.trainerId, client_id: body.clientId }, { onConflict: 'trainer_id,client_id' });

  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole((session.user as any).role);
  if (!role) return new NextResponse('Forbidden', { status: 403 });

  let body: LinkBody;
  try { body = await req.json(); } catch { return new NextResponse('Invalid JSON', { status: 400 }); }
  if (!body.trainerId || !body.clientId) return new NextResponse('Missing ids', { status: 400 });

  if (isPT(role) && String(session.user.id) !== body.trainerId) return new NextResponse('Forbidden', { status: 403 });

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from('trainer_clients')
    .delete()
    .match({ trainer_id: body.trainerId, client_id: body.clientId });

  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json({ ok: true });
}
