// src/lib/audit.ts
import prisma from "@/lib/prisma";
import { AuditKind } from "@prisma/client";

/** Extrai IP e User-Agent de um Request (útil em logs de auditoria) */
export function getReqMeta(req: Request) {
  const userAgent = req.headers.get("user-agent") ?? "";
  const xff = req.headers.get("x-forwarded-for");
  const ip =
    xff?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "";
  return { ip, userAgent };
}

/** Diff raso (shallow) entre objetos de plano (title/notes/exercises/status, etc.) */
export function shallowPlanDiff(
  before: Record<string, any>,
  after: Record<string, any>
) {
  const diff: Record<string, { from: any; to: any }> = {};
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
  for (const k of keys) {
    const a = (before ?? {})[k];
    const b = (after ?? {})[k];
    const same =
      (typeof a === "object" || typeof b === "object")
        ? JSON.stringify(a) === JSON.stringify(b)
        : a === b;
    if (!same) diff[k] = { from: a, to: b };
  }
  return diff;
}

/** Parâmetros aceites por logAudit (agora com `kind` opcional) */
export type AuditParams = {
  actorId?: string;
  kind?: AuditKind;         // <- opcional; se não vier, usa default
  message: string;
  targetType?: string;
  targetId?: string;
  diff?: unknown;
  ip?: string | null;
  userAgent?: string | null;
};

/** Escreve na tabela audit_logs (compatível com o teu schema/prisma) */
export async function logAudit(params: AuditParams) {
  await prisma.auditLog.create({
    data: {
      actorId: params.actorId ?? null,
      kind: params.kind ?? AuditKind.ACCOUNT_STATUS_CHANGE,
      message: params.message,
      targetType: params.targetType ?? null,
      targetId: params.targetId ?? null,
      diff: (params.diff ?? null) as any,
      ip: params.ip ?? null,
      userAgent: params.userAgent ?? null,
    },
  });
}

/** Registo de alterações de planos de treino (training_plan_changes) */
export async function logPlanChange(input: {
  planId: string;
  actorId?: string;
  changeType: string;     // "CREATE" | "UPDATE" | "DELETE" | outro texto curto
  diff?: unknown;         // o diff do que mudou
  snapshot?: unknown;     // estado do plano após a alteração
}) {
  await prisma.trainingPlanChange.create({
    data: {
      planId: input.planId,
      actorId: input.actorId ?? null,
      changeType: input.changeType,
      diff: (input.diff ?? null) as any,
      snapshot: (input.snapshot ?? null) as any,
    },
  });
}
