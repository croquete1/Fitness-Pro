// src/app/api/admin/approvals/route.ts
import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma"; // ativa quando Prisma estiver disponível

type ApprovalsPayload = {
  userId: string;
  newRole: "user" | "trainer" | "admin";
  action: "approve" | "reject";
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<ApprovalsPayload>;

    // Renomear com "_" para cumprir a regra de unused-vars (e também vamos usá-las abaixo)
    const _userId = body.userId;
    const _newRole = body.newRole;
    const _action = body.action;

    // Validação simples (passa a 400 se faltar algo)
    if (!_userId || !_newRole || !_action) {
      return NextResponse.json(
        { ok: false, error: "Parâmetros inválidos: 'userId', 'newRole' e 'action' são obrigatórios." },
        { status: 400 }
      );
    }

    // MOCK: quando ligares o Prisma, substitui pelo update real
    // await prisma.user.update({
    //   where: { id: _userId },
    //   data: { role: _action === "approve" ? _newRole : "pending" },
    // });
    // await prisma.auditLog.create({
    //   data: {
    //     action: _action === "approve" ? "USER_APPROVED" : "USER_REJECTED",
    //     actor: "admin",
    //     target: _userId, // ✅ FIX: usar 'target' (não 'targetId')
    //     metadata: { newRole: _newRole },
    //   },
    // });

    // Devolve o resultado efetivo do que seria aplicado
    const appliedRole = _action === "approve" ? _newRole : "pending";
    return NextResponse.json({
      ok: true,
      userId: _userId,
      action: _action,
      assignedRole: appliedRole,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
