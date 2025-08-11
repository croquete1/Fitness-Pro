import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Exemplo: últimas sessões (ajusta conforme a tua UI)
    const activities = await prisma.session.findMany({
      take: 10,
      orderBy: { scheduledAt: "desc" },
      include: {
        trainer: { select: { id: true, name: true } },
        client: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json({ activities });
  } catch (e) {
    console.error("activities route error:", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
