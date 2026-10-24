"use client";

import { Printer } from "lucide-react";
import { ClayButton } from "@/components/clay";

export function PrintButton({ label = "Print labels" }: { label?: string }) {
  return (
    <ClayButton variant="primary" icon={<Printer />} onClick={() => window.print()}>
      {label}
    </ClayButton>
  );
}
