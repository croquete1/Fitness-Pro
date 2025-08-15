// src/app/api/admin/roster/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Role } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/roster?trainerId=...&clientId=...&limit=25
 * - Lista atribuições Trainer<->Cliente (admin-only).
 * - Filtros opcionais por trainerId e/ou clientId.
 * - Ordenado por createdAt desc.
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const me = session?.user as any;
    if (!me || me.role !== Role.ADMIN) {
      return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
    }

    const url = new URL(req.url);
    const trainerId = url.searchParams.get("trainerId") || undefined;
    const clientId = url.searchParams.get("clientId") || undefined;
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 25)));

    const where: any = {};
    if (trainerId) where.trainerId = trainerId;
    if (clientId) where.clientId = clientId;

    const rows = await prisma.trainerClient.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        trainerId: true,
        clientId: true,
        createdAt: true,
        trainer: { select: { id: true, email: true, name: true, role: true } },
        client: { select: { id: true, email: true, name: true, role: true } },
      },
    });

    return NextResponse.json({ ok: true, data: rows });
  } catch (e: any) {
    console.error("[admin/roster][GET]", e?.message ?? e);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
