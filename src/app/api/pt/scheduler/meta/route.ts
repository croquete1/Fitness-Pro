import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = toAppRole((session as any)?.user?.role);
  const trainerId = String((session as any)?.user?.id || '');

  if (!trainerId) return new NextResponse('Unauthorized', { status: 401 });
  if (role !== 'PT' && role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const sb = createServerClient();

  const nowIso = new Date().toISOString();

  const [{ data: folgas = [] }, { data: locations = [] }] = await Promise.all([
    sb.from('pt_time_off')
      .select('id,title,start,end')
      .eq('trainer_id', trainerId)
      .gte('end', nowIso)
      .order('start', { ascending: true })
      .limit(8),
    sb.from('pt_locations')
      .select('id,name,travel_min')
      .eq('trainer_id', trainerId)
      .order('name', { ascending: true }),
  ]);

  return NextResponse.json({ folgas, locations });
}
