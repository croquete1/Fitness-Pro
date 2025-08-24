// src/app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { Role, Status, AuditKind } from "@prisma/client";
import { logAudit } from "@/lib/audit";

export async function PATCH(req: Request) {
  try {
    const session = await requireAdmin(); // deve lançar "UNAUTHORIZED"/"FORBIDDEN" se falhar

    const body = await req.json().catch(() => ({}));
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    if (!id) {
      return NextResponse.json({ error: "ID em falta" }, { status: 400 });
    }

    // Validar e mapear enums
    const nextRoleKey = body?.role as keyof typeof Role | undefined;
    const nextStatusKey = body?.status as keyof typeof Status | undefined;

    const delta: Partial<{ role: Role; status: Status }> = {};
    if (nextRoleKey) {
      if (!(nextRoleKey in Role)) {
        return NextResponse.json({ error: "Role inválida" }, { status: 400 });
      }
      delta.role = Role[nextRoleKey];
    }
    if (nextStatusKey) {
      if (!(nextStatusKey in Status)) {
        return NextResponse.json({ error: "Status inválido" }, { status: 400 });
      }
      delta.status = Status[nextStatusKey];
    }

    if (!delta.role && !delta.status) {
      return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
    }

    // Estado anterior (para diff)
    const before = await prisma.user.findUnique({
      where: { id },
      select: { role: true, status: true },
    });
    if (!before) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    // Atualizar
    const updated = await prisma.user.update({
      where: { id },
      data: delta,
      select: { id: true, role: true, status: true },
    });

    // Qual o tipo de audit
    const changedRole = Boolean(delta.role);
    const changedStatus = Boolean(delta.status);
    const kind =
      changedRole && changedStatus
        ? AuditKind.ACCOUNT_ROLE_CHANGE // usamos o mesmo tipo; o diff mostra os dois campos
        : changedRole
        ? AuditKind.ACCOUNT_ROLE_CHANGE
        : AuditKind.ACCOUNT_STATUS_CHANGE;

    // Registo de auditoria
    await logAudit({
      actorId: session.user.id,
      kind,
      message: "Atualização de conta",
      targetType: "User",
      targetId: id,
      diff: {
        before,
        after: { role: updated.role, status: updated.status },
      },
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (e) {
    const msg = (e as Error)?.message || "";
    const code = msg === "UNAUTHORIZED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: code === 500 ? "Erro interno" : msg }, { status: code });
  }
}
