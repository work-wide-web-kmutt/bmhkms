import { describe, expect, it } from "bun:test";

import {
  STAFF_LIST_MAX_FILTER_VALUE_LENGTH,
  staffListInputSchema,
} from "./staff";

describe("staff list input schema", () => {
  it("applies defaults and accepts supported page sizes", () => {
    expect(staffListInputSchema.parse({})).toEqual({
      filters: [],
      page: 1,
      pageSize: 5,
      sortBy: "name",
      sortDir: "desc",
    });

    expect(
      staffListInputSchema.parse({
        pageSize: 100,
      }).pageSize
    ).toBe(100);

    expect(
      staffListInputSchema.parse({
        sortBy: "email",
      }).sortBy
    ).toBe("email");
  });

  it("rejects invalid pages, sort fields, and operators", () => {
    expect(() => staffListInputSchema.parse({ page: 0 })).toThrow();
    expect(() => staffListInputSchema.parse({ sortBy: "role" })).toThrow();
    expect(() =>
      staffListInputSchema.parse({
        filters: [
          {
            field: "name",
            operator: "equals",
            values: ["dev"],
          },
        ],
      })
    ).toThrow();
  });

  it("rejects oversized filters and values", () => {
    const oversizedValue = "a".repeat(STAFF_LIST_MAX_FILTER_VALUE_LENGTH + 1);

    expect(() =>
      staffListInputSchema.parse({
        filters: [
          {
            field: "name",
            operator: "contains",
            values: [oversizedValue],
          },
        ],
      })
    ).toThrow();

    expect(() =>
      staffListInputSchema.parse({
        filters: Array.from({ length: 11 }, () => ({
          field: "name" as const,
          operator: "contains" as const,
          values: ["dev"],
        })),
      })
    ).toThrow();
  });
});
