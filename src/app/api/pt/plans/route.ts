// src/app/api/pt/plans/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { logPlanChange, shallowPlanDiff } from '@/lib/audit';

import { AuditKind, Role } from "@prisma/client";

export async function GET(req: Request) {
  const { user, error } = await requireUser([Role.TRAINER, Role.ADMIN]);
  if (error) return error;

  const url = new URL(req.url);
  const clientId = url.searchParams.get("clientId") || undefined;
  const take = Math.min(Number(url.searchParams.get("take") || 20), 100);
  const cursor = url.searchParams.get("cursor") || undefined;

  const where = {
    ...(clientId ? { clientId } : {}),
    ...(user.role === "TRAINER" ? { trainerId: user.id } : {}), // trainer vê só os seus
  };

  const data = await prisma.trainingPlan.findMany({
    where,
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
  });

  const nextCursor = data.length > take ? data[take].id : null;
  if (nextCursor) data.pop();

  return NextResponse.json({ data, nextCursor });
}

export async function POST(req: Request) {
  const { user, error } = await requireUser([Role.TRAINER, Role.ADMIN]);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const { clientId, title, notes, exercises, status } = body || {};

  if (!clientId || !title || exercises == null) {
    return NextResponse.json({ error: "clientId, title e exercises são obrigatórios" }, { status: 400 });
  }

  // se for TRAINER, força trainerId = user.id
  const trainerId = user.role === "TRAINER" ? user.id : body.trainerId ?? user.id;

  // valida se o client existe
  const client = await prisma.user.findUnique({ where: { id: clientId } });
  if (!client) return NextResponse.json({ error: "Cliente inválido" }, { status: 404 });

  const created = await prisma.trainingPlan.create({
    data: {
      trainerId,
      clientId,
      title,
      notes: notes ?? null,
      exercises,
      status: status ?? "ACTIVE",
    },
  });

  await logPlanChange({
    planId: created.id,
    actorId: user.id,
    changeType: "CREATE",
    diff: shallowPlanDiff(undefined, created),
    snapshot: created,
  });

  await logAudit({
    actorId: user.id,
    kind: AuditKind.ACCOUNT_STATUS_CHANGE, // usa um dos existentes; podes criar outro se quiseres
    message: `PLAN_CREATE ${created.id}`,
    targetType: "TrainingPlan",
    targetId: created.id,
    diff: { clientId, title, status },
    req,
  });

  return NextResponse.json(created, { status: 201 });
}
