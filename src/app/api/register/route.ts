// src/app/api/register/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export const runtime = "nodejs";

function normalizeRole(input: unknown): Role {
  if (typeof input !== "string") return Role.CLIENT;
  const v = input.toLowerCase().trim();

  if (v === "admin") return Role.ADMIN;
  if (v === "pt" || v === "trainer" || v === "personal_trainer") return Role.TRAINER;
  if (v === "cliente" || v === "client" || v === "user" || v === "usuario" || v === "utilizador")
    return Role.CLIENT;

  return Role.CLIENT;
}

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e password são obrigatórios" },
        { status: 400 }
      );
    }

    const emailNorm = String(email).toLowerCase().trim();

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
        name: name ? String(name) : null,
        email: emailNorm,
        passwordHash,
        role: normalizeRole(role),
      },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    console.error("Erro no register:", e);
    return NextResponse.json(
      { error: "Erro ao registar utilizador" },
      { status: 500 }
    );
  }
}
