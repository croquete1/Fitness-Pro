import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  name: z.string().min(1).max(120).optional(),
});

export async function POST(req: Request) {
  if (process.env.ALLOW_PUBLIC_REGISTRATION !== "true") {
    return NextResponse.json({ error: "Registo desativado" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { email, password, name } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (exists) {
    return NextResponse.json({ error: "Email já registado" }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);

  await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name: name ?? null,
      passwordHash,
      role: "cliente", // <- nunca admin
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
