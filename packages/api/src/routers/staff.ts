import { db } from "@bmhkms/db";
import { user } from "@bmhkms/db/schema/auth";
import { and, asc, desc, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

import { isDataGridFilterActive } from "../data-grid/filters";
import { createDataGridListQuery } from "../data-grid/query";
import { createTextFilterHandler } from "../data-grid/text";
import { protectedProcedure, requirePermissions } from "../index";
import {
  STAFF_ROLE_NAMES,
  staffListInputSchema,
  staffListOutputSchema,
} from "../schemas/staff";
import type { StaffListFilter, StaffListInput } from "../schemas/staff";

const staffSortRegistry = {
  email: {
    expression: sql<string>`lower(btrim(coalesce(${user.email}, '')))`,
  },
  name: {
    expression: sql<string>`lower(btrim(coalesce(${user.name}, '')))`,
  },
} as const;

const staffFilterHandlers = {
  email: createTextFilterHandler<StaffListFilter>({
    column: user.email,
  }),
  name: createTextFilterHandler<StaffListFilter>({
    column: user.name,
  }),
} as const;

const executeStaffList = createDataGridListQuery<
  StaffListFilter,
  "name" | "email",
  StaffListInput["pageSize"],
  SQL<boolean>,
  SQL<string>,
  SQL,
  {
    email: string;
    id: string;
    image: string | null;
    name: string;
  }
>({
  applySortDirection: (expression, direction) =>
    direction === "asc" ? asc(expression) : desc(expression),
  baseCondition: buildStaffRoleCondition(),
  combineConditions: (conditions) => and(...conditions) as SQL<boolean>,
  count: async ({ where }) => {
    const [countRow] = await db
      .select({
        total: sql<number>`count(*)::int`,
      })
      .from(user)
      .where(where);

    return countRow?.total ?? 0;
  },
  filterHandlers: staffFilterHandlers,
  isFilterActive: (filter) =>
    isDataGridFilterActive(filter, ["empty", "not_empty"]),
  select: ({ limit, offset, orderBy, where }) =>
    db
      .select({
        email: user.email,
        id: user.id,
        image: user.image,
        name: user.name,
      })
      .from(user)
      .where(where)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset),
  sortRegistry: staffSortRegistry,
  stableTieBreak: asc(user.id),
});

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
  .handler(({ input }) => executeStaffList(input));

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
export const staffRouter = {
  list: staffListProcedure,
};
