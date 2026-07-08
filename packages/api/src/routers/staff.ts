import { db } from "@bmhkms/db";
import { user } from "@bmhkms/db/schema/auth";
import { and, asc, desc, or, sql } from "drizzle-orm";

import { protectedProcedure, requirePermissions } from "../index";
import {
  STAFF_ROLE_NAMES,
  staffListInputSchema,
  staffListOutputSchema,
} from "../schemas/staff";
import type { StaffListFilter } from "../schemas/staff";
import {
  buildCaseInsensitiveFilterPattern,
  isStaffFilterActive,
  normalizeStaffFilterValues,
  resolveStaffListPagination,
  SQL_LIKE_ESCAPE,
} from "./staff.helpers";

const staffListProcedure = protectedProcedure
  .use(
    requirePermissions({
      user: ["list"],
    })
  )
  .route({
    method: "GET",
    path: "/staff",
  })
  .input(staffListInputSchema)
  .output(staffListOutputSchema)
  .handler(async ({ input }) => {
    const activeFilters = input.filters.filter(isStaffFilterActive);
    const whereClause = and(
      buildStaffRoleCondition(),
      ...activeFilters.flatMap((filter) => {
        const condition = buildTextFilterCondition(filter);
        return condition ? [condition] : [];
      })
    );

    const [{ total }] = await db
      .select({
        total: sql<number>`count(*)::int`,
      })
      .from(user)
      .where(whereClause);

    const pagination = resolveStaffListPagination(
      input.page,
      input.pageSize,
      total
    );
    const sortColumn = input.sortBy === "email" ? user.email : user.name;
    const normalizedSortValue = sql<string>`lower(btrim(coalesce(${sortColumn}, '')))`;

    const items = await db
      .select({
        email: user.email,
        id: user.id,
        image: user.image,
        name: user.name,
      })
      .from(user)
      .where(whereClause)
      .orderBy(
        input.sortDir === "asc"
          ? asc(normalizedSortValue)
          : desc(normalizedSortValue),
        asc(user.id)
      )
      .limit(input.pageSize)
      .offset(pagination.offset);

    return {
      items,
      pagination: {
        page: pagination.page,
        pageCount: pagination.pageCount,
        pageSize: pagination.pageSize,
        total: pagination.total,
      },
    };
  });

function buildStaffRoleCondition() {
  const staffRoleValues = sql.join(
    STAFF_ROLE_NAMES.map((role) => sql`${role}`),
    sql`, `
  );

  return sql<boolean>`
    exists (
      select 1
      from unnest(
        regexp_split_to_array(coalesce(${user.role}, ''), '\\s*,\\s*')
      ) as role_token(value)
      where value in (${staffRoleValues})
    )
  `;
}

function buildTrimmedTextValue(column: typeof user.name | typeof user.email) {
  return sql<string>`btrim(coalesce(${column}, ''))`;
}

function buildIlikeCondition(
  column: typeof user.name | typeof user.email,
  pattern: string
) {
  const trimmedValue = buildTrimmedTextValue(column);

  return sql<boolean>`
    ${trimmedValue} ilike ${pattern} escape ${SQL_LIKE_ESCAPE}
  `;
}

function buildTextFilterCondition(filter: StaffListFilter) {
  const column = filter.field === "email" ? user.email : user.name;
  const normalizedValues = normalizeStaffFilterValues(filter.values);

  if (filter.operator === "empty") {
    return sql<boolean>`coalesce(btrim(${column}), '') = ''`;
  }

  if (filter.operator === "not_empty") {
    return sql<boolean>`coalesce(btrim(${column}), '') <> ''`;
  }

  if (normalizedValues.length === 0) {
    return;
  }

  if (filter.operator === "contains") {
    return or(
      ...normalizedValues.map((value) =>
        buildIlikeCondition(
          column,
          buildCaseInsensitiveFilterPattern("contains", value)
        )
      )
    );
  }

  if (filter.operator === "not_contains") {
    return and(
      ...normalizedValues.map((value) => {
        const condition = buildIlikeCondition(
          column,
          buildCaseInsensitiveFilterPattern("contains", value)
        );

        return sql<boolean>`not (${condition})`;
      })
    );
  }

  if (filter.operator === "starts_with") {
    return or(
      ...normalizedValues.map((value) =>
        buildIlikeCondition(
          column,
          buildCaseInsensitiveFilterPattern("starts_with", value)
        )
      )
    );
  }

  if (filter.operator === "ends_with") {
    return or(
      ...normalizedValues.map((value) =>
        buildIlikeCondition(
          column,
          buildCaseInsensitiveFilterPattern("ends_with", value)
        )
      )
    );
  }

  const [exactValue] = normalizedValues;

  if (!exactValue) {
    return;
  }

  return sql<boolean>`
    lower(${buildTrimmedTextValue(column)}) = ${exactValue.toLowerCase()}
  `;
}

export const staffRouter = {
  list: staffListProcedure,
};
