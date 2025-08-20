import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

function json(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.user;

  if (!me) return json('Unauthorized', 401);
  const myRole = me.role || me.type;
  if (myRole !== 'ADMIN') return json('Forbidden', 403);

  const targetId = params.id;
  const body = await req.json().catch(() => ({} as any));
  const { name, role, status } = body as {
    name?: string;
    role?: 'ADMIN' | 'TRAINER' | 'CLIENT';
    status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  };

  // 🚫 Auto-rebaixamento/desativação
  if (targetId === me.id) {
    if (role && role !== 'ADMIN') {
      return json('Não pode alterar o seu próprio papel para algo diferente de ADMIN.');
    }
    if (status && status !== 'ACTIVE') {
      return json('Não pode desativar/suspender a sua própria conta.');
    }
  }

  const data: any = {};
  if (typeof name === 'string') data.name = name;
  if (role) data.role = role;
  if (status) data.status = status;

  if (Object.keys(data).length === 0) {
    return json('Nada para atualizar.');
  }

  const updated = await prisma.user.update({
    where: { id: targetId },
    data,
    select: { id: true, name: true, email: true, role: true, status: true, updatedAt: true },
  });

  return NextResponse.json(updated);
}
