import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

function forbid() {
  return new NextResponse('Forbidden', { status: 403 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.user?.role || (session as any)?.user?.type;

  if (!session?.user || (role && role !== 'ADMIN')) return forbid();

  const users = await prisma.user.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, email: true, createdAt: true, status: true, role: true },
  });

  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.user?.role || (session as any)?.user?.type;

  if (!session?.user || (role && role !== 'ADMIN')) return forbid();

  const { id, action } = await req.json().catch(() => ({} as any));
  if (!id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const newStatus = action === 'approve' ? 'ACTIVE' : 'SUSPENDED';

  await prisma.user.update({
    where: { id },
    data: { status: newStatus },
  });

  return NextResponse.json({ ok: true });
}
