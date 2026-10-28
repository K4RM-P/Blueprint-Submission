"use client";

import { useEffect, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";

/**
 * Printing the story URL prints the flat passport instead of the player (DP-11). The printable
 * copy mounts when the page is about to print, or quietly a few seconds after load, so its
 * components never compete with the story while the page is loading.
 */
export function PrintOnly({ children }: { children: ReactNode }) {
  const [printing, setPrinting] = useState(false);
  useEffect(() => {
    const show = () => flushSync(() => setPrinting(true));
    const mq = window.matchMedia("print");
    const onChange = (e: MediaQueryListEvent) => e.matches && show();
    window.addEventListener("beforeprint", show);
    mq.addEventListener("change", onChange);
    // Some print paths (print-to-PDF, emulated print media) don't fire either event.
    const later = window.setTimeout(() => setPrinting(true), mq.matches ? 0 : 4000);
    return () => {
      window.removeEventListener("beforeprint", show);
      mq.removeEventListener("change", onChange);
      window.clearTimeout(later);
    };
  }, []);
  return printing ? <div className="story-print-only">{children}</div> : null;
}
