// src/app/api/admin/approvals/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logUserApproved, logUserRejected } from "@/lib/logger";
import { Role, Status } from "@prisma/client";

type ApprovalsPayload = {
  userId: string;
  newRole?: string;            // pode vir "trainer", "TRAINER", "pt", etc.
  action: "approve" | "reject";
  reason?: string;
  adminId?: string;
};

function normalizeRole(input?: string | null): Role | null {
  if (!input) return null;
  const key = String(input).trim().toUpperCase().replace(/\s+/g, "_");
  // Aliases úteis
  const map: Record<string, Role> = {
    ADMIN: "ADMIN",
    TRAINER: "TRAINER",
    PT: "TRAINER",
    PERSONAL_TRAINER: "TRAINER",
    CLIENT: "CLIENT",
    CLIENTE: "CLIENT",
  } as any;

  const candidate = (map[key] ?? key) as Role;
  return Object.values(Role).includes(candidate) ? candidate : null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ApprovalsPayload;
    const { userId, newRole, action, reason, adminId } = body;

    if (!userId || !action) {
      return NextResponse.json({ ok: false, error: "Campos obrigatórios: 'userId' e 'action'." }, { status: 400 });
    }

    if (action === "approve") {
      const role = normalizeRole(newRole);
      if (!role) {
        return NextResponse.json({ ok: false, error: "newRole inválido para enum Role." }, { status: 400 });
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          role: { set: role },
          status: { set: Status.ACTIVE },
        },
      });

      await logUserApproved({ adminId: adminId ?? null, userId: user.id, toRole: user.role });

      return NextResponse.json({ ok: true, user });
    }

    // reject
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: { set: Status.SUSPENDED } },
    });

    await logUserRejected({ adminId: adminId ?? null, userId: user.id, reason });

    return NextResponse.json({ ok: true, user });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Erro inesperado" }, { status: 500 });
  }
}
