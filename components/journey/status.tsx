import { StatusChip, type ChipTone } from "@/components/clay/status-chip";
import { labels, type BatchStatus, type DeviceStatus } from "@/lib/domain";

const BATCH_TONE: Record<BatchStatus, ChipTone> = {
  submitted: "apricot",
  approved: "butter",
  scheduled: "butter",
  received: "sky",
  in_refurbishment: "butter",
  completed: "mint",
  declined: "danger",
};

const DEVICE_TONE: Record<DeviceStatus, ChipTone> = {
  received: "neutral",
  testing: "butter",
  wipe_pending_verification: "sky",
  wipe_verified: "sky",
  refurbishing: "butter",
  ready: "mint",
  listed: "mint",
  sold: "mint",
  recycled: "neutral",
};

export function BatchStatusChip({ status }: { status: BatchStatus }) {
  return <StatusChip tone={BATCH_TONE[status]}>{labels.batchStatus[status]}</StatusChip>;
}

export function DeviceStatusChip({ status }: { status: DeviceStatus }) {
  return <StatusChip tone={DEVICE_TONE[status]}>{status === "sold" ? "Reused" : labels.deviceStatus[status]}</StatusChip>;
}
