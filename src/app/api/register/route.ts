// src/app/api/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { AUDIT_KINDS, AUDIT_TARGET_TYPES } from "@/types/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Util: ler body como JSON ou FormData
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

export async function POST(req: Request) {
  const t0 = Date.now();
  try {
    const body = await readBody(req);

    const name = (body.name ?? body.fullname ?? body.displayName ?? "").toString().trim();
    const email = (body.email ?? "").toString().trim().toLowerCase();
    const password = (body.password ?? body.pass ?? "").toString();

    // Heurística simples para intenção PT
    const referer = (req.headers.get("referer") || "").toLowerCase();
    const wantsTrainer =
      /\/register\/trainer/.test(referer) || `${body.role}`.toUpperCase() === "TRAINER";

    // Validação
    if (!isEmail(email)) {
      return NextResponse.json({ ok: false, error: "EMAIL_INVALID" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ ok: false, error: "PASSWORD_TOO_SHORT" }, { status: 400 });
    }

    // Duplicado?
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ ok: false, error: "EMAIL_ALREADY_IN_USE" }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);

    // tenta colunas de hash compatíveis
    const base = {
      email,
      name: name || email.split("@")[0],
    } as any;

    const variants = [{ passwordHash: hash }, { password: hash }, { hashedPassword: hash }];

    let created: any = null;
    let lastErr: any = null;
    for (const v of variants) {
      try {
        created = await prisma.user.create({ data: { ...base, ...v } });
        break;
      } catch (e: any) {
        lastErr = e;
      }
    }
    if (!created) {
      console.error("[register] prisma.create falhou:", String(lastErr));
      return NextResponse.json({ ok: false, error: "CREATE_FAILED" }, { status: 500 });
    }

    // Audit log canónico (usa enums locais; sem 'targetLabel')
    try {
      await logAudit({
        actorId: null, // registo sem sessão ativa
        kind: AUDIT_KINDS.ACCOUNT_APPROVAL,
        message: "USER_REGISTERED",
        targetType: AUDIT_TARGET_TYPES.USER, // <<< maiúsculas corretas
        targetId: created.id,
        diff: {
          email: created.email,
          name: created.name ?? null,
          wantsTrainer,
          referer,
        },
      });
    } catch (e) {
      console.warn("[register] audit log falhou:", e);
    }

    return NextResponse.json(
      { ok: true, data: { id: created.id, email: created.email, name: created.name } },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[register] 500:", err?.message ?? err);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  } finally {
    const ms = Date.now() - t0;
    if (ms > 1000) console.warn(`[register] lento: ${ms}ms`);
  }
}

export async function GET() {
  // Health simples (não toca em DB para evitar falhas intermitentes no build)
  return NextResponse.json({ ok: true, service: "register" });
}