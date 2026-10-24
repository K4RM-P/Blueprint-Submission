import { longDate } from "./dates";
import type { BatchStatus } from "./domain";

export interface BatchDates {
  status: BatchStatus;
  created_at: string;
  approved_at: string | null;
  scheduled_at: string | null;
  received_at: string | null;
  completed_at: string | null;
  declined_at: string | null;
  decline_reason?: string | null;
}

const ORDER: BatchStatus[] = ["submitted", "approved", "scheduled", "received", "in_refurbishment", "completed"];

/** Steps for the PP-06 status timeline: Submitted → Approved/Declined → Scheduled → Received → In Refurbishment → Completed. */
export function batchSteps(b: BatchDates) {
  if (b.status === "declined") {
    return [
      { key: "submitted", label: "Submitted", date: longDate(b.created_at), done: true },
      { key: "declined", label: "Declined", date: longDate(b.declined_at), done: true },
    ];
  }
  const reached = ORDER.indexOf(b.status);
  const dates: Record<string, string | null> = {
    submitted: b.created_at,
    approved: b.approved_at,
    scheduled: b.scheduled_at,
    received: b.received_at,
    in_refurbishment: null,
    completed: b.completed_at,
  };
  const names: Record<string, string> = {
    submitted: "Submitted",
    approved: "Approved",
    scheduled: "Scheduled",
    received: "Received",
    in_refurbishment: "In refurbishment",
    completed: "Completed",
  };
  return ORDER.map((k, i) => ({
    key: k,
    label: names[k],
    date: i <= reached && dates[k] ? longDate(dates[k]) : null,
    done: i <= reached,
    current: i === reached + 1,
  }));
}
