// src/app/api/pt/plans/route.ts
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";
import { Role } from "@prisma/client";
import { sbCreatePlan } from "@/lib/supabase/plans";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const guard = await requireUser([Role.ADMIN, Role.TRAINER]);
  if ("error" in guard) return guard.error;
  const { user } = guard;

  const body = await req.json().catch(() => ({}));
  const trainerId = body.trainerId || user.id!;
  const clientId: string = body.clientId;
  const title: string = body.title;
  const notes = body.notes ?? null;
  const exercises = body.exercises ?? {};
  const status = body.status ?? "ACTIVE";

  if (!clientId || !title) {
    return NextResponse.json({ error: "clientId e title são obrigatórios" }, { status: 400 });
  }

  const plan = await sbCreatePlan(
    { trainerId, clientId, title, notes, exercises, status },
    user.id!
  );

  return NextResponse.json({ plan }, { status: 201 });
}
