import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import { createServerClient } from '@/lib/supabaseServer';

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id || me.role !== Role.ADMIN) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const sb = createServerClient();
  // Aprovar: passa o status do utilizador para ACTIVE
  const { error } = await sb.from('users').update({ status: 'ACTIVE' }).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id || me.role !== Role.ADMIN) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const sb = createServerClient();
  // Rejeitar: marca como SUSPENDED (ou elimina o registo pendente se preferires)
  const { error } = await sb.from('users').update({ status: 'SUSPENDED' }).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
