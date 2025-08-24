// src/app/api/pt/plans/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { Role, AuditKind } from "@prisma/client";
import { logAudit, logPlanChange } from "@/lib/audit"; // <- IMPORT NECESSÁRIO

// Lista planos do utilizador (trainer vê os seus, admin pode ver por query, cliente vê os seus)
export async function GET(req: Request) {
  const { user, error } = await requireUser([Role.TRAINER, Role.ADMIN, Role.CLIENT]);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId") ?? undefined;
  const where =
    user.role === "ADMIN"
      ? { ...(clientId ? { clientId } : {}) }
      : user.role === "TRAINER"
      ? { trainerId: user.id, ...(clientId ? { clientId } : {}) }
      : { clientId: user.id };

  const plans = await prisma.trainingPlan.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ plans });
}

// Cria plano (trainer/admin)
export async function POST(req: Request) {
  const { user, error } = await requireUser([Role.TRAINER, Role.ADMIN]);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const { clientId, title, notes, exercises } = body ?? {};
  if (!clientId || !title) {
    return NextResponse.json({ error: "clientId e title são obrigatórios" }, { status: 400 });
  }

  const created = await prisma.trainingPlan.create({
    data: {
      trainerId: user.id,
      clientId,
      title,
      notes: notes ?? null,
      exercises: exercises ?? [],
    },
  });

  // log de alteração de plano
  await logPlanChange({
    planId: created.id,
    actorId: user.id,
    changeType: "CREATE",
    snapshot: created,
  });

  // audit trail geral
  await logAudit({
    actorId: user.id,
    kind: AuditKind.ACCOUNT_STATUS_CHANGE, // usa um dos teus enums existentes
    message: `PLAN_CREATE ${created.id}`,
    targetType: "TrainingPlan",
    targetId: created.id,
    diff: { after: created },
  });

  return NextResponse.json({ ok: true, plan: created });
}
