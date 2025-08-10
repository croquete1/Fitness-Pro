// src/app/api/admin/approvals/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Status } from "@prisma/client";

export const runtime = "nodejs";

// Lista contas pendentes (para o painel de aprovações)
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { status: Status.PENDING },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ users });
  } catch (e) {
    return NextResponse.json({ error: "Erro ao carregar pendentes" }, { status: 500 });
  }
}

// Aprovar / Rejeitar / Bloquear
export async function POST(req: Request) {
  try {
    const { id, action } = (await req.json()) as { id?: string; action?: string };
    if (!id || !action) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
    }

    const newStatus =
      action === "approve"
        ? Status.APPROVED
        : action === "reject"
        ? Status.REJECTED
        : action === "block"
        ? Status.BLOCKED
        : null;

    if (!newStatus) {
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status: newStatus },
      select: { id: true, email: true, name: true, role: true, status: true },
    });

    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json({ error: "Erro ao atualizar estado" }, { status: 500 });
  }
}
