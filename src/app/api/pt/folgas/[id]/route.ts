// src/app/api/pt/folgas/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const meId = (session as any)?.user?.id as string | undefined;
  if (!meId) return new NextResponse('Unauthorized', { status: 401 });

  const { title, start, end } = (await req.json().catch(() => ({}))) as {
    title?: string;
    start?: string;
    end?: string;
  };
  if (!start || !end) return new NextResponse('Dados incompletos', { status: 400 });

  const sb = createServerClient();

  // conflito com sessões/folgas existentes (regra básica)
  // — se tiveres tabela de sessões, coloca aqui uma verificação adicional
  const { error } = await sb
    .from('trainer_blocks')
    .update({ title: title ?? 'Folga', start_at: start, end_at: end })
    .eq('id', params.id)
    .eq('trainer_id', meId)
    .select('id'); // garante row-level access

  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
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
