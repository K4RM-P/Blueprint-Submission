/**
 * GeekLoop demo seed (PRD §16). Idempotent: wipes demo data and rebuilds it.
 * Run with `pnpm seed`. Uses the service-role key — server-side only.
 *
 * All organizations and people are fictional. Impact factors are marked
 * "TO VERIFY" and the price breakdown is illustrative (PRD §9.6, §9.7).
 */
import { createClient } from "@supabase/supabase-js";
import { computeBatchScore } from "../lib/batch-score";
import { BADGES, evaluateBadges, type VolunteerStats } from "../lib/badges";
import { formatCertificateNumber } from "../lib/certificate-number";
import { DEFAULT_ACCEPTED_ITEMS } from "../lib/checker";
import { addDays, mondayOf, toISODate } from "../lib/dates";
import type { DeviceCategory, DeviceCondition, DeviceStatus, PartnerTier, RecipientCategory, SaleChannel } from "../lib/domain";
import { generateUniqueCodes } from "../lib/passport-code";
import { devicePath } from "../lib/status-machine";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.DEMO_PASSWORD;
if (!url || !key || !password) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or DEMO_PASSWORD in .env.local");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const NOW = new Date();
const DOMAIN = "@geekloop.test";

// ------------------------------------------------------------------ deterministic randomness
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261030);
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const between = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
const hours = (h: number) => h * 3_600_000;
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000);
const codeRandom = (bytes: Uint8Array) => bytes.map(() => Math.floor(rand() * 256));

