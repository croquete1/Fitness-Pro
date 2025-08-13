// src/app/api/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role, Status } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = (await req.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e password são obrigatórios" },
        { status: 400 }
      );
    }

    const emailNorm = email.trim().toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email: emailNorm } });
    if (exists) {
      return NextResponse.json({ error: "Email já registado" }, { status: 409 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name?.trim() || null,
        email: emailNorm,
        passwordHash,
        role: Role.CLIENT,          // todos criados como CLIENT
        status: Status.PENDING,     // pendente de aprovação pelo admin
      },
      select: { id: true, email: true, name: true, role: true, status: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Erro ao registar utilizador" }, { status: 500 });
  }
}
