// src/app/api/pt/scheduler/meta/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  const meId = (session as any)?.user?.id as string | undefined;
  if (!meId) return new NextResponse('Unauthorized', { status: 401 });

  const sb = createServerClient();

  // ids de clientes deste PT (via client_packages)
  const cp = await sb
    .from('client_packages')
    .select('client_id')
    .eq('trainer_id', meId);

  const clientIds = Array.from(new Set((cp.data ?? []).map((r: any) => r.client_id))).filter(Boolean);

  // perfis
  const clients = clientIds.length
    ? (await sb.from('users').select('id,name,email').in('id', clientIds)).data ?? []
    : [];

  // locais do PT
  const locations = (await sb
    .from('trainer_locations')
    .select('id,name,travel_min')
    .eq('trainer_id', meId)
    .order('name', { ascending: true })
  ).data ?? [];

  // folgas do PT (últimos 30 dias em diante – útil para o calendário)
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const blocks = (await sb
    .from('trainer_blocks')
    .select('id,start_at,end_at,title')
    .eq('trainer_id', meId)
    .gte('end_at', since.toISOString())
    .order('start_at', { ascending: true })
  ).data ?? [];

  // política de buffer (dinâmica por local; usa travel_min quando muda de local)
  const buffer = { default_min: 10 };

  return NextResponse.json({ clients, locations, blocks, buffer });
}
