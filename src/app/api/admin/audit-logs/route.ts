// src/app/api/admin/audit-logs/route.ts
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/authz';
import { NextResponse } from 'next/server';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return NextResponse.json({ data: logs });
}
