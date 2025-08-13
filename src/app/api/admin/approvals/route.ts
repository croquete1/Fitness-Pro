// src/app/api/admin/approvals/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma, Status } from "@prisma/client";
import { isAdmin } from "@/lib/rbac";

export const runtime = "nodejs";

// GET /api/admin/approvals?q=...&page=1&pageSize=10
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isAdmin((session.user as any).role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") || 10)));

  const where: Prisma.UserWhereInput = {
    status: Status.PENDING,
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, createdAt: true, role: true, status: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}

// POST /api/admin/approvals  body: { id: string; action: "approve" | "reject" | "block" }
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isAdmin((session.user as any).role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "JSON inválido" }, { status: 422 });

  const { id, action } = body as { id?: string; action?: string };
  if (!id || !action) {
    return NextResponse.json({ error: "id e action são obrigatórios" }, { status: 400 });
  }

  let newStatus: Status | null = null;
  switch (action) {
    case "approve":
      newStatus = Status.APPROVED;
      break;
    case "reject":
      newStatus = Status.REJECTED;
      break;
    case "block":
      newStatus = Status.BLOCKED;
      break;
    default:
      return NextResponse.json({ error: "action inválida" }, { status: 400 });
  }

  // Atualiza o utilizador
  const user = await prisma.user.update({
    where: { id },
    data: { status: newStatus },
    select: { id: true, email: true, name: true, role: true, status: true },
  });

  // Audit log (usa 'target', não 'targetId')
  const actorId = (session.user as any).id as string | undefined;
  await prisma.auditLog.create({
    data: {
      action: `USER_${newStatus}`,
      actorId: actorId ?? null,
      target: user.id,
      meta: { email: user.email, name: user.name },
    },
  });

  return NextResponse.json({ user });
}
