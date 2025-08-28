// src/app/api/pt/plans/[id]/route.ts
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";
import { Role } from "@prisma/client";
import { sbGetPlan, sbSoftDeletePlan, sbUpdatePlan } from "@/lib/supabase/plans";

export const dynamic = "force-dynamic";

function canAccess(user: { id: string; role: Role }, plan: { trainerId: string; clientId: string }) {
  if (user.role === Role.ADMIN) return true;
  if (user.role === Role.TRAINER && plan.trainerId === user.id) return true;
  if (user.role === Role.CLIENT && plan.clientId === user.id) return true;
  return false;
}

// GET plano
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireUser([Role.ADMIN, Role.TRAINER, Role.CLIENT]);
  if ("error" in guard) return guard.error;
  const { user } = guard;

  const plan = await sbGetPlan(params.id);
  if (!plan) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (!canAccess(user, { trainerId: plan.trainerId, clientId: plan.clientId })) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return NextResponse.json({ plan });
}

// PATCH plano
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireUser([Role.ADMIN, Role.TRAINER]);
  if ("error" in guard) return guard.error;
  const { user } = guard;

  const cur = await sbGetPlan(params.id);
  if (!cur) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (!canAccess(user, { trainerId: cur.trainerId, clientId: cur.clientId })) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const patch: any = {};
  if (typeof body.title === "string") patch.title = body.title;
  if (typeof body.notes === "string" || body.notes === null) patch.notes = body.notes ?? null;
  if ("exercises" in body) patch.exercises = body.exercises;
  if (typeof body.status === "string") patch.status = body.status;

  const updated = await sbUpdatePlan(params.id, patch, user.id!);
  return NextResponse.json({ plan: updated });
}

// DELETE (soft-delete)
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireUser([Role.ADMIN, Role.TRAINER]);
  if ("error" in guard) return guard.error;
  const { user } = guard;

  const cur = await sbGetPlan(params.id);
  if (!cur) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (!canAccess(user, { trainerId: cur.trainerId, clientId: cur.clientId })) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await sbSoftDeletePlan(params.id, user.id!);
  return NextResponse.json({ ok: true });
}
