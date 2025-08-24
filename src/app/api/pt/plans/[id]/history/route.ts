// src/app/api/pt/plans/[id]/history/route.ts
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { user, error } = await requireUser([Role.TRAINER, Role.ADMIN]);
  if (error) return error;

  const plan = await prisma.trainingPlan.findUnique({ where: { id: params.id } });
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (user.role !== "ADMIN" && plan.trainerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const changes = await prisma.trainingPlanChange.findMany({
    where: { planId: params.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: changes });
}
