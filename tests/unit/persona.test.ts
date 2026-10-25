import { describe, expect, it } from "vitest";
import { personaFor, type PersonaInput } from "@/lib/passport-story";

/** Relay Wrapped persona slide (DP-02): archetypes come only from real story data. */
const base: PersonaInput = { stage: "sold", daysToReady: 7, openSource: true, pifSubsidized: true, ageAtDonation: 7, wiped: true, kg: 2.1, leg: 3 };

describe("personaFor", () => {
  it("picks archetypes in a fixed priority order", () => {
    expect(personaFor({ ...base, stage: "recycled" }).key).toBe("phoenix");
    expect(personaFor(base).key).toBe("sprinter");
    expect(personaFor({ ...base, daysToReady: 30 }).key).toBe("veteran");
    expect(personaFor({ ...base, daysToReady: null, ageAtDonation: 2 }).key).toBe("free_spirit");
    expect(personaFor({ ...base, daysToReady: null, ageAtDonation: null, openSource: false }).key).toBe("gift");
    expect(personaFor({ ...base, daysToReady: null, ageAtDonation: null, openSource: false, pifSubsidized: false }).key).toBe("comeback");
  });

  it("lists at most four true traits and never invents missing ones", () => {
    expect(personaFor(base).traits).toEqual(["Wiped clean", "Ready in 7 days", "Open source", "Paid forward"]);
    const bare = personaFor({ stage: "in_progress", daysToReady: null, openSource: false, pifSubsidized: false, ageAtDonation: null, wiped: false, kg: 0, leg: 1 });
    expect(bare.traits).toEqual(["Leg 1 of 3"]);
  });
});
