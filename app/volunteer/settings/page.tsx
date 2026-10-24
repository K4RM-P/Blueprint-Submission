import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/page-header";
import { PrivacyForm } from "@/components/volunteer/privacy-form";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: "Privacy" };

/** VW-07: attribution and public profile, both off by default. */
export default async function VolunteerSettings() {
  const { profile } = await requireRole("volunteer");
  return (
    <>
      <PageHeader eyebrow="Privacy" title="You decide what's public." description="Nothing about you appears publicly unless you turn it on here." />
      <PrivacyForm
        initial={{
          displayFirstName: profile.display_first_name ?? (profile.full_name ?? "").split(" ")[0],
          attributionOptIn: profile.attribution_opt_in,
          publicProfileOptIn: profile.public_profile_opt_in,
          handle: profile.public_handle ?? "",
        }}
      />
    </>
  );
}
