import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

export async function GET() {
  try {
    await requireAdmin();
    const rows = await prisma.user.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    });
    return NextResponse.json(rows);
  } catch (e) {
    const code = (e as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Unauthorized" }, { status: code });
  }
}
