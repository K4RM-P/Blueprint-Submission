/**
 * Bulk entry helpers for uniform batches (OPS-04, VW-02, OPS-07): paste or scan a
 * list once instead of typing into one field per device. Pure and tested.
 */

/** Split pasted/scanned text into entries: one per line, comma, semicolon or tab. Trims, drops blanks. */
export function parseList(text: string): string[] {
  return text
    .split(/[\r\n,;\t]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export interface MatchResult<T> {
  /** Item id → the entry assigned to it, in order. */
  assigned: { item: T; value: string }[];
  /** Entries left over because there were more entries than items. */
  extra: string[];
  /** Items that didn't get an entry. */
  missing: T[];
  /** Entries that appear more than once in the list (likely a double scan). */
  duplicates: string[];
}

/** Match entries to items in order (top to bottom). */
export function matchInOrder<T>(items: T[], entries: string[]): MatchResult<T> {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const e of entries) {
    const k = e.toUpperCase();
    if (seen.has(k)) duplicates.add(e);
    seen.add(k);
  }
  return {
    assigned: items.slice(0, entries.length).map((item, i) => ({ item, value: entries[i] })),
    extra: entries.slice(items.length),
    missing: items.slice(entries.length),
    duplicates: [...duplicates],
  };
}
