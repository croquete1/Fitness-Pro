// src/lib/logs.ts
import prisma from "@/lib/prisma";
import { headers as nextHeaders } from "next/headers";
import type { AuditKind } from "@prisma/client";

/* ========= AUDIT LOGS ========= */

export type AuditParams = {
  actorId?: string | null;
  kind: AuditKind;            // obrigatório
  /** Preferir `message`. `action` é aceito como alias retrocompatível. */
  message?: string;
  action?: string;

  targetType?: string | null;
  targetId?: string | null;
  diff?: unknown;

  /** Aceites mas IGNORADOS (a BD não tem estas colunas). */
  ip?: string | null;
  userAgent?: string | null;
};

export async function logAudit(p: AuditParams) {
  const {
    actorId = null,
    kind,
    targetType = null,
    targetId = null,
    diff,
  } = p;

  const message = (p.message ?? p.action ?? "").toString();

  await prisma.auditLog.create({
    data: {
      actorId,
      kind,
      message,                        // Prisma mapeia para coluna "action"
      targetType,
      targetId,
      diff: (diff as any) ?? undefined, // Prisma mapeia para coluna "meta"
      // NÃO enviar ip/userAgent — colunas não existem na BD atual
    },
  });
}

/** IP/User-Agent de cabeçalhos.
 *  Pode ser chamado com `req` (route handler) ou sem argumentos (usa next/headers). */
export function getReqMeta(req?: Request | { headers?: Headers | Record<string, any> }) {
  const h =
    (req?.headers &&
      (typeof (req.headers as any).get === "function"
        ? (req.headers as any)
        : {
            get: (k: string) =>
              (req.headers as any)[k] ??
              (req.headers as any)[k.toLowerCase()],
          })) ||
    nextHeaders();

  const ua = h?.get?.("user-agent") ?? undefined;
  const cf = h?.get?.("cf-connecting-ip") as string | undefined;
  const realIp = h?.get?.("x-real-ip") as string | undefined;
  const xff = h?.get?.("x-forwarded-for") as string | undefined;

  const ip = cf || realIp || (xff ? xff.split(",")[0].trim() : undefined);
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
  /** aceita 'create' | 'update' | 'delete' (ou qualquer string); normalizamos para lowercase */
  changeType: string;
  diff?: unknown;
  snapshot?: unknown;
};

export async function logPlanChange(p: PlanChangeParams) {
  const { planId, actorId = null, diff, snapshot } = p;
  const changeType = String(p.changeType).toLowerCase(); // garante 'create'|'update'|'delete'

  await prisma.trainingPlanChange.create({
    data: {
      planId,
      actorId,
      changeType,
      diff: (diff as any) ?? undefined,
      snapshot: (snapshot as any) ?? undefined,
    },
  });
}
