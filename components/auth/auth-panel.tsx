"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Building2, Loader2, PlayCircle, ShieldCheck, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Segmented } from "@/components/clay";
import { useMotionPrefs } from "@/lib/motion";
import { demoSignIn } from "@/server/actions/auth";
import type { Role } from "@/lib/roles";
import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";

export type AuthMode = "signin" | "signup";

const ROLES: { role: Role; label: string; icon: React.ReactNode }[] = [
  { role: "partner", label: "Partner", icon: <Building2 /> },
  { role: "staff", label: "Staff", icon: <ShieldCheck /> },
  { role: "volunteer", label: "Volunteer", icon: <Wrench /> },
];

/** The one sign-in / sign-up surface (AUTH-01..06): demo first, then a toggle between the two forms. */
export function AuthPanel({ mode: initialMode, next, invited, email, demo }: { mode: AuthMode; next?: string; invited?: boolean; email?: string; demo: boolean }) {
  const [mode, setMode] = useState<AuthMode>(invited ? "signup" : initialMode);
  const [demoOpen, setDemoOpen] = useState(false);
  const [pending, setPending] = useState<Role | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const { reduced, t } = useMotionPrefs();

  const switchMode = (m: AuthMode) => {
    setMode(m);
    const url = new URL(window.location.href);
    if (m === "signup") url.searchParams.set("mode", "signup");
    else url.searchParams.delete("mode");
    window.history.replaceState(null, "", url);
  };

  const go = async (role: Role) => {
    setPending(role);
    const res = await demoSignIn(role);
    if (!res.ok) {
      toast.error(res.error);
      setPending(null);
      return;
    }
    startTransition(() => {
      router.push(res.data.redirectTo);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {demo ? (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setDemoOpen((o) => !o)}
            aria-expanded={demoOpen}
            aria-controls="demo-roles"
            data-tint="butter"
            className="clay-sm clay-press flex h-14 w-full items-center justify-center gap-2.5 rounded-full text-[1.0625rem] font-semibold text-ink [&_svg]:size-5"
          >
            <PlayCircle strokeWidth={1.75} aria-hidden />
            DEMO — try it without an account
          </button>
          <AnimatePresence initial={false}>
            {demoOpen ? (
              <motion.div
                id="demo-roles"
                initial={reduced ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={reduced ? undefined : { opacity: 0, height: 0 }}
                transition={t("soft")}
                className="overflow-hidden"
              >
                <p className="pb-2 text-center text-small text-ink-2">Pick a role. It&apos;s all fictional seed data.</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {ROLES.map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => go(r.role)}
                      disabled={pending !== null}
                      className="clay-sm clay-press flex flex-col items-center gap-1.5 rounded-[var(--r-sm)] px-2 py-3.5 text-small font-semibold text-ink disabled:cursor-progress [&_svg]:size-5 [&_svg]:stroke-[1.75]"
                      data-tint="porcelain"
                      aria-label={`Explore the demo as ${r.label}`}
                    >
                      {pending === r.role ? <Loader2 className="animate-spin" aria-hidden /> : r.icon}
                      {pending === r.role ? "Signing in…" : r.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <div className="flex items-center gap-3 text-small text-ink-3" aria-hidden>
            <span className="h-px flex-1 bg-line" />
            or use your account
            <span className="h-px flex-1 bg-line" />
          </div>
        </div>
      ) : null}

      {!invited ? (
        <Segmented<AuthMode>
          label="Choose sign in or create an account"
          value={mode}
          onChange={switchMode}
          options={[
            { value: "signin", label: "I have an account" },
            { value: "signup", label: "I'm new here" },
          ]}
          className="w-full"
        />
      ) : null}

      {mode === "signin" ? <SignInForm next={next} /> : <SignUpForm invited={invited} email={email} />}

      {!invited ? (
        <p className="text-small text-ink-2">
          {mode === "signin" ? "New business partner? " : "Already have an account? "}
          <button type="button" onClick={() => switchMode(mode === "signin" ? "signup" : "signin")} className="inline-flex items-center gap-1 font-semibold text-loop-deep underline underline-offset-4">
            {mode === "signin" ? "Create a free account" : "Sign in instead"}
            <ArrowRight className="size-3.5" aria-hidden />
          </button>
        </p>
      ) : null}
    </div>
  );
}
