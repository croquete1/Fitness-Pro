// src/app/api/debug/auth-user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const email = new URL(req.url).searchParams.get("email")?.toLowerCase();
    if (!email) return NextResponse.json({ ok: false, error: "missing email" }, { status: 400 });

    const u = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true, email: true, role: true, status: true,
        passwordHash: true, createdAt: true, updatedAt: true,
      },
    });
    if (!u) return NextResponse.json({ ok: true, data: null });

    return NextResponse.json({
      ok: true,
      data: {
        id: u.id,
        email: u.email,
        role: u.role,
        status: u.status,
        hashPrefix: u.passwordHash?.slice(0, 4), // e.g. $2a$, $2b$, $2y$
        hashLen: u.passwordHash?.length ?? 0,    // esperado ~60
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 200 });
  }
}
