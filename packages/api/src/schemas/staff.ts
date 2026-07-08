import { z } from "zod";

import { createDataGridListSchemas } from "../data-grid/schemas";

export const STAFF_LIST_DEFAULT_PAGE = 1;
export const STAFF_LIST_DEFAULT_PAGE_SIZE = 5;
export const STAFF_LIST_DEFAULT_SORT_BY = "name";
export const STAFF_LIST_DEFAULT_SORT_DIR = "desc";
export const STAFF_LIST_MAX_FILTERS = 10;
export const STAFF_LIST_MAX_FILTER_VALUES = 10;
export const STAFF_LIST_MAX_FILTER_VALUE_LENGTH = 200;

export const STAFF_LIST_PAGE_SIZES = [5, 10, 25, 50, 100] as const;
export const STAFF_LIST_FILTER_FIELDS = ["name", "email"] as const;
export const STAFF_LIST_FILTER_OPERATORS = [
  "contains",
  "not_contains",
  "starts_with",
  "ends_with",
  "is",
  "empty",
  "not_empty",
] as const;
export const STAFF_LIST_SORT_FIELDS = ["name", "email"] as const;
export const STAFF_ROLE_NAMES = [
  "root",
  "admin",
  "records_staff",
  "staff",
] as const;

export const staffListItemSchema = z.object({
  email: z.string(),
  id: z.string(),
  image: z.string().nullable(),
  name: z.string(),
});

const staffListSchemas = createDataGridListSchemas({
  allowedPageSizes: STAFF_LIST_PAGE_SIZES,
  defaultPage: STAFF_LIST_DEFAULT_PAGE,
  defaultPageSize: STAFF_LIST_DEFAULT_PAGE_SIZE,
  defaultSortBy: STAFF_LIST_DEFAULT_SORT_BY,
  defaultSortDir: STAFF_LIST_DEFAULT_SORT_DIR,
  filterFields: STAFF_LIST_FILTER_FIELDS,
  filterOperators: STAFF_LIST_FILTER_OPERATORS,
  itemSchema: staffListItemSchema,
  maxFilterValueLength: STAFF_LIST_MAX_FILTER_VALUE_LENGTH,
  maxFilterValues: STAFF_LIST_MAX_FILTER_VALUES,
  maxFilters: STAFF_LIST_MAX_FILTERS,
  sortFields: STAFF_LIST_SORT_FIELDS,
});

export const staffListPageSizeSchema = staffListSchemas.pageSizeSchema;
export const staffListFilterSchema = staffListSchemas.filterSchema;
export const staffListInputSchema = staffListSchemas.inputSchema;
export const staffListOutputSchema = staffListSchemas.outputSchema;

export type StaffListFilter = z.infer<typeof staffListFilterSchema>;
export type StaffListInput = z.infer<typeof staffListInputSchema>;
export type StaffListItem = z.infer<typeof staffListItemSchema>;
export type StaffListOutput = z.infer<typeof staffListOutputSchema>;
