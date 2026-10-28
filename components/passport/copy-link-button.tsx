"use client";

import { Link2 } from "lucide-react";
import { toast } from "sonner";
import { ClayButton } from "@/components/clay";

/** Copy the public passport link (the owning partner's quick share). */
export function CopyLinkButton({ path }: { path: string }) {
  const copy = async () => {
    const url = `${window.location.origin}${path}`;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: "Device Passport", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied. Anyone with it sees the public passport.");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast(`Share this link: ${url}`);
    }
  };
  return (
    <ClayButton variant="secondary" size="sm" icon={<Link2 />} onClick={copy}>
      Share its story
    </ClayButton>
  );
}
