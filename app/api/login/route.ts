import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Aqui podes validar no banco ou mock
  const validUser = email === "admin@ex.com" && password === "1234";
  if (!validUser) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  // Define cookie de role
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: "role",
    value: "admin",
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24, // 1 dia
  });

  return response;
}
