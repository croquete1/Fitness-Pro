import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();
  const role = url.searchParams.get('role') as 'TRAINER' | 'CLIENT' | null;

  if (q.length < 2) return NextResponse.json({ users: [] });

  const esc = (s: string) => `%${s.replace(/[%_]/g, (m) => '\\' + m)}%`;
  const qLike = esc(q);
  const digits = q.replace(/\D/g, '');

  const sb = createServerClient();
  let query = sb.from('users').select('id,name,email,role,phone').or(
    [
      `name.ilike.${qLike}`,
      `email.ilike.${qLike}`,
      digits ? `phone.ilike.%${digits}%` : '',
      digits ? `phone_number.ilike.%${digits}%` : '',
    ].filter(Boolean).join(',')
  ).limit(10);

  if (role) query = query.eq('role', role);

  // Se for TRAINER e a pedir CLIENTES, opcionalmente poderíamos restringir aos seus clientes.
  // (mantemos amplo para já; se quiseres, coloco o filtro pelos teus clientes)
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ users: data ?? [] });
}
