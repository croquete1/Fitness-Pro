// src/app/api/admin/approvals/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma, Status } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const page = Number(searchParams.get("page") || 1);
    const pageSize = Math.min(Number(searchParams.get("pageSize") || 20), 100);

    const where: Prisma.UserWhereInput = {
      status: Status.PENDING,
      ...(q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" as Prisma.QueryMode } },
              { name: { contains: q, mode: "insensitive" as Prisma.QueryMode } },
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
  } catch (e: any) {
    return NextResponse.json({ error: "Erro a carregar aprovações", details: String(e?.message || e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "JSON inválido" }, { status: 422 });

    const { id, action } = body as { id?: string; action?: "approve" | "reject" };
    if (!id || !action) return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });

    const newStatus = action === "approve" ? Status.APPROVED : Status.REJECTED;

    const user = await prisma.user.update({
      where: { id },
      data: { status: newStatus },
      select: { id: true, status: true },
    });

    return NextResponse.json({ ok: true, user });
  } catch (e: any) {
    return NextResponse.json({ error: "Erro a atualizar aprovação", details: String(e?.message || e) }, { status: 500 });
  }
}
