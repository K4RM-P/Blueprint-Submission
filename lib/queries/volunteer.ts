import "server-only";
import type { DB } from "./common";
import { CHECKLIST_STEPS, type ChecklistStep } from "@/lib/domain";

export async function stepsDone(db: DB, deviceIds: string[]): Promise<Map<string, Set<ChecklistStep>>> {
  const map = new Map<string, Set<ChecklistStep>>();
  if (deviceIds.length === 0) return map;
  const { data } = await db.from("device_events").select("device_id, step").eq("event_type", "step_completed").in("device_id", deviceIds);
  for (const e of data ?? []) {
    if (!e.step || !(CHECKLIST_STEPS as readonly string[]).includes(e.step)) continue;
    if (!map.has(e.device_id)) map.set(e.device_id, new Set());
    map.get(e.device_id)!.add(e.step as ChecklistStep);
  }
  return map;
}

export function nextStep(done: Set<ChecklistStep> | undefined): ChecklistStep | null {
  return CHECKLIST_STEPS.find((s) => !done?.has(s)) ?? null;
}
