// src/app/api/admin/plan-changes/route.ts
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/authz';
import { NextResponse } from 'next/server';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const rows = await prisma.trainingPlanChange.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return NextResponse.json({ data: rows });
}