async function must<T>(label: string, p: PromiseLike<{ data: T; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await p;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data;
}

async function chunked<T>(label: string, table: string, rows: T[], size = 200) {
  for (let i = 0; i < rows.length; i += size) {
    await must(label, db.from(table).insert(rows.slice(i, i + size) as never));
  }
}

// ------------------------------------------------------------------ reference data
const SETTINGS = {
  id: 1,
  weekly_capacity_devices: 20,
  refurb_minutes_uniform: 60,
  refurb_minutes_mixed: 120,
  batch_score_weights: { uniformity: 0.4, youth: 0.25, volume: 0.2, laptopShare: 0.15 },
  max_device_age_years: 8,
  price_breakdown: [
    { label: "Refurbishing & testing", percent: 35, description: "Parts, tools and volunteer-led testing on every device." },
    { label: "Data security", percent: 10, description: "Certified wiping and verification of every drive." },
    { label: "Fair wages & training", percent: 30, description: "Paid roles and training for people facing barriers to work." },
    { label: "Operations & space", percent: 15, description: "Rent, power and the workshop at 180 Sudbury Street." },
    { label: "Digital-inclusion programs", percent: 10, description: "Low-cost devices and help for people getting online." },
  ],
  price_breakdown_confirmed: false,
  accepted_items: DEFAULT_ACCEPTED_ITEMS,
};

// [ASSUMPTION] placeholders — replace with cited values before submission (PRD §9.6).
const FACTORS: { category: DeviceCategory; avg_weight_kg: number; co2e_avoided_kg_per_reuse: number }[] = [
  { category: "laptop", avg_weight_kg: 2.1, co2e_avoided_kg_per_reuse: 230 },
  { category: "desktop", avg_weight_kg: 8.5, co2e_avoided_kg_per_reuse: 300 },
  { category: "monitor", avg_weight_kg: 5.2, co2e_avoided_kg_per_reuse: 210 },
  { category: "tablet", avg_weight_kg: 0.6, co2e_avoided_kg_per_reuse: 90 },
  { category: "accessory", avg_weight_kg: 0.4, co2e_avoided_kg_per_reuse: 5 },
  { category: "other", avg_weight_kg: 1.5, co2e_avoided_kg_per_reuse: 20 },
];

const BADGE_ICONS: Record<string, string> = {
  "first-boot": "cpu",
  diagnostician: "stethoscope",
  "data-guardian": "shield-check",
  "open-source-installer": "terminal",
  "bench-regular": "wrench",
  century: "trophy",
  mentor: "users",
};

interface OrgSeed {
  slug: string;
  name: string;
  industry: string;
  employee_range: string;
  website: string;
  tier: PartnerTier;
  wall: boolean;
  attribution: boolean;
  joinedDaysAgo: number;
}

const ORGS: OrgSeed[] = [
  { slug: "maple-ledger-accounting", name: "Maple Ledger Accounting", industry: "Accounting", employee_range: "51-200", website: "https://maple-ledger.example", tier: "impact", wall: true, attribution: true, joinedDaysAgo: 175 },
  { slug: "harbourfront-dental-group", name: "Harbourfront Dental Group", industry: "Healthcare", employee_range: "11-50", website: "https://harbourfront-dental.example", tier: "community", wall: true, attribution: true, joinedDaysAgo: 150 },
  { slug: "brightpath-logistics", name: "Brightpath Logistics", industry: "Logistics", employee_range: "201-500", website: "https://brightpath-logistics.example", tier: "champion", wall: true, attribution: true, joinedDaysAgo: 168 },
  { slug: "queen-west-design-co", name: "Queen West Design Co.", industry: "Design", employee_range: "11-50", website: "https://queenwest-design.example", tier: "impact", wall: true, attribution: false, joinedDaysAgo: 90 },
  { slug: "danforth-legal-llp", name: "Danforth Legal LLP", industry: "Legal", employee_range: "11-50", website: "https://danforth-legal.example", tier: "community", wall: true, attribution: true, joinedDaysAgo: 40 },
  { slug: "kensington-code-collective", name: "Kensington Code Collective", industry: "Software", employee_range: "11-50", website: "https://kensington-code.example", tier: "community", wall: false, attribution: false, joinedDaysAgo: 12 },
  { slug: "lakeshore-physiotherapy", name: "Lakeshore Physiotherapy", industry: "Healthcare", employee_range: "1-10", website: "https://lakeshore-physio.example", tier: "community", wall: false, attribution: false, joinedDaysAgo: 30 },
  { slug: "annex-architecture-studio", name: "Annex Architecture Studio", industry: "Architecture", employee_range: "11-50", website: "https://annex-architecture.example", tier: "impact", wall: false, attribution: true, joinedDaysAgo: 60 },
];

interface UserSeed {
  email: string;
  role: "partner" | "staff" | "volunteer";
  full_name: string;
  org?: string;
  handle?: string;
  attribution?: boolean;
  publicProfile?: boolean;
}

const USERS: UserSeed[] = [
  { email: `demo-partner${DOMAIN}`, role: "partner", full_name: "Priya Sharma", org: "maple-ledger-accounting" },
  { email: `demo-partner-2${DOMAIN}`, role: "partner", full_name: "Daniel Okoye", org: "harbourfront-dental-group" },
  { email: `demo-staff${DOMAIN}`, role: "staff", full_name: "Marcus Bennett" },
  { email: `demo-volunteer${DOMAIN}`, role: "volunteer", full_name: "Aisha Rahman", handle: "aisha-rahman", attribution: true, publicProfile: true },
  { email: `volunteer-jordan${DOMAIN}`, role: "volunteer", full_name: "Jordan Lee", handle: "jordan-lee", attribution: true, publicProfile: true },
  { email: `volunteer-mei${DOMAIN}`, role: "volunteer", full_name: "Mei Chen", attribution: true },
  { email: `volunteer-tomas${DOMAIN}`, role: "volunteer", full_name: "Tomás Rivera" },
  { email: `volunteer-sam${DOMAIN}`, role: "volunteer", full_name: "Sam Okafor", attribution: true },
];

// ------------------------------------------------------------------ batches & devices
interface LineSeed {
  category: DeviceCategory;
  make: string;
  model: string;
  year: number | null;
  qty: number;
  condition: DeviceCondition;
  cpu?: string;
  ram?: number;
  storage?: number;
  /** Device statuses for received batches, one per device (defaults to all `received`). */
  statuses?: DeviceStatus[];
}

interface BatchSeed {
  key: string;
  org: string;
  status: "submitted" | "approved" | "declined" | "scheduled" | "received" | "in_refurbishment" | "completed";
  createdDaysAgo: number;
  /** For received+ batches: days ago the batch arrived. */
  receivedDaysAgo?: number;
  /** Week offset from this Monday for preferred/scheduled week. */
  weekOffset: number;
  logistics?: "dropoff" | "pickup";
  notes?: string;
  decline?: string;
  certificate?: number;
  lines: LineSeed[];
}

const rep = <T>(n: number, v: T): T[] => Array.from({ length: n }, () => v);

const BATCHES: BatchSeed[] = [
  {
    key: "B1", org: "maple-ledger-accounting", status: "completed", createdDaysAgo: 172, receivedDaysAgo: 160, weekOffset: -23, certificate: 1,
    notes: "Office refresh — chargers included.",
    lines: [{ category: "laptop", make: "Lenovo", model: "ThinkPad T480", year: 2019, qty: 12, condition: "working", cpu: "Intel Core i5-8350U", ram: 8, storage: 256, statuses: [...rep(10, "sold"), ...rep(2, "recycled")] as DeviceStatus[] }],
  },
  {
    key: "B2", org: "brightpath-logistics", status: "completed", createdDaysAgo: 150, receivedDaysAgo: 140, weekOffset: -20, logistics: "pickup", certificate: 2,
    lines: [{ category: "laptop", make: "HP", model: "EliteBook 840 G6", year: 2020, qty: 24, condition: "working", cpu: "Intel Core i5-8365U", ram: 16, storage: 256, statuses: [...rep(19, "sold"), ...rep(2, "listed"), "ready", ...rep(2, "recycled")] as DeviceStatus[] }],
  },
  {
    key: "B3", org: "maple-ledger-accounting", status: "in_refurbishment", createdDaysAgo: 30, receivedDaysAgo: 19, weekOffset: -3,
    lines: [{ category: "laptop", make: "Dell", model: "Latitude 7400", year: 2019, qty: 8, condition: "working", cpu: "Intel Core i7-8665U", ram: 16, storage: 512, statuses: ["received", "received", "testing", "wipe_pending_verification", "wipe_pending_verification", "wipe_verified", "refurbishing", "ready"] }],
  },
  {
    key: "B4", org: "queen-west-design-co", status: "in_refurbishment", createdDaysAgo: 75, receivedDaysAgo: 62, weekOffset: -9,
    lines: [{ category: "laptop", make: "Lenovo", model: "ThinkPad X1 Carbon (6th gen)", year: 2018, qty: 10, condition: "working", cpu: "Intel Core i7-8550U", ram: 16, storage: 512, statuses: [...rep(6, "sold"), "listed", "listed", "ready", "ready"] as DeviceStatus[] }],
  },
  {
    key: "B5", org: "harbourfront-dental-group", status: "received", createdDaysAgo: 14, receivedDaysAgo: 4, weekOffset: 0,
    lines: [
      { category: "desktop", make: "Dell", model: "OptiPlex 7070", year: 2019, qty: 6, condition: "working", cpu: "Intel Core i5-9500", ram: 8, storage: 256 },
      { category: "monitor", make: "Dell", model: "P2419H", year: 2019, qty: 3, condition: "working" },
    ],
  },
  {
    key: "B11", org: "brightpath-logistics", status: "in_refurbishment", createdDaysAgo: 52, receivedDaysAgo: 42, weekOffset: -6, logistics: "pickup",
    lines: [{ category: "laptop", make: "Lenovo", model: "ThinkPad T490", year: 2020, qty: 12, condition: "working", cpu: "Intel Core i5-8265U", ram: 16, storage: 256, statuses: [...rep(8, "sold"), "listed", "listed", "refurbishing", "refurbishing"] as DeviceStatus[] }],
  },
  {
    key: "B12", org: "harbourfront-dental-group", status: "in_refurbishment", createdDaysAgo: 128, receivedDaysAgo: 120, weekOffset: -17,
    lines: [{ category: "laptop", make: "Apple", model: "MacBook Pro 13 (2017)", year: 2017, qty: 4, condition: "partially_working", cpu: "Intel Core i5-7360U", ram: 8, storage: 256, statuses: ["sold", "sold", "sold", "recycled"] }],
  },
  {
    key: "B6", org: "danforth-legal-llp", status: "scheduled", createdDaysAgo: 9, weekOffset: 1,
    lines: [
      { category: "laptop", make: "Dell", model: "Latitude 5410", year: 2020, qty: 5, condition: "working" },
      { category: "accessory", make: "Logitech", model: "MK270 keyboard + mouse", year: 2020, qty: 2, condition: "working" },
    ],
  },
  {
    key: "B7", org: "annex-architecture-studio", status: "approved", createdDaysAgo: 6, weekOffset: 2,
    lines: [{ category: "laptop", make: "HP", model: "ZBook 15 G5", year: 2018, qty: 15, condition: "working" }],
  },
  {
    key: "B8", org: "maple-ledger-accounting", status: "submitted", createdDaysAgo: 1, weekOffset: 3,
    notes: "Our 3-year refresh. All units have chargers and work well.",
    lines: [{ category: "laptop", make: "Dell", model: "Latitude 5420", year: 2021, qty: 20, condition: "working" }],
  },
  {
    key: "B9", org: "kensington-code-collective", status: "submitted", createdDaysAgo: 2, weekOffset: 2,
    lines: [
      { category: "laptop", make: "Apple", model: "MacBook Air (2015)", year: 2015, qty: 1, condition: "working" },
      { category: "laptop", make: "Asus", model: "ZenBook UX430", year: 2017, qty: 2, condition: "partially_working" },
      { category: "monitor", make: "Samsung", model: "S24F350", year: 2016, qty: 2, condition: "working" },
    ],
  },
  {
    key: "B10", org: "lakeshore-physiotherapy", status: "declined", createdDaysAgo: 25, weekOffset: -2,
    decline: "These are mostly CRT monitors and a fax machine, which we can't refurbish. An Ontario-approved e-waste depot can recycle them safely — and we'd love your laptops next refresh.",
    lines: [{ category: "other", make: "Various", model: "CRT monitors and fax machine", year: 2006, qty: 5, condition: "unknown" }],
  },
  {
    key: "B13", org: "queen-west-design-co", status: "submitted", createdDaysAgo: 3, weekOffset: 4,
    lines: [{ category: "tablet", make: "Microsoft", model: "Surface Pro 6", year: 2018, qty: 6, condition: "working" }],
  },
  {
    key: "B14", org: "danforth-legal-llp", status: "approved", createdDaysAgo: 4, weekOffset: 5,
    lines: [{ category: "laptop", make: "Lenovo", model: "ThinkPad E14", year: 2021, qty: 4, condition: "working" }],
  },
];

const HOUSEHOLD: { category: DeviceCategory; make: string; model: string; year: number; cpu?: string; ram?: number; storage?: number; status: DeviceStatus; daysAgo: number }[] = [
  ...Array.from({ length: 30 }, (_, i) => {
    const models = [
      { category: "laptop" as const, make: "Acer", model: "Aspire 5", year: 2019, cpu: "Intel Core i3-8145U", ram: 8, storage: 256 },
      { category: "laptop" as const, make: "HP", model: "ProBook 450 G5", year: 2018, cpu: "Intel Core i5-8250U", ram: 8, storage: 256 },
      { category: "desktop" as const, make: "Lenovo", model: "ThinkCentre M710q", year: 2017, cpu: "Intel Core i5-7400T", ram: 8, storage: 256 },
      { category: "laptop" as const, make: "Dell", model: "Inspiron 15 3000", year: 2018, cpu: "Intel Core i3-7020U", ram: 8, storage: 128 },
      { category: "monitor" as const, make: "LG", model: "24MK430H", year: 2018 },
      { category: "tablet" as const, make: "Apple", model: "iPad (6th gen)", year: 2018 },
    ];
    const m = models[i % models.length];
    const statuses: DeviceStatus[] = ["sold", "sold", "received", "testing", "wipe_pending_verification", "ready", "sold", "recycled", "listed", "sold", "refurbishing", "sold", "received", "sold", "wipe_verified"];
    return { ...m, status: statuses[i % statuses.length], daysAgo: between(6, 175) };
  }),
];

const RECIPIENTS: RecipientCategory[] = ["student", "student", "student", "newcomer", "newcomer", "senior", "low_income_household", "nonprofit", "small_business", "general", "student", "newcomer"];
const CHANNELS: SaleChannel[] = ["in_store", "in_store", "online", "b2b"];

// ------------------------------------------------------------------ main
async function reset() {
  console.log("Resetting demo data…");
  const all = (t: string) => db.from(t).delete().gte("created_at", "1970-01-01");
  for (const t of ["fund_transactions", "membership_payments", "certificates", "volunteer_badges", "checker_logs", "devices", "batch_line_items", "donation_batches", "account_invites", "badges", "impact_factors"]) {
    await must(`reset ${t}`, all(t));
  }
  // Demo users (cascades their profiles), then seeded organizations.
  let page = 1;
  for (;;) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    for (const u of data.users) {
      if (u.email?.endsWith(DOMAIN)) await db.auth.admin.deleteUser(u.id);
    }
    if (data.users.length < 200) break;
    page++;
  }
  await must("reset orgs", db.from("organizations").delete().in("slug", ORGS.map((o) => o.slug)));
  const { data: files } = await db.storage.from("certificates").list("", { limit: 1000 });
  for (const f of files ?? []) {
    const { data: inner } = await db.storage.from("certificates").list(f.name, { limit: 1000 });
    if (inner?.length) await db.storage.from("certificates").remove(inner.map((x) => `${f.name}/${x.name}`));
  }
}

