"use client";

export type StoryEventKind = "start" | "complete" | "share" | "drop";

/**
 * Anonymous, aggregate story analytics: the event kind and a slide key only.
 * No code, no device, no person. Fire-and-forget; failures never reach the UI.
 */
export function logStoryEvent(kind: StoryEventKind, slide?: string) {
  const body = JSON.stringify({ kind, slide: slide ?? null });
  try {
    if (kind === "drop" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon("/api/passport-events", new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch("/api/passport-events", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => undefined);
  } catch {
    // analytics must never break the story
  }
}
