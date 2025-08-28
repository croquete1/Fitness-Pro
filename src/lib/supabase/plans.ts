import { getSBAdmin } from "./admin";
import { shallowPlanDiff } from "@/lib/logs";

export type TrainingPlan = {
  id: string;
  trainerId: string;
  clientId: string;
  title: string;
  notes: string | null;
  exercises: any;          // JSON
  status: string;          // 'ACTIVE' | 'DELETED' | ...
  createdAt: string;
  updatedAt: string;
};

type Patch = Partial<Pick<TrainingPlan, "title" | "notes" | "exercises" | "status">>;

export async function sbGetPlan(id: string): Promise<TrainingPlan | null> {
  const sb = getSBAdmin();
  const { data, error } = await sb.from("training_plans").select("*").eq("id", id).single();
  if (error) return null;
  return data as TrainingPlan;
}

export async function sbCreatePlan(
  input: {
    trainerId: string;
    clientId: string;
    title: string;
    notes?: string | null;
    exercises?: any;
    status?: string;
  },
  actorId: string
): Promise<TrainingPlan> {
  const sb = getSBAdmin();
  const payload = {
    trainer_id: input.trainerId,
    client_id: input.clientId,
    title: input.title,
    notes: input.notes ?? null,
    exercises: input.exercises ?? {},
    status: input.status ?? "ACTIVE",
  };

  const { data, error } = await sb
    .from("training_plans")
    .insert(payload)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message || "create failed");

  await sbLogPlanChange({
    planId: data.id,
    actorId,
    changeType: "create",
    snapshot: data,
  });

  return data as TrainingPlan;
}

export async function sbUpdatePlan(
  id: string,
  patch: Patch,
  actorId: string
): Promise<TrainingPlan> {
  const sb = getSBAdmin();
  const before = await sbGetPlan(id);
  if (!before) throw new Error("not_found");

  const updates: any = {};
  if (patch.title !== undefined) updates.title = patch.title;
  if (patch.notes !== undefined) updates.notes = patch.notes;
  if (patch.exercises !== undefined) updates.exercises = patch.exercises;
  if (patch.status !== undefined) updates.status = patch.status;

  if (!Object.keys(updates).length) return before;

  const { data, error } = await sb
    .from("training_plans")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message || "update failed");

  const diff = shallowPlanDiff(
    { title: before.title, notes: before.notes, exercises: before.exercises, status: before.status },
    { title: data.title,   notes: data.notes,   exercises: data.exercises,   status: data.status }
  );

  await sbLogPlanChange({
    planId: id,
    actorId,
    changeType: "update",
    diff,
    snapshot: data,
  });

  return data as TrainingPlan;
}

export async function sbSoftDeletePlan(id: string, actorId: string) {
  const sb = getSBAdmin();
  const before = await sbGetPlan(id);
  if (!before) throw new Error("not_found");

  const { data, error } = await sb
    .from("training_plans")
    .update({ status: "DELETED" })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message || "delete failed");

  await sbLogPlanChange({
    planId: id,
    actorId,
    changeType: "delete",
    diff: { from: { status: before.status }, to: { status: "DELETED" } },
    snapshot: data,
  });

  return true;
}

/* --------- change log --------- */
export async function sbLogPlanChange(args: {
  planId: string;
  actorId?: string | null;
  changeType: "create" | "update" | "delete";
  diff?: unknown;
  snapshot?: unknown;
}) {
  const sb = getSBAdmin();
  const payload = {
    plan_id: args.planId,
    actor_id: args.actorId ?? null,
    change_type: args.changeType,
    diff: args.diff ?? null,
    snapshot: args.snapshot ?? null,
  };
  const { error } = await sb.from("training_plan_changes").insert(payload);
  if (error) console.warn("[sbLogPlanChange] fail:", error.message);
}
