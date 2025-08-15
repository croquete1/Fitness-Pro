// src/app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Role, Status } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function normalizeRole(input?: string | null): Role | undefined {
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

function normalizeStatus(input?: string | null): Status | undefined {
  if (!input) return undefined;
  const key = input.trim().toUpperCase().replace(/\s+/g, "_");
  const map: Record<string, Status> = {
    PENDING: "PENDING",
    PENDENTE: "PENDING",
    ACTIVE: "ACTIVE",
    ATIVO: "ACTIVE",
    SUSPENDED: "SUSPENDED",
    SUSPENSO: "SUSPENDED",
  } as const;
  const candidate = (map[key] ?? key) as Status;
  return (Object.values(Status) as string[]).includes(candidate) ? (candidate as Status) : undefined;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "50", 10), 1), 200);
    const role = normalizeRole(url.searchParams.get("role"));
    const status = normalizeStatus(url.searchParams.get("status"));
    const q = url.searchParams.get("q")?.trim();

    const where: any = {};
    if (role) where.role = role;               // só filtra se houver parâmetro válido
    if (status) where.status = status;         // idem
    if (q) {
      where.OR = [
        { email: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
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
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Erro inesperado" }, { status: 500 });
  }
}
