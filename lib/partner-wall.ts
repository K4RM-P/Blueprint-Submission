/** Partner Wall rules (DP-07). Pure. */
/**
 * The public Partner Wall lists an opted-in partner only once Free Geek Toronto has received its
 * laptops, so nobody can put a company name on FGT's wall just by signing up (C3).
 */
export function listedOnWall<T extends { devices_received: number | string }>(rows: T[] | null | undefined): T[] {
  return (rows ?? []).filter((r) => Number(r.devices_received) > 0);
}
