import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [clientes, pts, admins] = await Promise.all([
      prisma.user.count({ where: { role: Role.CLIENT } }),
      prisma.user.count({ where: { role: Role.TRAINER } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
    ]);
    return NextResponse.json({ clientes, pts, admins });
  } catch (e) {
    console.error("stats route error:", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
