// src/app/api/auth/register/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { hash } from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const BodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  name: z.string().min(2).max(80).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();
    const name = parsed.data.name?.trim() || null;
    const rounds = process.env.NODE_ENV === "development" ? 10 : 12;
    const passwordHash = await hash(parsed.data.password, rounds);

    // já existe?
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ error: "Email já registado." }, { status: 409 });
    }

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: "cliente", // por segurança não permitimos escolher papel no registo
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("[register] erro:", e);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
