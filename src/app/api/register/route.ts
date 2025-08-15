// src/app/api/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// Garantir ambiente Node.js (Prisma não corre em Edge)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Util: ler body como JSON ou FormData
async function readBody(req: Request): Promise<Record<string, any>> {
  try {
    const json = await req.json();
    if (json && typeof json === "object") return json as Record<string, any>;
  } catch {
    // not json
  }
  try {
    const fd = await req.formData();
    const obj: Record<string, any> = {};
    fd.forEach((v, k) => (obj[k] = typeof v === "string" ? v : ""));
    return obj;
  } catch {
    // ignore
  }
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

    // Derivar intenção de PT pelo referer (ex.: /register/trainer); não gravamos role aqui.
    const referer = (req.headers.get("referer") || "").toLowerCase();
    const wantsTrainer = /\/register\/trainer/.test(referer) || `${body.role}`.toUpperCase() === "TRAINER";

    // Validação básica
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

    // Tenta criar com diferentes nomes de coluna para a password (compatível com schemas)
    const base = {
      email,
      name: name || email.split("@")[0],
      // NÃO definir role aqui. Se for /register/trainer, o fluxo de aprovação/admin tratará disso.
      // Ex.: podes ter um cron/endpoint que muda role para TRAINER quando aprovado.
    } as any;

    const variants = [
      { password: hash },
      { passwordHash: hash },
      { hashedPassword: hash },
    ];

    let created: any = null;
    let lastErr: any = null;
    for (const v of variants) {
      try {
        // @ts-ignore — permitimos "data" flexível
        created = await prisma.user.create({ data: { ...base, ...v } });
        break;
      } catch (e: any) {
        lastErr = e;
        // Continua a tentar com o próximo nome de coluna
      }
    }

    if (!created) {
      console.error("[register] Falha a criar utilizador (todas variantes):", {
        email,
        referer,
        wantsTrainer,
        err: String(lastErr),
      });
      return NextResponse.json({ ok: false, error: "CREATE_FAILED" }, { status: 500 });
    }

    // (Opcional) marcação de intenção PT para aprovação (se tiveres tabela/flag própria)
    // try {
    //   if (wantsTrainer) {
    //     await prisma.trainerIntent.create({ data: { userId: created.id, createdAt: new Date() } });
    //   }
    // } catch (e) { console.warn("[register] trainerIntent opcional falhou:", e); }

    return NextResponse.json(
      {
        ok: true,
        data: {
          id: created.id,
          email: created.email,
          name: created.name,
          // Não expor hash
        },
      },
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

// Health-check rápido (útil em Vercel)
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: "up" });
  } catch (e) {
    console.error("[register] GET health fail", e);
    return NextResponse.json({ ok: false, db: "down" }, { status: 500 });
  }
}
