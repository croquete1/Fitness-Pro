import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const header = 'id,name,email,role,status,createdAt';
  const rows = users.map(
    (u) =>
      `${u.id},"${(u.name ?? '').replace(/"/g,'""')}",${u.email},${u.role},${u.status},${u.createdAt.toISOString()}`
  );
  const csv = [header, ...rows].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="users.csv"',
    },
  });
}