async function main() {
  await reset();

  console.log("Settings, impact factors, badges…");
  await must("settings", db.from("settings").upsert(SETTINGS));
  await must("factors", db.from("impact_factors").insert(FACTORS.map((f) => ({ ...f, source_title: "TO VERIFY", source_url: null, last_reviewed: null }))));
  const badges = await must(
    "badges",
    db.from("badges").insert(BADGES.map((b) => ({ slug: b.slug, name: b.name, description: b.description, icon: BADGE_ICONS[b.slug], criterion_type: b.criterionType, threshold: b.threshold }))).select("id, slug"),
  );
  const badgeId = new Map((badges ?? []).map((b) => [b.slug, b.id as string]));

  console.log("Organizations…");
  const orgRows = await must(
    "orgs",
    db
      .from("organizations")
      .insert(
        ORGS.map((o) => ({
          name: o.name,
          slug: o.slug,
          industry: o.industry,
          employee_range: o.employee_range,
          website: o.website,
          contact_email: `it@${o.slug}.example`,
          tier: o.tier,
          wall_opt_in: o.wall,
          passport_attribution_opt_in: o.attribution,
          created_at: daysAgo(o.joinedDaysAgo).toISOString(),
          membership_started_at: o.tier === "community" ? null : daysAgo(o.joinedDaysAgo).toISOString(),
          membership_expires_at: o.tier === "community" ? null : addDays(daysAgo(o.joinedDaysAgo), 365).toISOString(),
        })),
      )
      .select("id, slug"),
  );
  const orgId = new Map((orgRows ?? []).map((o) => [o.slug, o.id as string]));

  console.log("Users…");
  const userId = new Map<string, string>();
  for (const u of USERS) {
    const { data, error } = await db.auth.admin.createUser({ email: u.email, password, email_confirm: true, user_metadata: { full_name: u.full_name } });
    if (error || !data.user) throw new Error(`createUser ${u.email}: ${error?.message}`);
    userId.set(u.email, data.user.id);
    await must(
      `profile ${u.email}`,
      db
        .from("profiles")
        .update({
          role: u.role,
          full_name: u.full_name,
          display_first_name: u.full_name.split(" ")[0],
          organization_id: u.org ? orgId.get(u.org) : null,
          public_handle: u.handle ?? null,
          attribution_opt_in: u.attribution ?? false,
          public_profile_opt_in: u.publicProfile ?? false,
          created_at: daysAgo(u.role === "volunteer" ? between(90, 200) : 180).toISOString(),
        })
        .eq("id", data.user.id),
    );
    if (u.org) await must("owner", db.from("organizations").update({ owner_id: data.user.id }).eq("slug", u.org).is("owner_id", null));
  }
  const staffId = userId.get(`demo-staff${DOMAIN}`)!;
  const aisha = userId.get(`demo-volunteer${DOMAIN}`)!;
  const others = USERS.filter((u) => u.role === "volunteer" && !u.email.startsWith("demo-")).map((u) => userId.get(u.email)!);

  console.log("Batches, devices and timelines…");
  const deviceCount = BATCHES.reduce((s, b) => s + b.lines.reduce((x, l) => x + (b.receivedDaysAgo !== undefined ? l.qty : 0), 0), 0) + HOUSEHOLD.length;
  const codes = generateUniqueCodes(deviceCount, new Set(), codeRandom);
  let codeIdx = 0;
  const thisMonday = mondayOf(NOW);

  const devices: Record<string, unknown>[] = [];
  const events: Record<string, unknown>[] = [];
  const fund: Record<string, unknown>[] = [];
  const certs: { batchId: string; orgId: string; number: string; issuedAt: Date; count: number }[] = [];
  // Aisha completes exactly 9 devices (first-boot unlocked; Diagnostician at 9/10 so F3 unlocks it).
  let aishaQuota = 9;

  for (const b of BATCHES) {
    const week = toISODate(addDays(thisMonday, b.weekOffset * 7));
    const score = computeBatchScore(
      b.lines.map((l) => ({ category: l.category, make: l.make, model: l.model, approxYear: l.year, quantity: l.qty })),
      { currentYear: NOW.getFullYear() },
    ).score;
    const received = b.receivedDaysAgo !== undefined ? daysAgo(b.receivedDaysAgo) : null;
    const batchRow = await must(
      `batch ${b.key}`,
      db
        .from("donation_batches")
        .insert({
          organization_id: orgId.get(b.org),
          submitted_by: b.org === "maple-ledger-accounting" ? userId.get(`demo-partner${DOMAIN}`) : b.org === "harbourfront-dental-group" ? userId.get(`demo-partner-2${DOMAIN}`) : null,
          status: b.status,
          logistics: b.logistics ?? "dropoff",
          pickup_address: b.logistics === "pickup" ? "2200 Lakeshore Blvd W, Toronto, ON" : null,
          preferred_week: week,
          scheduled_week: ["scheduled", "received", "in_refurbishment", "completed"].includes(b.status) ? week : null,
          notes: b.notes ?? null,
          decline_reason: b.decline ?? null,
          value_score: score,
          data_handling_ack: true,
          created_at: daysAgo(b.createdDaysAgo).toISOString(),
          received_at: received?.toISOString() ?? null,
        })
        .select("id")
        .single(),
    );
    const batchId = (batchRow as { id: string }).id;

    for (const l of b.lines) {
      const li = await must(
        `line ${b.key}`,
        db
          .from("batch_line_items")
          .insert({ batch_id: batchId, category: l.category, make: l.make, model: l.model, approx_year: l.year, quantity: l.qty, condition: l.condition })
          .select("id")
          .single(),
      );
      if (!received) continue;
      const statuses = l.statuses ?? rep(l.qty, "received" as DeviceStatus);
      statuses.forEach((status, i) => {
        const volunteer = aishaQuota > 0 && reachesQa(status) ? (aishaQuota--, aisha) : pick(others);
        buildDevice({
          batchId,
          lineItemId: (li as { id: string }).id,
          source: "partner",
          category: l.category,
          make: l.make,
          model: l.model,
          year: l.year,
          cpu: l.cpu,
          ram: l.ram,
          storage: l.storage,
          serial: `${l.make.slice(0, 2).toUpperCase()}${between(1000000, 9999999)}`,
          status,
          start: new Date(received.getTime() + hours(i * 0.25)),
          volunteer,
        });
      });
    }
    if (b.certificate && received) {
      const lastEvent = events.filter((e) => e.batch === batchId).reduce((m, e) => Math.max(m, new Date(e.created_at as string).getTime()), received.getTime());
      certs.push({ batchId, orgId: orgId.get(b.org)!, number: formatCertificateNumber(NOW.getFullYear(), b.certificate), issuedAt: new Date(Math.min(lastEvent + hours(30), NOW.getTime() - hours(48))), count: b.lines.reduce((s, l) => s + l.qty, 0) });
    }
  }
  for (const h of HOUSEHOLD) {
    buildDevice({
      batchId: null,
      lineItemId: null,
      source: "household",
      category: h.category,
      make: h.make,
      model: h.model,
      year: h.year,
      cpu: h.cpu,
      ram: h.ram,
      storage: h.storage,
      serial: null,
      status: h.status,
      start: daysAgo(h.daysAgo),
      volunteer: pick(others),
    });
  }

  function reachesQa(s: DeviceStatus) {
    return s === "ready" || s === "listed" || s === "sold";
  }

  function buildDevice(d: {
    batchId: string | null;
    lineItemId: string | null;
    source: "partner" | "household";
    category: DeviceCategory;
    make: string;
    model: string;
    year: number | null;
    cpu?: string;
    ram?: number;
    storage?: number;
    serial: string | null;
    status: DeviceStatus;
    start: Date;
    volunteer: string;
  }) {
    const id = crypto.randomUUID();
    const code = codes[codeIdx++];
    let t = d.start.getTime();
    // Keep every timeline in the past.
    const step = () => {
      t = Math.min(t + hours(between(6, 60)), NOW.getTime() - hours(2));
      return new Date(t).toISOString();
    };
    const row: Record<string, unknown> = {
      id,
      passport_code: code,
      batch_id: d.batchId,
      line_item_id: d.lineItemId,
      source: d.source,
      category: d.category,
      make: d.make,
      model: d.model,
      cpu: d.cpu ?? null,
      ram_gb: d.ram ?? null,
      storage_gb: d.storage ?? null,
      serial_number: d.serial,
      approx_year: d.year,
      status: d.status,
      created_at: new Date(t).toISOString(),
    };
    const ev = (e: Record<string, unknown>) => events.push({ device_id: id, batch: d.batchId, metadata: {}, ...e });
    ev({ actor_id: staffId, event_type: "status_change", to_status: "received", note: d.source === "household" ? "Household intake" : "Received from partner batch", created_at: row.created_at });

    const target = d.status === "recycled" ? (pick(["received", "testing", "wipe_verified"] as const) as DeviceStatus) : d.status;
    const path = devicePath("received", target) ?? [];
    if (path.length > 0 || d.status !== "received") {
      row.assigned_volunteer_id = d.volunteer;
      ev({ actor_id: staffId, event_type: "assigned", note: "Assigned to a volunteer", metadata: { volunteer_id: d.volunteer }, created_at: step() });
    }
    let prev: DeviceStatus = "received";
    for (const next of path) {
      const at = step();
      if (next === "testing") {
        ev({ actor_id: d.volunteer, event_type: "status_change", from_status: prev, to_status: next, created_at: at });
        ev({ actor_id: d.volunteer, event_type: "step_completed", step: "hardware_test", created_at: at });
      } else if (next === "wipe_pending_verification") {
        Object.assign(row, { wipe_report_ref: `BL-${between(100000, 999999)}`, wipe_method: "NIST 800-88 Purge (software overwrite)", wipe_performed_by: d.volunteer, wipe_performed_at: at });
        ev({ actor_id: d.volunteer, event_type: "status_change", from_status: prev, to_status: next, created_at: at });
        ev({ actor_id: d.volunteer, event_type: "step_completed", step: "wipe_performed", metadata: { report_recorded: true }, created_at: at });
      } else if (next === "wipe_verified") {
        Object.assign(row, { wipe_verified_by: staffId, wipe_verified_at: at });
        ev({ actor_id: staffId, event_type: "status_change", from_status: prev, to_status: next, note: "Verified against the sanitization report", created_at: at });
      } else if (next === "refurbishing") {
        const os = d.category === "tablet" ? "iPadOS (reset)" : pick(["Linux Mint 22", "Linux Mint 22", "Ubuntu 24.04 LTS"]);
        const open = d.category !== "tablet";
        Object.assign(row, { os_installed: d.category === "monitor" || d.category === "accessory" ? null : os, is_open_source_os: d.category === "monitor" ? null : open });
        if (row.os_installed) ev({ actor_id: d.volunteer, event_type: "step_completed", step: "os_installed", metadata: { os, is_open_source: open }, created_at: at });
        ev({ actor_id: d.volunteer, event_type: "status_change", from_status: prev, to_status: next, created_at: at });
      } else if (next === "ready") {
        Object.assign(row, { refurbished_by: d.volunteer, refurbished_at: at, price_cents: priceFor(d.category, d.year) });
        ev({ actor_id: d.volunteer, event_type: "step_completed", step: "final_qa", created_at: at });
        ev({ actor_id: d.volunteer, event_type: "status_change", from_status: prev, to_status: next, created_at: at });
      } else if (next === "listed") {
        ev({ actor_id: staffId, event_type: "status_change", from_status: prev, to_status: next, note: "Listed in the FGT store", created_at: at });
      } else if (next === "sold") {
        const recipient = pick(RECIPIENTS);
        const channel = pick(CHANNELS);
        const subsidy = ["student", "newcomer", "low_income_household"].includes(recipient) && rand() < 0.22 ? 5000 : 0;
        Object.assign(row, { sold_at: at, sale_channel: channel, recipient_category: recipient, pif_subsidy_cents: subsidy });
        ev({ actor_id: staffId, event_type: "sale", note: `Sold ${channel.replace("_", " ")}`, metadata: { recipient_category: recipient }, created_at: at });
        if (subsidy) {
          ev({ actor_id: staffId, event_type: "subsidy", note: "Pay-It-Forward subsidy applied", metadata: { amount_cents: subsidy }, created_at: at });
          fund.push({ type: "subsidy", amount_cents: -subsidy, device_id: id, provider: "manual", note: `Subsidy for ${code}`, created_at: at });
        }
        ev({ actor_id: staffId, event_type: "status_change", from_status: prev, to_status: next, created_at: at });
      }
      prev = next;
    }
    if (d.status === "recycled") {
      const at = step();
      const reason = pick(["Cracked motherboard — recycled for parts", "Swollen battery, unsafe to refurbish", "Failed hardware test (no display)"]);
      Object.assign(row, { recycled_reason: reason, assigned_volunteer_id: null });
      ev({ actor_id: staffId, event_type: "status_change", from_status: prev, to_status: "recycled", note: reason, created_at: at });
    }
    row.updated_at = new Date(t).toISOString();
    if (d.status === "sold") row.passport_views = between(0, 4);
    devices.push(row);
  }

  // Aisha's next device on the bench for flow F3 is claimed live from the queue.
  await chunked("devices", "devices", devices);
  await chunked(
    "events",
    "device_events",
    events.map(({ batch: _b, ...e }) => {
      void _b;
      return e;
    }),
    500,
  );

  console.log("Certificates…");
  for (const c of certs) {
    await must("certificate", db.from("certificates").insert({ certificate_number: c.number, batch_id: c.batchId, organization_id: c.orgId, issued_by: staffId, issued_at: c.issuedAt.toISOString(), device_count: c.count, created_at: c.issuedAt.toISOString() }));
    await must("batch complete", db.from("donation_batches").update({ status: "completed", completed_at: c.issuedAt.toISOString() }).eq("id", c.batchId));
  }

  console.log("Pay-It-Forward fund and memberships…");
  const contributions = Array.from({ length: 34 }, (_, i) => ({
    type: "contribution",
    amount_cents: pick([500, 500, 1000, 1000, 1000, 2500, 2500, 5000]),
    provider: "mock",
    provider_ref: `seed_contrib_${i}`,
    note: pick(["Round-up at checkout", "One-time gift", "Round-up at checkout"]),
    created_at: daysAgo(between(5, 170)).toISOString(),
  }));
  const sponsorship = { type: "sponsorship", amount_cents: 75000, organization_id: orgId.get("brightpath-logistics"), provider: "mock", provider_ref: "seed_champion_brightpath", note: "Champion Partner: 10 sponsored laptops", created_at: daysAgo(165).toISOString() };
  // Insert money in first, subsidies after, so the balance never dips below zero.
  await chunked("fund in", "fund_transactions", [sponsorship, ...contributions]);
  await chunked("fund out", "fund_transactions", fund);
  const memberships = ORGS.filter((o) => o.tier !== "community").map((o) => ({
    organization_id: orgId.get(o.slug),
    tier: o.tier,
    amount_cents: o.tier === "impact" ? 50000 : 150000,
    provider: "mock",
    provider_ref: `seed_membership_${o.slug}`,
    period_start: toISODate(daysAgo(o.joinedDaysAgo)),
    period_end: toISODate(addDays(daysAgo(o.joinedDaysAgo), 365)),
    created_at: daysAgo(o.joinedDaysAgo).toISOString(),
  }));
  await chunked("memberships", "membership_payments", memberships);

  console.log("Badges…");
  const vb: Record<string, unknown>[] = [];
  for (const u of USERS.filter((x) => x.role === "volunteer")) {
    const id = userId.get(u.email)!;
    const mine = events.filter((e) => e.actor_id === id && e.event_type === "step_completed");
    const stats: VolunteerStats = {
      finalQa: mine.filter((e) => e.step === "final_qa").length,
      hardwareTests: mine.filter((e) => e.step === "hardware_test").length,
      verifiedWipes: devices.filter((d) => d.wipe_performed_by === id && d.wipe_verified_at).length,
      openSourceInstalls: mine.filter((e) => e.step === "os_installed" && (e.metadata as { is_open_source?: boolean }).is_open_source).length,
    };
    for (const slug of evaluateBadges(stats)) vb.push({ volunteer_id: id, badge_id: badgeId.get(slug), awarded_at: daysAgo(between(3, 80)).toISOString() });
    console.log(`  ${u.full_name}: ${JSON.stringify(stats)}`);
  }
  vb.push({ volunteer_id: userId.get(`volunteer-jordan${DOMAIN}`), badge_id: badgeId.get("mentor"), awarded_by: staffId, awarded_at: daysAgo(20).toISOString() });
  await chunked("volunteer badges", "volunteer_badges", vb);

  console.log("Checker logs…");
  const outcomes = ["accepted", "accepted", "accepted", "recycling_only", "not_accepted", "partner_redirect"] as const;
  const cats: DeviceCategory[] = ["laptop", "laptop", "desktop", "monitor", "tablet", "other", "accessory"];
  await chunked(
    "checker",
    "checker_logs",
    Array.from({ length: 64 }, () => {
      const outcome = pick(outcomes);
      return { category: outcome === "not_accepted" ? "other" : pick(cats), outcome, is_business: outcome === "partner_redirect", created_at: daysAgo(between(0, 60)).toISOString() };
    }),
  );

  const counts: Record<string, number> = {};
  for (const t of ["organizations", "profiles", "donation_batches", "batch_line_items", "devices", "device_events", "certificates", "badges", "volunteer_badges", "fund_transactions", "membership_payments", "impact_factors", "checker_logs"]) {
    const { count } = await db.from(t).select("*", { count: "exact", head: true });
    counts[t] = count ?? 0;
  }
  console.log("Record counts:", counts);
  console.log(`Sold devices: ${devices.filter((d) => d.status === "sold").length}`);
  console.log("Done. Demo accounts use DEMO_PASSWORD from .env.local.");
}

function priceFor(category: DeviceCategory, year: number | null): number {
  // Illustrative prices FGT would set; GeekLoop only displays them (PRD §6.6).
  const age = year ? NOW.getFullYear() - year : 6;
  const base: Record<DeviceCategory, number> = { laptop: 26000, desktop: 18000, monitor: 6000, tablet: 15000, accessory: 1500, other: 2000 };
  return Math.max(2500, Math.round((base[category] - age * 1500) / 500) * 500);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
