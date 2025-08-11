// src/app/api/trainer/meta/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { canAccessTrainer, isAdmin } from "@/lib/rbac";

export const runtime = "nodejs";
// 🔧 Diz explicitamente ao Next que isto é dinâmico (não SSG)
export const dynamic = "force-dynamic";
// 🔧 Sem cache em edge/node e sem revalidate
export const fetchCache = "force-no-store";
export const revalidate = 0;

export async function GET(_req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const me = session.user as any;
    const role = me.role as "ADMIN" | "TRAINER" | "CLIENT";
    if (!canAccessTrainer(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const trainersWhere = isAdmin(role)
      ? { role: "TRAINER" as const }
      : { id: me.id as string };

    const [trainers, clients] = await Promise.all([
      prisma.user.findMany({
        where: trainersWhere,
        select: { id: true, name: true, email: true },
        orderBy: [{ name: "asc" }, { email: "asc" }],
      }),
      prisma.user.findMany({
        where: { role: "CLIENT", status: "APPROVED" },
        select: { id: true, name: true, email: true },
        orderBy: [{ name: "asc" }, { email: "asc" }],
      }),
    ]);

    return NextResponse.json({ trainers, clients }, { status: 200 });
  } catch (err) {
    console.error("GET /api/trainer/meta error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
