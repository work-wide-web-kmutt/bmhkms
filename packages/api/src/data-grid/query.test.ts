import { describe, expect, it } from "bun:test";

import { createDataGridListQuery } from "./query";
import type { DataGridListFilter } from "./types";

type TestFilter = DataGridListFilter<
  "name" | "email",
  "contains" | "empty" | "not_empty"
>;

describe("data grid query executor", () => {
  it("builds the observable count and selection inputs", async () => {
    const calls: {
      countWhere?: string;
      selectArgs?: {
        limit: number;
        offset: number;
        orderBy: readonly string[];
        where?: string;
      };
    } = {};

    const execute = createDataGridListQuery<
      TestFilter,
      "name" | "email",
      5 | 10,
      string,
      string,
      string,
      { id: string }
    >({
      applySortDirection: (expression, direction) =>
        `${expression} ${direction.toUpperCase()}`,
      baseCondition: "staff_only",
      combineConditions: (conditions) => conditions.join(" AND "),
      count: ({ where }) => {
        calls.countWhere = where;
        return Promise.resolve(12);
      },
      filterHandlers: {
        email: (filter) =>
          filter.operator === "not_empty" ? "email not empty" : undefined,
        name: (filter) =>
          filter.operator === "contains"
            ? `name contains ${filter.values.join("|")}`
            : undefined,
      },
      isFilterActive: (filter) =>
        filter.operator === "empty" || filter.operator === "not_empty"
          ? true
          : filter.values.some((value) => value.trim().length > 0),
      select: ({ limit, offset, orderBy, where }) => {
        calls.selectArgs = {
          limit,
          offset,
          orderBy,
          where,
        };

        return Promise.resolve([{ id: "u_1" }]);
      },
      sortRegistry: {
        email: {
          expression: "email_normalized",
        },
        name: {
          expression: "name_normalized",
        },
      },
      stableTieBreak: "id ASC",
    });

    const result = await execute({
      filters: [
        {
          field: "name",
          operator: "contains",
          values: [" beam "],
        },
        {
          field: "email",
          operator: "not_empty",
          values: [],
        },
        {
          field: "name",
          operator: "contains",
          values: ["   "],
        },
      ],
      page: 3,
      pageSize: 5,
      sortBy: "email",
      sortDir: "asc",
    });

    expect(calls.countWhere).toBe(
      "staff_only AND name contains  beam  AND email not empty"
    );
    expect(calls.selectArgs).toEqual({
      limit: 5,
      offset: 10,
      orderBy: ["email_normalized ASC", "id ASC"],
      where: "staff_only AND name contains  beam  AND email not empty",
    });
    expect(result).toEqual({
      items: [{ id: "u_1" }],
      pagination: {
        page: 3,
        pageCount: 3,
        pageSize: 5,
        total: 12,
      },
    });
  });

  it("defaults missing count results to zero and clamps invalid pages", async () => {
    const execute = createDataGridListQuery<
      TestFilter,
      "name",
      10,
      string | null,
      string,
      string,
      { id: string }
    >({
      applySortDirection: (expression, direction) =>
        `${expression} ${direction.toUpperCase()}`,
      combineConditions: (conditions) => conditions.join(" AND "),
      count: () => Promise.resolve().then<number | undefined>(() => {}),
      filterHandlers: {
        email: () => null,
        name: () => null,
      },
      select: ({ offset }) => Promise.resolve([{ id: `offset:${offset}` }]),
      sortRegistry: {
        name: {
          expression: "name_normalized",
        },
      },
      stableTieBreak: "id ASC",
    });

    const result = await execute({
      filters: [],
      page: 99,
      pageSize: 10,
      sortBy: "name",
      sortDir: "desc",
    });

    expect(result).toEqual({
      items: [{ id: "offset:0" }],
      pagination: {
        page: 1,
        pageCount: 1,
        pageSize: 10,
        total: 0,
      },
    });
  });
});
