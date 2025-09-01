// src/lib/audit.ts
import prisma from '@/lib/prisma';
import { AuditKind } from '@prisma/client';

type TargetType = 'USER' | 'TRAINER_CLIENT' | 'TRAINING_PLAN' | 'AUTH';

export async function auditLog(opts: {
  actorId?: string | null;
  kind: AuditKind;
  message: string;           // texto curto do que aconteceu
  targetType: TargetType;    // <- NUNCA null
  targetId?: string | null;  // id do alvo, quando existir
  target?: string | null;    // texto do alvo (email/nome/etc.)
  diff?: unknown;            // payload opcional
}) {
  return prisma.auditLog.create({
    data: {
      actorId:   opts.actorId ?? null,
      kind:      opts.kind,
      message:   opts.message,     // @map("action") no Prisma
      target:    opts.target ?? null,
      targetId:  opts.targetId ?? null,
      targetType: opts.targetType, // <- OBRIGATÓRIO
      diff:      (opts.diff ?? null) as any,
    },
  });
}