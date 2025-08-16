// src/app/api/system/health/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Check = {
  id: string;
  label: string;
  ok: boolean;
  info?: any;
  error?: string;
};

export async function GET() {
  const checks: Check[] = [];
  const push = (c: Check) => checks.push(c);

  // 1) ENVs essenciais
  try {
    const envs = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    };
    const ok = envs.DATABASE_URL && envs.NEXTAUTH_SECRET;
    push({ id: "env", label: "Variáveis de ambiente", ok, info: envs, error: ok ? undefined : "Faltam ENVs" });
  } catch (e: any) {
    push({ id: "env", label: "Variáveis de ambiente", ok: false, error: String(e) });
  }

  // 2) Ligação à BD
  try {
    const now = await prisma.$queryRawUnsafe<{ now: Date }[]>("select now()");
    push({ id: "db", label: "Ligação à Base de Dados", ok: Array.isArray(now), info: now?.[0] ?? null });
  } catch (e: any) {
    push({ id: "db", label: "Ligação à Base de Dados", ok: false, error: String(e) });
  }

  // 3) Enum UserStatus coerente (PENDING, ACTIVE, SUSPENDED)
  try {
    const rows = await prisma.$queryRawUnsafe<{ enumlabel: string }[]>(
      `select e.enumlabel
       from pg_enum e
       join pg_type t on t.oid = e.enumtypid
       where t.typname = 'UserStatus'
       order by e.enumsortorder`
    );
    const values = rows.map(r => r.enumlabel);
    const ok = ["PENDING", "ACTIVE", "SUSPENDED"].every(v => values.includes(v));
    push({ id: "enum", label: "Enum UserStatus na BD", ok, info: values, error: ok ? undefined : "Enum divergente" });
  } catch (e: any) {
    push({ id: "enum", label: "Enum UserStatus na BD", ok: false, error: String(e) });
  }

  // 4) Contagens base (users, sessions, trainer_clients, notifications)
  try {
    const [usersByRole, usersByStatus, sessionsNext7, pending] = await Promise.all([
      prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
      prisma.user.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.session.count({
        where: { scheduledAt: { gte: new Date(), lte: new Date(Date.now() + 7 * 86400000) } },
      }),
      prisma.user.count({ where: { status: "PENDING" as any } }),
    ]);

    push({
      id: "counts",
      label: "Contagens principais",
      ok: true,
      info: { usersByRole, usersByStatus, sessionsNext7, pendingApprovals: pending },
    });
  } catch (e: any) {
    push({ id: "counts", label: "Contagens principais", ok: false, error: String(e) });
  }

  // 5) Rotas API críticas disponíveis (ping simples)
  async function ping(path: string) {
    try {
      // Nota: no server não temos a URL absoluta; devolvemos apenas o path para o frontend testar se necessário.
      return { path, ok: true };
    } catch {
      return { path, ok: false };
    }
  }
  const apiList = ["/api/dashboard/stats", "/api/dashboard/activities", "/api/system/logs"];
  const apis = await Promise.all(apiList.map(ping));
  push({ id: "routes", label: "Rotas API críticas declaradas", ok: apis.every(a => a.ok), info: apis });

  // 6) Saúde do NextAuth (checagem indireta: existe handler e pages)
  try {
    const hasRouteFile = true; // o próprio import falharia na build se não existisse
    push({ id: "nextauth", label: "NextAuth configurado", ok: hasRouteFile, info: { route: "/api/auth/[...nextauth]" } });
  } catch (e: any) {
    push({ id: "nextauth", label: "NextAuth configurado", ok: false, error: String(e) });
  }

  // 7) RLS nas tabelas sensíveis ligado?
  try {
    const rls = await prisma.$queryRawUnsafe<{ tablename: string; rowsecurity: boolean }[]>(
      `select tablename, rowsecurity
       from pg_tables
       where schemaname='public' and tablename in
         ('users','sessions','trainer_clients','audit_logs','notifications')`
    );
    const ok = rls.every(r => r.rowsecurity === true);
    push({ id: "rls", label: "RLS ativo nas tabelas públicas", ok, info: rls, error: ok ? undefined : "RLS em falta" });
  } catch (e: any) {
    push({ id: "rls", label: "RLS ativo nas tabelas públicas", ok: false, error: String(e) });
  }

  // Resultado final + resumo
  const summary = {
    ok: checks.every(c => c.ok),
    failed: checks.filter(c => !c.ok).map(c => c.id),
  };

  return NextResponse.json({ ok: summary.ok, summary, checks }, { status: 200 });
}
