import type { Metadata } from "next";
import { FlatCard } from "@/components/clay";
import { PageHeader } from "@/components/shell/page-header";
import { InviteForm, MentorButton } from "@/components/staff/volunteer-admin";
import { requireRole } from "@/lib/auth";
import { longDate } from "@/lib/dates";

export const metadata: Metadata = { title: "Volunteers" };

/** OPS-11 (P1): create volunteer accounts, see devices worked, badges, last activity; award Mentor. */
export default async function StaffVolunteers() {
  const { supabase } = await requireRole("staff");
  const [{ data: vols }, { data: events }, { data: vb }, { data: invites }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, public_handle, created_at").eq("role", "volunteer").order("full_name"),
    supabase.from("device_events").select("actor_id, step, created_at, event_type").eq("event_type", "step_completed"),
    supabase.from("volunteer_badges").select("volunteer_id, badges(slug, name)"),
    supabase.from("account_invites").select("email, full_name, role, used_at, created_at").is("used_at", null).order("created_at", { ascending: false }),
  ]);
  const rows = (vols ?? []).map((v) => {
    const mine = (events ?? []).filter((e) => e.actor_id === v.id);
    const badges = (vb ?? []).filter((b) => b.volunteer_id === v.id).map((b) => b.badges);
    return {
      ...v,
      devices: mine.filter((e) => e.step === "final_qa").length,
      steps: mine.length,
      last: mine.reduce<string | null>((m, e) => (!m || e.created_at > m ? e.created_at : m), null),
      badges,
      mentor: badges.some((b) => b?.slug === "mentor"),
    };
  });
  return (
    <>
      <PageHeader eyebrow="Staff Console" title="Volunteers" description={`${rows.length} volunteers. Scheduling stays in FGT's volunteer platform — this page is about impact and credentials.`} />
      <FlatCard className="mb-6">
        <h2 className="mb-4 font-semibold">Invite a volunteer or staff member</h2>
        <InviteForm />
        {(invites ?? []).length ? <p className="mt-4 text-small text-ink-2">Pending invites: {(invites ?? []).map((i) => `${i.full_name} (${i.role})`).join(", ")}</p> : null}
      </FlatCard>
      <div className="flat overflow-x-auto !p-0">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Volunteer</th>
              <th scope="col" className="text-right">Devices</th>
              <th scope="col" className="text-right">Steps</th>
              <th scope="col">Badges</th>
              <th scope="col">Last activity</th>
              <th scope="col">Mentor</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.id}>
                <td>
                  <span className="font-semibold">{v.full_name}</span>
                  <span className="block text-[0.8125rem] text-ink-2">since {longDate(v.created_at)}</span>
                </td>
                <td className="text-right font-semibold">{v.devices}</td>
                <td className="text-right">{v.steps}</td>
                <td className="max-w-72 text-small text-ink-2">{v.badges.map((b) => b?.name).join(", ") || "—"}</td>
                <td>{longDate(v.last)}</td>
                <td>
                  <MentorButton volunteerId={v.id} has={v.mentor} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
