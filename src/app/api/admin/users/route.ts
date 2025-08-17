import { NextResponse } from "next/server";
import prismaAny from "@/lib/prisma";

const prisma: any =
  (prismaAny as any).prisma ??
  (prismaAny as any).default ??
  prismaAny;

const CANDIDATE_USER_MODELS = ["user", "User", "accountUser", "AccountUser"];

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

// GET /api/admin/users?limit=&offset=&q=&role=&status=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 10)));
  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0));
  const q = (searchParams.get("q") ?? "").trim();
  const role = (searchParams.get("role") ?? "").toUpperCase();
  const status = (searchParams.get("status") ?? "").toUpperCase();

  const model = firstModel(CANDIDATE_USER_MODELS);
  if (!model) return NextResponse.json({ data: [], total: 0 });

  const where: any = {};
  if (q) {
    where.OR = [
      { name: like(q) },
      { email: like(q) },
      { fullName: like(q) }, // caso uses fullName
    ];
  }
  if (["ADMIN", "TRAINER", "CLIENT"].includes(role)) where.role = role;
  if (["PENDING", "ACTIVE", "SUSPENDED"].includes(status)) where.status = status;

  // total (tolerante ao schema)
  let total = 0;
  try {
    total = await (prisma as any)[model].count({ where });
  } catch {
    // fallback: conta pelo tamanho de uma busca sem paginação (limitada)
    const all = await (prisma as any)[model].findMany({ where, take: 1000 }).catch(() => []);
    total = Array.isArray(all) ? all.length : 0;
  }

  // listagem
  let items: any[] = [];
  try {
    items = await (prisma as any)[model].findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" }, // se não existir, cai no catch
    });
  } catch {
    items = await (prisma as any)[model].findMany({
      where,
      skip: offset,
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

  return NextResponse.json({ data, total });
}
