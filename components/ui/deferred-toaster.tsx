"use client";

import dynamic from "next/dynamic";

/** The toast host loads after hydration, so sonner never sits on the first-paint path of public pages. */
export const DeferredToaster = dynamic(() => import("./sonner").then((m) => m.Toaster), { ssr: false });
