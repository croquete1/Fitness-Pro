import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email e password são obrigatórios" }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Email já registado" }, { status: 409 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password deve ter pelo menos 6 caracteres" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name ?? null,
        email,
        passwordHash,
        role: role && typeof role === "string" ? role : "user",
      },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Erro ao registar utilizador" }, { status: 500 });
  }
}
