import { describe, expect, it } from "bun:test";

import {
  buildCaseInsensitiveFilterPattern,
  escapeSqlLikePattern,
  isDataGridFilterActive,
  matchesTextFilter,
  normalizeDataGridFilterValues,
} from "./filters";

describe("data grid filters", () => {
  it("normalizes filter values by trimming blanks and preserving order", () => {
    expect(
      normalizeDataGridFilterValues(["  dev ", "", " staff ", "   "])
    ).toEqual(["dev", "staff"]);
  });

  it("keeps valueless operators active and blank-only value filters inactive", () => {
    expect(
      isDataGridFilterActive(
        {
          operator: "empty",
          values: [],
        },
        ["empty", "not_empty"]
      )
    ).toBe(true);

    expect(
      isDataGridFilterActive(
        {
          operator: "contains",
          values: [" ", "   "],
        },
        ["empty", "not_empty"]
      )
    ).toBe(false);
  });

  it("escapes sql wildcard characters and builds patterns", () => {
    expect(escapeSqlLikePattern("100%_done\\ok")).toBe("100\\%\\_done\\\\ok");
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

  it("preserves positive and negative text matching semantics", () => {
    expect(
      matchesTextFilter("Dev Staff", {
        operator: "contains",
        values: ["dev"],
      })
    ).toBe(true);
    expect(
      matchesTextFilter("Dev Staff", {
        operator: "not_contains",
        values: ["dev", "staff"],
      })
    ).toBe(false);
    expect(
      matchesTextFilter("Observer", {
        operator: "not_contains",
        values: ["dev", "staff"],
      })
    ).toBe(true);
    expect(
      matchesTextFilter(" dev staff ", {
        operator: "is",
        values: ["Dev Staff"],
      })
    ).toBe(true);
  });
});
