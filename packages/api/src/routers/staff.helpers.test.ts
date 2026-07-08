import { describe, expect, it } from "bun:test";

import { matchesStaffRole } from "./staff.helpers";

describe("staff helpers", () => {
  it("matches staff roles including comma-separated values", () => {
    expect(matchesStaffRole("admin")).toBe(true);
    expect(matchesStaffRole("contestant")).toBe(false);
    expect(matchesStaffRole("observer, staff")).toBe(true);
    expect(matchesStaffRole("observer, contestant")).toBe(false);
    expect(matchesStaffRole(null)).toBe(false);
  });
});
