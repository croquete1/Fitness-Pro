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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 10)));

  const model = firstModel(CANDIDATE_USER_MODELS);
  if (!model) return NextResponse.json({ data: [] });

  const where: any = {};
  try { where.role = "TRAINER"; } catch {}

  if (q) {
    where.OR = [{ name: like(q) }, { email: like(q) }, { fullName: like(q) }];
  }

  let items: any[] = [];
  try {
    items = await (prisma as any)[model].findMany({ where, take: limit, orderBy: { createdAt: "desc" } });
  } catch {
    items = await (prisma as any)[model].findMany({ where, take: limit });
  }

  const data = items.map((u: any) => ({
    id: String(u.id ?? ""),
    name: u.name ?? u.fullName ?? null,
    email: u.email ?? null,
    role: (u.role ?? "TRAINER").toString().toUpperCase(),
    status: (u.status ?? "ACTIVE").toString().toUpperCase(),
  }));

  return NextResponse.json({ data });
}
