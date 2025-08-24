// src/app/api/admin/plan-changes/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { Role } from "@prisma/client";

export async function GET(req: Request) {
  const { user, error } = await requireUser([Role.ADMIN]);
  if (error) return error;

  const url = new URL(req.url);
  const take = Math.min(Number(url.searchParams.get("take") || 50), 200);
  const cursor = url.searchParams.get("cursor") || undefined;
  const planId = url.searchParams.get("planId") || undefined;
  const actorId = url.searchParams.get("actorId") || undefined;

  const where = {
    ...(planId ? { planId } : {}),
    ...(actorId ? { actorId } : {}),
  };

  const data = await prisma.trainingPlanChange.findMany({
    where,
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
  });

  const nextCursor = data.length > take ? data[take].id : null;
  if (nextCursor) data.pop();

  return NextResponse.json({ data, nextCursor });
}
