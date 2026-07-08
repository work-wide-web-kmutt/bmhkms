import { z } from "zod";

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
export const STAFF_LIST_SORT_FIELDS = ["name"] as const;
export const STAFF_ROLE_NAMES = [
  "root",
  "admin",
  "records_staff",
  "staff",
] as const;
export const staffListPageSizeSchema = z.union([
  z.literal(5),
  z.literal(10),
  z.literal(25),
  z.literal(50),
  z.literal(100),
]);

export const staffListFilterSchema = z.object({
  field: z.enum(STAFF_LIST_FILTER_FIELDS),
  operator: z.enum(STAFF_LIST_FILTER_OPERATORS),
  values: z
    .array(z.string().trim().max(STAFF_LIST_MAX_FILTER_VALUE_LENGTH))
    .max(STAFF_LIST_MAX_FILTER_VALUES)
    .default([]),
});

export const staffListInputSchema = z.object({
  filters: z
    .array(staffListFilterSchema)
    .max(STAFF_LIST_MAX_FILTERS)
    .default([]),
  page: z.number().int().min(1).default(STAFF_LIST_DEFAULT_PAGE),
  pageSize: staffListPageSizeSchema.default(STAFF_LIST_DEFAULT_PAGE_SIZE),
  sortBy: z.enum(STAFF_LIST_SORT_FIELDS).default(STAFF_LIST_DEFAULT_SORT_BY),
  sortDir: z.enum(["asc", "desc"]).default(STAFF_LIST_DEFAULT_SORT_DIR),
});

export const staffListItemSchema = z.object({
  email: z.string(),
  id: z.string(),
  image: z.string().nullable(),
  name: z.string(),
});

export const staffListOutputSchema = z.object({
  items: z.array(staffListItemSchema),
  pagination: z.object({
    page: z.number().int().min(1),
    pageCount: z.number().int().min(1),
    pageSize: staffListPageSizeSchema,
    total: z.number().int().min(0),
  }),
});

export type StaffListFilter = z.infer<typeof staffListFilterSchema>;
export type StaffListInput = z.infer<typeof staffListInputSchema>;
export type StaffListItem = z.infer<typeof staffListItemSchema>;
export type StaffListOutput = z.infer<typeof staffListOutputSchema>;
