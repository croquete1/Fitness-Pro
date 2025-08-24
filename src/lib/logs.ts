// src/lib/logs.ts
import prisma from "@/lib/prisma";
import { AuditKind } from "@prisma/client";

function clientIp(req?: Request) {
  const xf = req?.headers.get("x-forwarded-for");
  return xf?.split(",")[0]?.trim() || undefined;
}
function userAgent(req?: Request) {
  return req?.headers.get("user-agent") || undefined;
}

type AuditInput = {
  actorId?: string | null;
  kind: AuditKind;
  message: string;
  targetType?: string | null;
  targetId?: string | null;
  diff?: any;
  req?: Request;
};

export async function logAudit(input: AuditInput) {
  const { actorId, kind, message, targetId, targetType, diff, req } = input;
  try {
    await prisma.auditLog.create({
      data: {
        actorId: actorId ?? undefined,
        kind,
        message,
        targetId: targetId ?? undefined,
        targetType: targetType ?? undefined,
        diff: diff ?? undefined,
        ip: clientIp(req),
        userAgent: userAgent(req),
      },
    });
  } catch (e) {
    // não falha a request se logging falhar
    console.error("auditLog error:", e);
  }
}

type PlanChangeInput = {
  planId: string;
  actorId?: string | null;
  changeType: "CREATE" | "UPDATE" | "DELETE";
  diff?: any;
  snapshot?: any;
};

export async function logPlanChange(input: PlanChangeInput) {
  const { planId, actorId, changeType, diff, snapshot } = input;
  try {
    await prisma.trainingPlanChange.create({
      data: {
        planId,
        actorId: actorId ?? undefined,
        changeType,
        diff: diff ?? undefined,
        snapshot: snapshot ?? undefined,
      },
    });
  } catch (e) {
    console.error("planChangeLog error:", e);
  }
}

/** diff raso (title, notes, status, exercises) */
export function shallowPlanDiff(
  before?: { title?: any; notes?: any; status?: any; exercises?: any },
  after?: { title?: any; notes?: any; status?: any; exercises?: any }
) {
  const keys = ["title", "notes", "status", "exercises"] as const;
  const delta: Record<string, { from: any; to: any }> = {};
  for (const k of keys) {
    const fromV = before?.[k];
    const toV = after?.[k];
    const changed =
      typeof fromV === "object" || typeof toV === "object"
        ? JSON.stringify(fromV) !== JSON.stringify(toV)
        : fromV !== toV;
    if (changed) delta[k] = { from: fromV ?? null, to: toV ?? null };
  }
  return Object.keys(delta).length ? delta : null;
}
