// src/app/api/admin/approvals/count/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Status } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [pending, active, suspended] = await Promise.all([
      prisma.user.count({ where: { status: Status.PENDING } }),
      prisma.user.count({ where: { status: Status.ACTIVE } }),
      prisma.user.count({ where: { status: Status.SUSPENDED } }),
    ]);

    return NextResponse.json({
      ok: true,
      data: { pending, active, suspended, total: pending + active + suspended },
    });
  } catch (e: any) {
    console.error("[approvals/count][GET]", e?.message ?? e);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
