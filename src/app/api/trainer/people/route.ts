import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { canAccessTrainer, isAdmin } from "@/lib/rbac";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role as "ADMIN" | "TRAINER" | "CLIENT";
  if (!canAccessTrainer(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const meId = (session.user as any).id as string;

  const { searchParams } = new URL(req.url);
  const roleFilter = searchParams.get("role") as "ADMIN" | "TRAINER" | "CLIENT" | null;

  const select = { id: true, name: true, email: true, role: true } as const;

  // Helpers de queries
  const qClients = prisma.user.findMany({ where: { role: "CLIENT" }, select, orderBy: { name: "asc" } });
  const qTrainers = isAdmin(role)
    ? prisma.user.findMany({ where: { role: "TRAINER" }, select, orderBy: { name: "asc" } })
    : prisma.user.findMany({ where: { id: meId }, select }); // trainer só ele próprio

  if (roleFilter === "CLIENT") {
    return NextResponse.json({ clients: await qClients });
  }
  if (roleFilter === "TRAINER") {
    return NextResponse.json({ trainers: await qTrainers });
  }

  const [clients, trainers] = await Promise.all([qClients, qTrainers]);
  return NextResponse.json({ clients, trainers });
}
