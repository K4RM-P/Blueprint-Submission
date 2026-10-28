/**
 * Short, honest answers to the questions a business actually asks (PP-01, PP-03).
 * Shared by /become-a-partner and the batch wizard so the wording never drifts.
 * No invented numbers; the certificate documents FGT's process, nothing more.
 */
export const PARTNER_FAQ: { q: string; a: string }[] = [
  {
    q: "Is our data safe?",
    a: "Leave the drives in. Free Geek Toronto runs every drive through its data sanitization software, which produces a report for each device, and a staff member checks every report. Your certificate documents that process for each device: method, reference ID, verification date and who verified it.",
  },
  { q: "What does it cost?", a: "Nothing. Becoming a Reuse Partner and donating batches is free. Paid memberships are optional extras, never required." },
  {
    q: "Why donate instead of trading in?",
    a: "Older fleet laptops usually have little trade-in value. Donating gets you a free, documented data wipe, no hassle, and a Device Passport for every laptop showing who it helps here in Toronto.",
  },
  { q: "Is the membership a donation?", a: "No. Optional memberships pay for extra reporting and recognition, a business service, so they don't come with a tax receipt." },
];
