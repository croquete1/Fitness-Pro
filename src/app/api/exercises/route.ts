import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canManageExercises } from '@/lib/authz';

export async function POST(req: Request) {
  const session = await auth();
  const role = session?.user?.role as any;

  if (!canManageExercises(role)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const body = await req.json();
  // validações mínimas
  const name = (body?.name ?? '').trim();
  if (!name) return new NextResponse('Nome obrigatório', { status: 400 });

  const ex = await prisma.exercise.create({
    data: {
      name,
      category: body.category ?? null,
      description: body.description ?? null,
      mediaUrl: body.mediaUrl ?? null,
      createdById: session!.user!.id,
    },
  });

  return NextResponse.json(ex, { status: 201 });
}
