import { describe, expect, it } from "bun:test";

import { z } from "zod";

import { createDataGridListSchemas } from "./schemas";

const testSchemas = createDataGridListSchemas({
  allowedPageSizes: [5, 10, 25] as const,
  defaultPage: 1,
  defaultPageSize: 5,
  defaultSortBy: "name",
  defaultSortDir: "desc",
  filterFields: ["name", "email"] as const,
  filterOperators: ["contains", "empty"] as const,
  itemSchema: z.object({
    id: z.string(),
  }),
  maxFilterValueLength: 20,
  maxFilterValues: 2,
  maxFilters: 3,
  sortFields: ["name", "email"] as const,
});

describe("data grid schemas", () => {
  it("applies defaults and preserves the shared list shape", () => {
    expect(testSchemas.inputSchema.parse({})).toEqual({
      filters: [],
      page: 1,
      pageSize: 5,
      sortBy: "name",
      sortDir: "desc",
    });
  });

  it("rejects invalid page sizes, sorts, filters, and oversized values", () => {
    expect(() => testSchemas.inputSchema.parse({ pageSize: 50 })).toThrow();
    expect(() => testSchemas.inputSchema.parse({ sortBy: "role" })).toThrow();
    expect(() =>
      testSchemas.inputSchema.parse({
        filters: [
          {
            field: "role",
            operator: "contains",
            values: ["admin"],
          },
        ],
      })
    ).toThrow();
    expect(() =>
      testSchemas.inputSchema.parse({
        filters: [
          {
            field: "name",
            operator: "contains",
            values: ["a".repeat(21)],
          },
        ],
      })
    ).toThrow();
  });

  it("rejects oversized filter arrays", () => {
    expect(() =>
      testSchemas.inputSchema.parse({
        filters: Array.from({ length: 4 }, () => ({
          field: "name" as const,
          operator: "contains" as const,
          values: ["beam"],
        })),
      })
    ).toThrow();
  });

  it("throws when configured with empty allowed values", () => {
    expect(() =>
      createDataGridListSchemas({
        allowedPageSizes: [] as unknown as [5],
        defaultPage: 1,
        defaultPageSize: 5,
        defaultSortBy: "name",
        defaultSortDir: "asc",
        filterFields: ["name"] as const,
        filterOperators: ["contains"] as const,
        itemSchema: z.object({ id: z.string() }),
        maxFilterValueLength: 10,
        maxFilterValues: 1,
        maxFilters: 1,
        sortFields: ["name"] as const,
      })
    ).toThrow("allowedPageSizes must contain at least one value");
  });
});
