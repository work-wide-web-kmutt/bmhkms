import { describe, expect, it } from "bun:test";

import type { StaffListFilter } from "../schemas/staff";
import {
  buildCaseInsensitiveFilterPattern,
  escapeSqlLikePattern,
  matchesStaffRole,
  matchesTextFilter,
  resolveStaffListPagination,
} from "./staff.helpers";

describe("staff helpers", () => {
  it("escapes sql wildcard characters", () => {
    expect(escapeSqlLikePattern("100%_done\\ok")).toBe("100\\%\\_done\\\\ok");
  });

  it("builds case-insensitive patterns for text filters", () => {
    expect(buildCaseInsensitiveFilterPattern("contains", " Admin ")).toBe(
      "%Admin%"
    );
    expect(buildCaseInsensitiveFilterPattern("starts_with", "Admin")).toBe(
      "Admin%"
    );
    expect(buildCaseInsensitiveFilterPattern("ends_with", "Admin")).toBe(
      "%Admin"
    );
  });

  it("preserves positive and negative text filter semantics", () => {
    const containsFilter: StaffListFilter = {
      field: "name",
      operator: "contains",
      values: ["dev"],
    };
    const notContainsFilter: StaffListFilter = {
      field: "name",
      operator: "not_contains",
      values: ["dev", "staff"],
    };
    const exactFilter: StaffListFilter = {
      field: "name",
      operator: "is",
      values: ["Dev Staff"],
    };

    expect(matchesTextFilter("Dev Staff", containsFilter)).toBe(true);
    expect(matchesTextFilter("Dev Staff", notContainsFilter)).toBe(false);
    expect(matchesTextFilter("Observer", notContainsFilter)).toBe(true);
    expect(matchesTextFilter(" dev staff ", exactFilter)).toBe(true);
  });

  it("matches staff roles including comma-separated values", () => {
    expect(matchesStaffRole("admin")).toBe(true);
    expect(matchesStaffRole("contestant")).toBe(false);
    expect(matchesStaffRole("observer, staff")).toBe(true);
    expect(matchesStaffRole("observer, contestant")).toBe(false);
    expect(matchesStaffRole(null)).toBe(false);
  });

  it("calculates empty totals and clamps out-of-range pages", () => {
    expect(resolveStaffListPagination(4, 10, 0)).toEqual({
      offset: 0,
      page: 1,
      pageCount: 1,
      pageSize: 10,
      total: 0,
    });

    expect(resolveStaffListPagination(9, 5, 12)).toEqual({
      offset: 10,
      page: 3,
      pageCount: 3,
      pageSize: 5,
      total: 12,
    });
  });
});
