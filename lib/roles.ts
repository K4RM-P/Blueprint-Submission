export const ROLES = ["partner", "staff", "volunteer"] as const;
export type Role = (typeof ROLES)[number];

export function homeForRole(role: Role): string {
  return `/${role}`;
}

/** Which role a protected path needs, or null for public paths (AUTH-02, AUTH-05). */
export function requiredRoleForPath(pathname: string): Role | null {
  for (const role of ROLES) {
    if (pathname === `/${role}` || pathname.startsWith(`/${role}/`)) return role;
  }
  return null;
}
