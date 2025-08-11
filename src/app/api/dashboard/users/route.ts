import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json({ users });
  } catch (e) {
    console.error("users route error:", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
