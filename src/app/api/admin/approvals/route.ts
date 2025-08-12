// src/app/api/admin/approvals/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Status } from "@prisma/client";

export const runtime = "nodejs";

// Garante que só ADMIN acede
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as "ADMIN" | "TRAINER" | "CLIENT" | undefined;
  if (!session?.user || role !== "ADMIN") {
    return { ok: false as const, res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true as const };
}

// GET: lista utilizadores pendentes
export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.res;

  const users = await prisma.user.findMany({
    where: { status: Status.PENDING },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ users });
}

// PATCH: { id, action: "approve" | "reject" }
export async function PATCH(req: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.res;

  const body = await req.json().catch(() => null) as { id?: string; action?: string } | null;
  if (!body?.id || !body?.action) {
    return NextResponse.json({ error: "id e action são obrigatórios" }, { status: 400 });
  }

  let newStatus: Status | null = null;
  if (body.action === "approve") newStatus = Status.APPROVED;
  else if (body.action === "reject") newStatus = Status.REJECTED;

  if (!newStatus) {
    return NextResponse.json({ error: "action inválida" }, { status: 400 });
  }

  // só permite mudar quem está pendente (evita aprovar outra coisa por engano)
  const user = await prisma.user.update({
    where: { id: body.id },
    data: { status: newStatus },
    select: { id: true, email: true, name: true, role: true, status: true },
  });

  return NextResponse.json({ user });
}
