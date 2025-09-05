export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseServer';

type Body = { ids: string[] };

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  let body: Body;
  try { body = await req.json(); } catch { return new NextResponse('Invalid JSON', { status: 400 }); }

  const ids = Array.isArray(body?.ids) ? [...new Set(body.ids.filter(Boolean))] : [];
  if (ids.length === 0) return new NextResponse('No ids', { status: 400 });

  const user_id = String(session.user.id);
  const rows = ids.map((notification_id) => ({ user_id, notification_id }));

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from('notification_reads')
    .upsert(rows, { onConflict: 'user_id,notification_id' });

  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json({ ok: true, marked: ids.length });
}
