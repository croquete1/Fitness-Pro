import { NextResponse } from "next/server";
import prismaAny from "@/lib/prisma";

/** Acede ao client do Prisma mesmo que esteja exportado de formas diferentes */
const prisma: any =
  (prismaAny as any).prisma ??
  (prismaAny as any).default ??
  prismaAny;

/** Tenta descobrir qual é o modelo que representa utilizadores/clientes no teu schema */
const CANDIDATE_USER_MODELS = ["user", "User", "client", "Client", "accountUser", "AccountUser"];

function firstModel(names: string[]) {
  for (const n of names) {
    const m = (prisma as any)[n];
    if (m && typeof m.findMany === "function") return n;
  }
  return null;
}

function like(q: string) {
  return { contains: q, mode: "insensitive" as const };
}

/**
 * GET /api/search/clients?q=joana&limit=10
 * - Pesquisa por clientes (role=CLIENT) por nome/email (case-insensitive)
 * - Limite padrão: 10 (máx. 50)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const limitRaw = Number(searchParams.get("limit") ?? 10);
  const limit = Math.min(50, Math.max(1, Number.isFinite(limitRaw) ? limitRaw : 10));

  const model = firstModel(CANDIDATE_USER_MODELS);
  if (!model) {
    // Sem modelo – responde vazio para não rebentar o build nem o runtime
    return NextResponse.json({ data: [] });
  }

  const where: any = {};
  // Força CLIENT quando o schema tiver role
  try {
    where.role = "CLIENT";
  } catch {
    // Se o schema não tiver "role", simplesmente ignora
  }

  if (q) {
    where.OR = [
      { name: like(q) },
      { email: like(q) },
      { fullName: like(q) }, // compat: se usares fullName
    ];
  }

  let items: any[] = [];
  try {
    items = await (prisma as any)[model].findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // fallback se o schema não tiver createdAt
    items = await (prisma as any)[model].findMany({
      where,
      take: limit,
    });
  }

  const data = items.map((u: any) => ({
    id: String(u.id ?? ""),
    name: u.name ?? u.fullName ?? null,
    email: u.email ?? null,
    role: (u.role ?? "CLIENT").toString().toUpperCase(),
    status: (u.status ?? "ACTIVE").toString().toUpperCase(),
    createdAt: u.createdAt ?? null,
    lastLoginAt: u.lastLoginAt ?? u.lastSeenAt ?? null,
  }));

  return NextResponse.json({ data });
}
