// src/app/api/pt/plans/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { logAudit, logPlanChange, shallowPlanDiff } from "@/lib/logs";
import { AuditKind, Role } from "@prisma/client";

async function canAccessPlan(planId: string, userId: string, isAdmin: boolean) {
  if (isAdmin) return true;
  const plan = await prisma.trainingPlan.findUnique({ where: { id: planId } });
  if (!plan) return false;
  return plan.trainerId === userId;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { user, error } = await requireUser([Role.TRAINER, Role.ADMIN]);
  if (error) return error;

  const plan = await prisma.trainingPlan.findUnique({ where: { id: params.id } });
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ok = await canAccessPlan(params.id, user.id, user.role === "ADMIN");
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(plan);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { user, error } = await requireUser([Role.TRAINER, Role.ADMIN]);
  if (error) return error;

  const ok = await canAccessPlan(params.id, user.id, user.role === "ADMIN");
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const before = await prisma.trainingPlan.findUnique({ where: { id: params.id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { title, notes, exercises, status } = body || {};

  const updated = await prisma.trainingPlan.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(notes !== undefined ? { notes } : {}),
      ...(exercises !== undefined ? { exercises } : {}),
      ...(status !== undefined ? { status } : {}),
    },
  });

  await logPlanChange({
    planId: updated.id,
    actorId: user.id,
    changeType: "UPDATE",
    diff: shallowPlanDiff(before, updated),
    snapshot: updated,
  });

  await logAudit({
    actorId: user.id,
    kind: AuditKind.ACCOUNT_STATUS_CHANGE,
    message: `PLAN_UPDATE ${updated.id}`,
    targetType: "TrainingPlan",
    targetId: updated.id,
    diff: shallowPlanDiff(before, updated),
    req,
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { user, error } = await requireUser([Role.TRAINER, Role.ADMIN]);
  if (error) return error;

  const ok = await canAccessPlan(params.id, user.id, user.role === "ADMIN");
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const before = await prisma.trainingPlan.findUnique({ where: { id: params.id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.trainingPlan.delete({ where: { id: params.id } });

  await logPlanChange({
    planId: before.id,
    actorId: user.id,
    changeType: "DELETE",
    snapshot: before,
  });

  await logAudit({
    actorId: user.id,
    kind: AuditKind.ACCOUNT_STATUS_CHANGE,
    message: `PLAN_DELETE ${before.id}`,
    targetType: "TrainingPlan",
    targetId: before.id,
    diff: null,
    req,
  });

  return NextResponse.json({ ok: true });
}
