// src/app/api/system/Logs/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function deriveMessage(log: any): string {
  const m = (log?.meta as any) || {};
  if (typeof m.message === "string" && m.message.trim().length > 0) return m.message;

  switch (log?.action) {
    case "USER_SIGNED_UP":
      return `Utilizador inscrito${m.role ? ` (${m.role})` : ""}${m.email ? ` — ${m.email}` : ""}`;
    case "USER_APPROVED":
      return `Utilizador aprovado${m.toRole ? ` — novo role: ${m.toRole}` : ""}`;
    case "USER_REJECTED":
      return `Utilizador rejeitado${m.reason ? ` — motivo: ${m.reason}` : ""}`;
    default:
      return String(log?.action ?? "Log");
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "100", 10), 1), 200);
    const action = url.searchParams.get("action") || undefined;
    const target = url.searchParams.get("target") || undefined;

    const where: any = {};
    if (action) where.action = action;
    if (target) where.target = target;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const data = logs.map((l) => ({
      ...l,
      message: deriveMessage(l), // <- UI recebe sempre 'message'
    }));

    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Erro inesperado" }, { status: 500 });
  }
}
