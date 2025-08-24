// src/lib/planLog.ts
import prisma from '@/lib/prisma';

export async function logPlanChange(input: {
  planId: string;
  actorId?: string | null;
  changeType: 'create' | 'update' | 'delete';
  diff?: Record<string, unknown>;
  snapshot?: Record<string, unknown>;
}) {
  try {
    await prisma.trainingPlanChange.create({
      data: {
        planId: input.planId,
        actorId: input.actorId ?? null,
        changeType: input.changeType,
        diff: input.diff ? (input.diff as any) : undefined,
        snapshot: input.snapshot ? (input.snapshot as any) : undefined,
      },
    });
  } catch (e) {
    console.error('trainingPlanChange error:', e);
  }
}
