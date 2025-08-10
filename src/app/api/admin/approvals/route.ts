// src/app/api/admin/approvals/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Status } from "@prisma/client";

export const runtime = "nodejs";

// Apenas ADMIN
async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as "ADMIN" | "TRAINER" | "CLIENT" | undefined;
  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

// GET: listar utilizadores pendentes
export async function GET() {
  const forbidden = await ensureAdmin();
  if (forbidden) return forbidden;

  const users = await prisma.user.findMany({
    where: { status: Status.PENDING },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ users });
}

// POST: aprovar/suspender
// body: { id: string, action: "approve" | "suspend" }
export async function POST(req: Request) {
  const forbidden = await ensureAdmin();
  if (forbidden) return forbidden;

  try {
    const { id, action } = await req.json();

    if (!id || (action !== "approve" && action !== "suspend")) {
      return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
    }

    const newStatus = action === "approve" ? Status.APPROVED : Status.SUSPENDED;

    const user = await prisma.user.update({
      where: { id },
      data: { status: newStatus },
      select: { id: true, status: true },
    });

    return NextResponse.json({ ok: true, user });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar utilizador" }, { status: 500 });
  }
}
