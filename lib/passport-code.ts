/** Unambiguous alphabet: no 0/O, 1/I/L (PRD §11). */
export const PASSPORT_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const PASSPORT_PREFIX = "FGT-";
export const PASSPORT_LENGTH = 8;

const PATTERN = new RegExp(`^${PASSPORT_PREFIX}[${PASSPORT_ALPHABET}]{${PASSPORT_LENGTH}}$`);

type RandomSource = (bytes: Uint8Array) => Uint8Array;
const defaultRandom: RandomSource = (bytes) => crypto.getRandomValues(bytes);

/** Generate a passport code like FGT-7K3M9Q2X using rejection sampling (no modulo bias). */
export function generatePassportCode(random: RandomSource = defaultRandom): string {
  const n = PASSPORT_ALPHABET.length;
  const limit = 256 - (256 % n);
  let out = "";
  while (out.length < PASSPORT_LENGTH) {
    const buf = random(new Uint8Array(16));
    for (const b of buf) {
      if (b < limit) out += PASSPORT_ALPHABET[b % n];
      if (out.length === PASSPORT_LENGTH) break;
    }
  }
  return PASSPORT_PREFIX + out;
}

export function isValidPassportCode(code: string): boolean {
  return PATTERN.test(code);
}

/** Accept lower case and missing prefix from people typing a code by hand. */
export function normalizePassportCode(input: string): string {
  const clean = input.trim().toUpperCase().replace(/\s+/g, "");
  return clean.startsWith(PASSPORT_PREFIX) ? clean : PASSPORT_PREFIX + clean.replace(/^FGT/, "");
}

export function generateUniqueCodes(count: number, existing: Set<string> = new Set(), random?: RandomSource): string[] {
  const codes: string[] = [];
  const seen = new Set(existing);
  while (codes.length < count) {
    const c = generatePassportCode(random);
    if (!seen.has(c)) {
      seen.add(c);
      codes.push(c);
    }
  }
  return codes;
}
