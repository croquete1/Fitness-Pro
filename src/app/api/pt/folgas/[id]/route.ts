// src/app/api/pt/folgas/[id]/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const meId = (session as any)?.user?.id as string | undefined;
  if (!meId) return new NextResponse('Unauthorized', { status: 401 });

  const sb = createServerClient();
  const { error } = await sb
    .from('trainer_blocks')
    .delete()
    .eq('id', params.id)
    .eq('trainer_id', meId);

  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json({ ok: true });
}
