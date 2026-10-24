import { describe, expect, it } from "vitest";
import { homeForRole, requiredRoleForPath } from "@/lib/roles";

describe("roles", () => {
  it("maps protected paths to roles", () => {
    expect(requiredRoleForPath("/partner")).toBe("partner");
    expect(requiredRoleForPath("/staff/batches/1")).toBe("staff");
    expect(requiredRoleForPath("/volunteer/wallet")).toBe("volunteer");
  });
  it("leaves public paths open", () => {
    expect(requiredRoleForPath("/")).toBeNull();
    expect(requiredRoleForPath("/partners")).toBeNull();
    expect(requiredRoleForPath("/p/FGT-ABCD2345")).toBeNull();
    expect(requiredRoleForPath("/staffing")).toBeNull();
  });
  it("homes each role at its dashboard", () => {
    expect(homeForRole("staff")).toBe("/staff");
  });
});
