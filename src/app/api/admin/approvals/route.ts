import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Role, Status } from "@prisma/client";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") return null;
  return session.user as any;
}

// GET /api/admin/approvals
// Lista utilizadores com status PENDING (exclui ADMIN)
export async function GET(_req: NextRequest) {
  const me = await requireAdmin();
  if (!me) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const users = await prisma.user.findMany({
    where: {
      status: Status.PENDING,
      NOT: { role: Role.ADMIN },
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, data: users });
}

// POST /api/admin/approvals
// Body: { id: string, action: "approve" | "reject", newRole?: "TRAINER" | "CLIENT" }
export async function POST(req: NextRequest) {
  const me = await requireAdmin();
  if (!me) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { id, action, newRole } = body as {
    id?: string;
    action?: "approve" | "reject";
    newRole?: "TRAINER" | "CLIENT";
  };

  if (!id || !action || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });

  // validação de role editável
  let roleToSet: Role | undefined;
  if (newRole) {
    if (newRole !== "TRAINER" && newRole !== "CLIENT") {
      return NextResponse.json({ ok: false, error: "ROLE_NOT_ALLOWED" }, { status: 400 });
    }
    roleToSet = newRole as Role;
  }

  // constrói update (role opcional + novo status)
  const nextStatus = action === "approve" ? Status.ACTIVE : Status.SUSPENDED;

  const updated = await prisma.user.update({
    where: { id },
    data: {
      status: nextStatus,
      ...(roleToSet && roleToSet !== user.role ? { role: roleToSet } : {}),
    },
    select: { id: true, email: true, name: true, role: true, status: true, updatedAt: true },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      actorId: (me as any).id,
      action: action === "approve" ? "admin_approve_user" : "admin_reject_user",
      target: id,
      meta: {
        email: user.email,
        fromStatus: user.status,
        toStatus: nextStatus,
        fromRole: user.role,
        toRole: updated.role,
      },
    },
  });

  return NextResponse.json({ ok: true, data: updated });
}
