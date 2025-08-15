// src/app/api/admin/reset-password/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { Role, Status } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lê o body como JSON ou FormData (tolerante) */
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

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/**
 * POST /api/admin/reset-password
 * Headers:  Authorization: Bearer <ADMIN_RESET_TOKEN>
 * Body: { email: string, newPassword: string, role?: "ADMIN"|"TRAINER"|"CLIENT", activate?: boolean }
 *
 * - Atualiza (ou cria se não existir) o utilizador com a password enviada (bcrypt).
 * - Se activate=true, força status=ACTIVE.
 * - Se role for enviado e válido, atualiza o role.
 */
export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const expected = process.env.ADMIN_RESET_TOKEN || "";

    if (!expected || token !== expected) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await readBody(req);
    const email = String(body.email ?? "").trim().toLowerCase();
    const newPassword = String(body.newPassword ?? body.password ?? "").trim();
    const activate = String(body.activate ?? "true").toLowerCase() === "true";
    const roleInput = (body.role ?? "").toString().toUpperCase();

    if (!isEmail(email)) {
      return NextResponse.json({ ok: false, error: "EMAIL_INVALID" }, { status: 400 });
    }
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ ok: false, error: "PASSWORD_TOO_SHORT" }, { status: 400 });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    // role opcional (só define se válido)
    const roleToSet =
      roleInput in Role ? (Role as any)[roleInput] : undefined;

    // Faz upsert: se não existir, cria; se existir, atualiza
    const upserted = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash: hash,
        ...(activate ? { status: Status.ACTIVE } : {}),
        ...(roleToSet ? { role: roleToSet } : {}),
      },
      create: {
        email,
        name: email.split("@")[0],
        passwordHash: hash, // @map("password_hash")
        role: roleToSet ?? Role.ADMIN, // por omissão criamos admin
        status: activate ? Status.ACTIVE : Status.PENDING,
      },
      select: { id: true, email: true, name: true, role: true, status: true, updatedAt: true },
    });

    return NextResponse.json({ ok: true, data: upserted }, { status: 200 });
  } catch (e: any) {
    console.error("[admin/reset-password][POST]", e?.message ?? e);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "METHOD_NOT_ALLOWED" }, { status: 405 });
}
