import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

type Params = { params: { id: string } };

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const role = toAppRole((session as any)?.user?.role);
  const trainerId = String((session as any)?.user?.id || '');
  if (!trainerId) return new NextResponse('Unauthorized', { status: 401 });
  if (role !== 'PT' && role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const sb = createServerClient();
  const { error } = await sb.from('pt_time_off').delete().eq('id', params.id).eq('trainer_id', trainerId);
  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json({ ok: true });
}
