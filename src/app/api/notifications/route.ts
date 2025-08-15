// src/app/api/notifications/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

// Normaliza strings como "pt", "trainer", "cliente" => Role do Prisma (ADMIN|TRAINER|CLIENT)
function normalizeRole(input: string | null): Role | undefined {
  if (!input) return undefined;
  const key = input.trim().toUpperCase().replace(/\s+/g, "_");
  const map: Record<string, Role> = {
    ADMIN: "ADMIN",
    TRAINER: "TRAINER",
    PT: "TRAINER",
    PERSONAL_TRAINER: "TRAINER",
    CLIENT: "CLIENT",
    CLIENTE: "CLIENT",
  } as const;
  const candidate = (map[key] ?? key) as Role;
  return (Object.values(Role) as string[]).includes(candidate) ? (candidate as Role) : undefined;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "5", 10), 1), 100);
    const since = url.searchParams.get("since");            // ISO string opcional
    const roleParam = url.searchParams.get("role");         // ADMIN|TRAINER|CLIENT (ou alias)
    const userId = url.searchParams.get("userId");          // para notificações dirigidas

    const targetRole = normalizeRole(roleParam);

    const where: any = {};
    if (since) {
      const d = new Date(since);
      if (!isNaN(d.getTime())) where.createdAt = { gt: d };
    }

    // Regras: se houver user/role, devolve notificações dirigidas + as gerais (sem target)
    const ors: any[] = [{ targetUserId: null, targetRole: null }];
    if (userId) ors.push({ targetUserId: userId });
    if (targetRole) ors.push({ targetRole: targetRole });
    where.OR = ors;

    // ⚠️ usar bracket access para evitar erro de typings em builds onde o modelo não está exposto no tipo
    const Notification = (prisma as any)["notification"];
    if (!Notification) {
      // Fallback defensivo (útil em ambientes onde o client não foi re-gerado)
      return NextResponse.json({ ok: true, data: [] });
    }

    const list = await Notification.findMany({
      where,
      orderBy: { createdAt: "asc" },
      take: limit,
    });

    return NextResponse.json({ ok: true, data: list });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Erro inesperado" }, { status: 500 });
  }
}
