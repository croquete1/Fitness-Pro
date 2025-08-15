// src/app/api/admin/approvals/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Status } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Action = "approve" | "reject";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { status: Status.PENDING },
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ ok: true, data: users });
  } catch (e: any) {
    console.error("[approvals][GET]", e?.message ?? e);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await readBody(req);
    const id = String(body.id ?? "").trim();
    const action = String(body.action ?? "").toLowerCase() as Action;

    if (!id) return NextResponse.json({ ok: false, error: "MISSING_ID" }, { status: 400 });
    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ ok: false, error: "INVALID_ACTION" }, { status: 400 });
    }

    const newStatus = action === "approve" ? Status.ACTIVE : Status.SUSPENDED;

    const updated = await prisma.user.update({
      where: { id },
      data: { status: newStatus },
      select: { id: true, email: true, name: true, role: true, status: true, updatedAt: true },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (e: any) {
    console.error("[approvals][POST]", e?.message ?? e);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

async function readBody(req: Request): Promise<Record<string, any>> {
  try {
    const json = await req.json();
    if (json && typeof json === "object") return json as Record<string, any>;
  } catch {}
  try {
    const fd = await req.formData();
    const obj: Record<string, any> = {};
    fd.forEach((v, k) => (obj[k] = typeof v === "string" ? v : ""));
    return obj;
  } catch {}
  return {};
}
