import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { ClayCard, EmptyState } from "@/components/clay";
import { DeviceStatusChip } from "@/components/journey/status";
import { PageHeader } from "@/components/shell/page-header";
import { ClaimButton, ClaimSetButton } from "@/components/volunteer/claim-button";
import { requireRole } from "@/lib/auth";
import { nextStep, stepsDone } from "@/lib/queries/volunteer";
import { CHECKLIST_STEPS, labels } from "@/lib/domain";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "My Bench" };

export default async function VolunteerBench() {
  const { supabase, profile } = await requireRole("volunteer");
  const [{ data: mine }, { data: queue }] = await Promise.all([
    supabase
      .from("devices")
      .select("id, passport_code, make, model, category, status, source, cpu, ram_gb, storage_gb")
      .eq("assigned_volunteer_id", profile.id)
      .not("status", "in", "(sold,recycled,listed)")
      .order("updated_at", { ascending: false }),
    supabase.rpc("bench_queue", { p_limit: 50 }),
  ]);
  const devices = mine ?? [];
  const done = await stepsDone(supabase, devices.map((d) => d.id));
  const active = devices.filter((d) => nextStep(done.get(d.id)) !== null);
  const waitingOnStaff = devices.filter((d) => nextStep(done.get(d.id)) === null);
  const waiting = queue?.length ?? 0;
  const top = queue?.[0];
  // Identical devices on the bench can be worked as a set (one tap per step).
  const sets = [...active.reduce((m, d) => m.set(`${d.make}\u0000${d.model}`, [...(m.get(`${d.make}\u0000${d.model}`) ?? []), d]), new Map<string, typeof active>()).values()].filter((g) => g.length >= 2);

  return (
    <>
      <PageHeader
        title="My Bench"
        description={`${profile.display_first_name ? `Hi ${profile.display_first_name}. ` : ""}${active.length ? `You have ${active.length} device${active.length === 1 ? "" : "s"} in progress.` : "Claim a laptop to start refurbishing it."} Every step you finish is stamped on the laptop's Device Passport.`}
        actions={
          <div className="hidden items-center gap-2 lg:flex">
            <ClaimSetButton waiting={waiting} />
            <ClaimButton waiting={waiting} />
          </div>
        }
      />
      {sets.length > 0 ? (
        <section aria-labelledby="sets" className="mb-8">
          <h2 id="sets" className="sr-only">
            Work as a set
          </h2>
          <ul className="flex flex-col gap-3">
            {sets.map((g) => (
              <li key={`${g[0].make}-${g[0].model}`}>
                <ClayCard href={`/volunteer/set?make=${encodeURIComponent(g[0].make)}&model=${encodeURIComponent(g[0].model)}`} tint="mint" className="flex items-center justify-between gap-4" aria-label={`Work on all ${g.length} ${g[0].make} ${g[0].model} together`}>
                  <span>
                    <span className="block text-lg font-semibold">
                      Work on all {g.length} {g[0].make} {g[0].model} together
                    </span>
                    <span className="block text-small text-ink-2">Same model, same steps: one tap per step. Each data wipe still gets its own reference.</span>
                  </span>
                  <ArrowRight className="size-5 shrink-0" aria-hidden />
                </ClayCard>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {active.length === 0 ? (
        <EmptyState title="Your bench is clear." tone="butter" art="baton">
          {top ? (
            <>
              Next up: <span className="font-semibold text-ink">{top.make} {top.model}</span>
              {top.source === "partner" ? ", from a Reuse Partner batch" : ", a household donation"}.{" "}
            </>
          ) : null}
          Claim it and we&apos;ll guide you through four steps: test, wipe, install, check.
        </EmptyState>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">
          {active.map((d) => {
            const set = done.get(d.id);
            const next = nextStep(set);
            return (
              <li key={d.id}>
                <ClayCard tint="butter" href={`/volunteer/devices/${d.id}`} aria-label={`Open checklist for ${d.make} ${d.model}`} size="lg" className="flex min-h-56 flex-col gap-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-small text-ink-2">{d.passport_code}</p>
                      <h2 className="font-display mt-1 text-[1.75rem] leading-tight">
                        {d.make} {d.model}
                      </h2>
                    </div>
                    <DeviceStatusChip status={d.status} />
                  </div>
                  <p className="-mt-2 text-small text-ink-2">{d.source === "partner" ? "From a Reuse Partner batch" : "A household donation"} · your work goes on its Device Passport</p>
                  <ol className="flex gap-2" aria-label="Checklist progress">
                    {CHECKLIST_STEPS.map((s) => (
                      <li key={s} className={cn("flex h-2 flex-1 rounded-full", set?.has(s) ? "bg-loop" : "bg-white/70")}>
                        <span className="sr-only">
                          {labels.step[s]}: {set?.has(s) ? "done" : "to do"}
                        </span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-auto flex items-center justify-between font-semibold">
                    Next: {next ? labels.step[next] : "Done"}
                    <ArrowRight className="size-5" aria-hidden />
                  </p>
                </ClayCard>
              </li>
            );
          })}
        </ul>
      )}

      {waitingOnStaff.length > 0 ? (
        <section className="mt-10" aria-labelledby="waiting">
          <h2 id="waiting" className="text-title font-semibold">
            Waiting on staff
          </h2>
          <p className="text-small text-ink-2">You finished these. Staff verify each wipe, so it counts as a certified data wipe on the business&apos;s certificate.</p>
          <ul className="mt-4 flex flex-col gap-2">
            {waitingOnStaff.map((d) => (
              <li key={d.id} className="glass flex items-center justify-between gap-3 rounded-[18px] px-4 py-3">
                <Link href={`/volunteer/devices/${d.id}`} className="min-w-0 font-medium">
                  <span className="mr-2 font-mono text-small text-ink-2">{d.passport_code}</span>
                  {d.make} {d.model}
                </Link>
                <span className="inline-flex items-center gap-1 text-small text-loop-deep">
                  <Check className="size-4" aria-hidden /> 4/4
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <div aria-hidden className="h-20 lg:hidden" />
      <div className="mb-4 flex justify-center lg:hidden">
        <ClaimSetButton waiting={waiting} />
      </div>
      <div className="lg:hidden">
        <ClaimButton waiting={waiting} floating />
      </div>
    </>
  );
}
