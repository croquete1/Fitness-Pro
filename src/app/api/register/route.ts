// src/app/api/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role, Status } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : null;
    const emailRaw = typeof body?.email === "string" ? body.email.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!emailRaw || !password) {
      return NextResponse.json(
        { error: "Email e password são obrigatórios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    const email = emailRaw.toLowerCase();

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { error: "Email já registado" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Forçar novos utilizadores a CLIENT + PENDING
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: Role.CLIENT,
        status: Status.PENDING,
      },
      select: { id: true, email: true, name: true, role: true, status: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: "Erro ao registar utilizador" },
      { status: 500 }
    );
  }
}
