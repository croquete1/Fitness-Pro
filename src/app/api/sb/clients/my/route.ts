// src/app/api/sb/clients/my/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';
import { Role } from '@prisma/client';

export async function GET() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const sb = createServerClient();

  // Primeiro buscar relações trainer_clients
  const { data: rels, error: e1 } = await sb
    .from('trainer_clients')
    .select('client_id')
    .eq('trainer_id', me.id);

  if (e1) return NextResponse.json({ error: 'fetch_trainer_clients_failed' }, { status: 500 });
  const ids = [...new Set((rels ?? []).map(r => r.client_id))];
  if (ids.length === 0) return NextResponse.json({ data: [] });

  // Buscar users desses IDs
  const { data: clients, error: e2 } = await sb
    .from('users')
    .select('id,name,email,role')
    .in('id', ids);

  if (e2) return NextResponse.json({ error: 'fetch_users_failed' }, { status: 500 });
  // Apenas clientes
  const out = (clients ?? []).filter(u => u.role === 'CLIENT');
  return NextResponse.json({ data: out });
}
