// src/app/api/pt/plans/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { logPlanChange, shallowPlanDiff } from "@/lib/planLog";
import { Role } from "@prisma/client";

// Verifica se o utilizador pode aceder ao plano
async function canAccessPlan(planId: string, userId: string, isAdmin: boolean) {
  if (isAdmin) return true;
  const p = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    select: { trainerId: true, clientId: true },
  });
  if (!p) return false;
  return p.trainerId === userId || p.clientId === userId;
}

// GET /api/pt/plans/[id]  -> obter um plano
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireUser([Role.ADMIN, Role.TRAINER, Role.CLIENT]);
  if ("error" in guard) return guard.error;
  const { user } = guard;

  const plan = await prisma.trainingPlan.findUnique({ where: { id: params.id } });
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ok = await canAccessPlan(plan.id, user.id!, user.role === Role.ADMIN);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(plan);
}

// PATCH /api/pt/plans/[id]  -> atualizar (parcial)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireUser([Role.ADMIN, Role.TRAINER]);
  if ("error" in guard) return guard.error;
  const { user } = guard;

  const before = await prisma.trainingPlan.findUnique({ where: { id: params.id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ok = await canAccessPlan(before.id, user.id!, user.role === Role.ADMIN);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({} as any));
  const updates: Record<string, any> = {};
  if (typeof body.title === "string") updates.title = body.title;
  if (typeof body.notes === "string" || body.notes === null) updates.notes = body.notes ?? null;
  if (body.exercises !== undefined) updates.exercises = body.exercises; // JSON
  if (typeof body.status === "string") updates.status = body.status;

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
  }

  const diff = shallowPlanDiff(
    { title: before.title, notes: before.notes, exercises: before.exercises, status: before.status },
    {
      title: updates.title ?? before.title,
      notes: "notes" in updates ? updates.notes : before.notes,
      exercises: "exercises" in updates ? updates.exercises : before.exercises,
      status: updates.status ?? before.status,
    }
  );

  const updated = await prisma.trainingPlan.update({
    where: { id: before.id },
    data: updates,
  });

  // log de alteração de plano
  await logPlanChange({
    planId: updated.id,
    actorId: user.id!,
    changeType: "update", // <- minúsculas
    diff,
    snapshot: {
      id: updated.id,
      title: updated.title,
      notes: updated.notes,
      exercises: updated.exercises,
      status: updated.status,
      trainerId: updated.trainerId,
      clientId: updated.clientId,
      updatedAt: updated.updatedAt,
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/pt/plans/[id]  -> soft-delete (status = DELETED)
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireUser([Role.ADMIN, Role.TRAINER]);
  if ("error" in guard) return guard.error;
  const { user } = guard;

  const before = await prisma.trainingPlan.findUnique({ where: { id: params.id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ok = await canAccessPlan(before.id, user.id!, user.role === Role.ADMIN);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updated = await prisma.trainingPlan.update({
    where: { id: before.id },
    data: { status: "DELETED" },
  });

  await logPlanChange({
    planId: updated.id,
    actorId: user.id!,
    changeType: "delete", // <- minúsculas
    diff: { from: { status: before.status }, to: { status: "DELETED" } },
    snapshot: {
      id: updated.id,
      title: updated.title,
      notes: updated.notes,
      exercises: updated.exercises,
      status: updated.status,
      trainerId: updated.trainerId,
      clientId: updated.clientId,
      updatedAt: updated.updatedAt,
    },
  });

  return NextResponse.json({ ok: true });
}
