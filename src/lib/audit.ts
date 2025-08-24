// src/lib/audit.ts
import prisma from '@/lib/prisma';
import type { AuditKind } from '@prisma/client';

export type AuditParams = {
  actorId?: string | null;
  kind: AuditKind;

  // preferir "message"; "action" fica para retrocompat
  message?: string;
  action?: string;

  targetType?: string | null;
  targetId?: string | null;
  target?: string | null;

  diff?: unknown; // payload (diferenças, contexto, etc.)
};

export async function logAudit(params: AuditParams) {
  const message = params.message ?? params.action ?? '';

  await prisma.auditLog.create({
    data: {
      actorId: params.actorId ?? null,
      kind: params.kind,
      message,                           // mapeia para coluna "action" via @map no schema
      targetType: params.targetType ?? null,
      targetId: params.targetId ?? null,
      target: params.target ?? null,
      diff: (params.diff ?? null) as any // mapeia para coluna "meta" via @map no schema
    },
  });
}

// re-export para compat com imports existentes
export { logPlanChange, shallowPlanDiff } from './planLog';
