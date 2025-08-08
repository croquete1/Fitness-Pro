import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { hash } from "bcryptjs";

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export async function POST(req: Request) {
  // Permitir desligar registo público quando quiser (por omissão: ligado)
  const allow = (process.env.ALLOW_PUBLIC_REGISTRATION ?? "true").toLowerCase() !== "false";
  if (!allow) {
    return NextResponse.json({ error: "Registo desativado." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const { name, email, password } = parsed.data;
    const emailNorm = email.toLowerCase();

    const exists = await prisma.user.findUnique({ where: { email: emailNorm } });
    if (exists) {
      return NextResponse.json({ error: "Email já registado." }, { status: 409 });
    }

    const passwordHash = await hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email: emailNorm,
        passwordHash,
        role: "cliente",          // clientes criam-se aqui; PT/Admin via backoffice
        emailVerified: new Date() // remova se quiser obrigar verificação posterior
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro inesperado." }, { status: 500 });
  }
}
