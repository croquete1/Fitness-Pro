// src/lib/audit.ts
import prisma from '@/lib/prisma';
import { AuditKind, AuditTargetType } from '@prisma/client';

export type LogAuditInput = {
  actorId: string | null;           // aceita null/anon
  kind: AuditKind;
  message: string;
  targetType: AuditTargetType;      // usa SEMPRE enum em MAIÚSCULAS
  targetId: string | null;
  diff?: unknown;
};

export async function logAudit(input: LogAuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        kind: input.kind,
        message: input.message,
        targetType: input.targetType,
        targetId: input.targetId,
        diff: input.diff as any,
      },
    });
  } catch (err) {
    // Nunca falhar build por causa de auditoria
    console.error('[audit] create failed:', err);
  }
}