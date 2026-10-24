# Blueprint Submission

Hackathon project, built by two collaborators who both use Claude Code on this repo at the same time. Staying in sync matters more than anything else.

## Project overview
Relay: a web app for Free Geek Toronto. It has a Partner Portal (businesses donate laptop batches and get certificates and ESG impact), a Staff Console, a Volunteer Bench with a Skills Wallet, and a public Device Passport for each device.
Sources of truth: `PRD.md` (what to build), `UI_UX_DESIGN.md` (look and motion; supersedes PRD §15), `KICKOFF_PROMPT.md` (stages). Never edit those three files.

- **Stack:** Next.js 16 (App Router, Turbopack, `proxy.ts` instead of middleware, cacheComponents OFF), TypeScript strict, Tailwind v4, shadcn primitives (radix) restyled to tokens, `motion`, Supabase (`@supabase/ssr`), Zod, React Hook Form, Recharts, qrcode, @react-pdf/renderer, Vitest, Playwright, pnpm.
- **How to run:** `pnpm install` → copy `.env.example` to `.env.local` → `pnpm dev` → http://localhost:3000/demo
- **Commands:** `pnpm typecheck` · `pnpm lint` · `pnpm test` (Vitest) · `pnpm test:e2e` (Playwright; starts `pnpm start`, so run `pnpm build` first) · `pnpm build` · `pnpm db:push` (needs `supabase login` + link) · `pnpm db:types` · `pnpm seed` (idempotent, uses the secret key from .env.local)
- **Key folders:** `app/(public)` public site · `app/partner|staff|volunteer` role apps · `components/clay` + `components/liquid` + `components/illustrations` = design system (see `/styleguide`; reuse, no one-off styles) · `components/ui` restyled shadcn primitives · `lib/` pure tested business logic (batch-score, capacity, impact, status-machine, badges, passport-code, certificate-number) · `server/actions` server actions (Zod-validated) · `supabase/migrations` SQL · `supabase/seed.ts` · `tests/unit`, `tests/e2e`

## Coding rules (from KICKOFF_PROMPT Part A)
- TypeScript strict, no `any` without a justifying comment. Zod on every server action and route. Loading, empty and error states on every page. Accessible (labels, focus ring, keyboard). No console errors.
- The secret key is used only in `supabase/seed.ts` and the payment webhook (`lib/supabase/admin.ts`). Permissions are enforced by RLS and in server actions. `device_events` is append-only.
- Business formulas live once in `lib/` with unit tests. UI calls them and never re-implements them.
- Reference PRD requirement IDs in commits and tests. Stage commits look like `stage-N: <name> (<IDs>)` and get tagged `stage-N`.
- Clay goes only on things you can touch, liquid only means fill or flow, max 2 tints and 1 primary button per view (UI_UX_DESIGN §12/§14).

## Current stage
All build stages (0–10) are done. What's left is deployment (Vercel), replacing the TO VERIFY / [ASSUMPTION] values, and the video. The database is live: migrations pushed and seeded, and the Supabase CLI is linked; `pnpm db:push`, `pnpm db:types` and `pnpm seed` all work.
See `PROGRESS.md` for the stage log, deferred items, decisions and the security review. `README.md` is judge-facing; `DEMO_SCRIPT.md` is the video click path.
- Payments: `lib/payments/` (mock by default, Stripe test mode only). The webhook is the only service-role path besides the seed.
- Colour tokens: `--ink-3` is `#5A635E` and the ember button surface is `#C24A16`. Both were darkened from the UI spec values to pass axe/WCAG AA; don't revert them.

## Sync workflow (required for every task)
1. **Before any edit:** run `git status`. If there are uncommitted local changes, commit or stash them first. Then run `git pull --rebase` to get the teammate's latest work.
2. **Make the requested changes.** Keep them focused on what was asked. Don't reformat or restructure files you didn't need to touch, because that causes merge conflicts with the teammate.
3. **Verify:** make sure the project still builds or runs before committing.
4. **Commit:** stage only the relevant files and write a clear, descriptive commit message (e.g. "Add login form validation", not "updates").
5. **Pull again, then push:** run `git pull --rebase` right before `git push`, since the teammate may have pushed while you were working. Then push.
6. **Report:** tell the user briefly what changed, the commit message, and whether the push succeeded.

## Cloud sessions
Some tasks run as Claude Code cloud sessions (started with `claude --cloud` or from claude.ai/code) instead of on a laptop. A cloud session has the environment variable `CLAUDE_CODE_REMOTE=true`. In a cloud session, follow these rules instead of pushing straight to `main`:
- **Work on the session's own branch.** Never push directly to `main`, because several cloud tasks may be running in parallel.
- **Start from the latest `main`.** Before making changes, fetch and rebase onto `origin/main` so the work builds on the teammate's latest commits.
- **Finish with a pull request.** Rebase onto `origin/main` again before pushing, then open a PR into `main` with a clear title and summary. One of us reviews and merges it.
- **Secrets live in the cloud environment settings,** not in the repo.

Local (laptop) sessions keep following the sync workflow above.

## Conflict and safety rules
- Never use `git push --force`, `git reset --hard`, or anything else that could delete the teammate's work.
- If a pull or rebase causes merge conflicts, try to resolve them in a way that keeps both sets of changes. If you aren't sure what the teammate intended, stop and show the user the conflict instead of guessing.
- If a push is rejected, pull with rebase and try again. Never force it.
- Never commit secrets, API keys, or `.env` files.
- Commit and push small, frequent changes instead of large batches, so the two of us stay in sync.
