import { describe, expect, it } from "bun:test";

import { resolveDataGridPage } from "./pagination";

describe("data grid pagination", () => {
  it("resolves empty totals to the first page", () => {
    expect(resolveDataGridPage(4, 10, 0)).toEqual({
      offset: 0,
      page: 1,
      pageCount: 1,
      pageSize: 10,
      total: 0,
    });
  });

  it("clamps out-of-range pages to the final page", () => {
    expect(resolveDataGridPage(9, 5, 12)).toEqual({
      offset: 10,
      page: 3,
      pageCount: 3,
      pageSize: 5,
      total: 12,
    });
  });

  it("keeps partial final pages aligned with the correct offset", () => {
    expect(resolveDataGridPage(3, 25, 61)).toEqual({
      offset: 50,
      page: 3,
      pageCount: 3,
      pageSize: 25,
      total: 61,
    });
  });
});
