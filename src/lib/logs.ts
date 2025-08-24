// src/lib/logs.ts
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { AuditKind, PlanAction } from '@prisma/client';

/* ========= AUDIT LOGS ========= */

export type AuditParams = {
  actorId?: string | null;
  kind: AuditKind;                 // <- OBRIGATÓRIO
  message: string;
  targetType?: string | null;
  targetId?: string | null;
  diff?: unknown;
  ip?: string | null;              // opcional (coluna ip)
  userAgent?: string | null;       // opcional (coluna user_agent)
};

export async function logAudit(p: AuditParams) {
  const {
    actorId = null,
    kind,
    message,
    targetType = null,
    targetId = null,
    diff,
    ip = null,
    userAgent = null,
  } = p;

  await prisma.auditLog.create({
    data: {
      actorId,
      kind,
      message,
      targetType,
      targetId,
      diff: (diff as any) ?? undefined,
      ip,
      userAgent,
    },
  });
}

/** IP/User-Agent de cabeçalhos (Vercel/Edge) */
export function getReqMeta() {
  const h = headers();
  const ua = h.get('user-agent') ?? null;
  const cf = h.get('cf-connecting-ip');
  const realIp = h.get('x-real-ip');
  const xff = h.get('x-forwarded-for');
  const ip = (cf ?? realIp ?? (xff ? xff.split(',')[0].trim() : '') ?? '') || null;
  return { ip, userAgent: ua };
}

/* ========= DIFERENÇAS DE PLANOS ========= */

export function shallowPlanDiff(prev: any, next: any) {
  const out: Record<string, { from: any; to: any }> = {};
  const keys = new Set([...Object.keys(prev ?? {}), ...Object.keys(next ?? {})]);
  for (const k of keys) {
    const a = prev?.[k];
    const b = next?.[k];
    if (JSON.stringify(a) !== JSON.stringify(b)) out[k] = { from: a, to: b };
  }
  return out;
}

/* ========= LOG DE ALTERAÇÕES DE TRAINING PLAN ========= */

export type PlanChangeParams = {
  planId: string;
  actorId?: string | null;
  changeType: string | PlanAction;
  diff?: unknown;
  snapshot?: unknown;
};

export async function logPlanChange(p: PlanChangeParams) {
  const { planId, actorId = null, changeType, diff, snapshot } = p;
  await prisma.trainingPlanChange.create({
    data: {
      planId,
      actorId,
      changeType: typeof changeType === 'string' ? changeType : String(changeType),
      diff: (diff as any) ?? undefined,
      snapshot: (snapshot as any) ?? undefined,
    },
  });
}
