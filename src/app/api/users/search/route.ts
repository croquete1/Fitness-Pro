import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

function onlyDigits(s: string) { return s.replace(/\D/g, ''); }

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const roleStr = (searchParams.get('role') || '').toUpperCase();
  const role = (['ADMIN','TRAINER','CLIENT'] as const).includes(roleStr as any)
    ? (roleStr as keyof typeof Role)
    : undefined;

  if (q.length < 2) return NextResponse.json({ users: [] });

  const digits = onlyDigits(q);
  const where: any = {
    AND: [
      role ? { role } : {},
      {
        OR: [
          { name:  { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          ...(digits.length >= 3
            ? [
                { phone:        { contains: digits } },
                { phoneNumber:  { contains: digits } },
              ]
            : []),
        ],
      },
    ],
  };

  const users = await prisma.user.findMany({
    where,
    select: { id: true, name: true, email: true, role: true, phone: true, phoneNumber: true },
    take: 15,
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ users });
}
