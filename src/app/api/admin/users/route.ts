import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { AuditKind } from "@prisma/client";
import { logAudit } from "@/lib/audit";

export async function PATCH(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const id = String(body?.id || "");
    if (!id) return NextResponse.json({ error: "ID em falta" }, { status: 400 });

    const data: any = {};
    if (body?.role) data.role = String(body.role);
    if (body?.status) data.status = String(body.status);
    if (!Object.keys(data).length) {
      return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
    }

    const before = await prisma.user.findUnique({ where: { id }, select: { role: true, status: true } });
    await prisma.user.update({ where: { id }, data });

    await logAudit({
      kind:
        data.role && data.status
          ? AuditKind.ACCOUNT_ROLE_CHANGE // marcamos role_change; o diff mostra os 2
          : data.role
          ? AuditKind.ACCOUNT_ROLE_CHANGE
          : AuditKind.ACCOUNT_STATUS_CHANGE,
      message: "Atualização de conta",
      actorId: session.user.id,
      targetId: id,
      diff: { before, after: data },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const code = (e as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Unauthorized" }, { status: code });
  }
}
