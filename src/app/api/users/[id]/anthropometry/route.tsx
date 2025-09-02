// src/app/api/users/[id]/anthropometry/route.tsx
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/sessions";
import { toAppRole } from "@/lib/roles";
import { createServerClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lê o body como JSON, com fallback seguro */
async function readBody(req: Request): Promise<Record<string, any>> {
  try {
    const json = await req.json();
    if (json && typeof json === "object") return json as Record<string, any>;
  } catch {}
  return {};
}

/** Guarda de permissões:
 *  - ADMIN: tudo
 *  - o próprio cliente: pode ver/alterar o seu registo
 *  - PT: precisa de vínculo em trainer_clients
 */
async function ensureAccess(me: { id: string; role?: any }, clientId: string) {
  const role = toAppRole((me as any).role) ?? "CLIENT";
  if (role === "ADMIN") return true;
  if (me.id === clientId) return true;

  const supabase = createServerClient();
  const { data: link, error } = await supabase
    .from("trainer_clients")
    .select("id")
    .eq("trainer_id", me.id)
    .eq("client_id", clientId)
    .maybeSingle();

  if (error || !link) return false;
  return true;
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const me = await getSessionUser();
    if (!me) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

    const clientId = params.id;
    if (!clientId)
      return NextResponse.json({ ok: false, error: "MISSING_CLIENT_ID" }, { status: 400 });

    const allowed = await ensureAccess(me, clientId);
    if (!allowed) return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("anthropometry")
      .select("*")
      .eq("client_id", clientId)
      .order("measured_at", { ascending: false });

    if (error) {
      console.error("[anthropometry][GET] supabase error:", error);
      return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: data ?? [] });
  } catch (e: any) {
    console.error("[anthropometry][GET] 500:", e?.message ?? e);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const me = await getSessionUser();
    if (!me) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

    const clientId = params.id;
    if (!clientId)
      return NextResponse.json({ ok: false, error: "MISSING_CLIENT_ID" }, { status: 400 });

    const allowed = await ensureAccess(me, clientId);
    if (!allowed) return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

    const body = await readBody(req);
    // Campos típicos (ajusta aos nomes reais da tua tabela)
    const payload: Record<string, any> = {
      client_id: clientId,
      height_cm: body.height_cm ?? null,
      weight_kg: body.weight_kg ?? null,
      fat_pct: body.fat_pct ?? null,
      muscle_kg: body.muscle_kg ?? null,
      measured_at: body.measured_at ?? new Date().toISOString(),
      notes: body.notes ?? null,
      created_by: me.id,
    };

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("anthropometry")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      console.error("[anthropometry][POST] supabase error:", error);
      return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (e: any) {
    console.error("[anthropometry][POST] 500:", e?.message ?? e);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}