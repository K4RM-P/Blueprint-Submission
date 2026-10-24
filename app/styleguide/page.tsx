import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StyleguideClient } from "./styleguide-client";

export const metadata: Metadata = { title: "Styleguide", robots: { index: false } };

export default function StyleguidePage() {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_DEMO_MODE !== "true") notFound();
  return <StyleguideClient />;
}
