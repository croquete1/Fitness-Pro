// src/app/api/admin/audit-logs/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { Role, AuditKind } from "@prisma/client";

export async function GET(req: Request) {
  const { user, error } = await requireUser([Role.ADMIN]);
  if (error) return error;

  const url = new URL(req.url);
  const take = Math.min(Number(url.searchParams.get("take") || 50), 200);
  const cursor = url.searchParams.get("cursor") || undefined;
  const actorId = url.searchParams.get("actorId") || undefined;
  const kind = (url.searchParams.get("kind") as AuditKind | null) || undefined;
  const targetType = url.searchParams.get("targetType") || undefined;
  const targetId = url.searchParams.get("targetId") || undefined;

  const where = {
    ...(actorId ? { actorId } : {}),
    ...(kind ? { kind } : {}),
    ...(targetType ? { targetType } : {}),
    ...(targetId ? { targetId } : {}),
  };

  const data = await prisma.auditLog.findMany({
    where,
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
  });

  const nextCursor = data.length > take ? data[take].id : null;
  if (nextCursor) data.pop();

  return NextResponse.json({ data, nextCursor });
}
