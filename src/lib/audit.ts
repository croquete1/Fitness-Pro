// src/lib/audit.ts
import prisma from '@/lib/prisma';

type AuditParams = {
  actorId?: string | null;
  action: string;           // ex: "user.approve", "plan.update"
  target?: string | null;   // ex: "user:UUID", "plan:UUID"
  meta?: Record<string, unknown> | null; // detalhes
};

export async function logAudit({ actorId, action, target, meta }: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: actorId ?? null,
        action,
        target: target ?? null,
        meta: meta ?? undefined,
      },
    });
  } catch (e) {
    // não falhar a request por causa do log
    console.error('auditLog error:', e);
  }
}
