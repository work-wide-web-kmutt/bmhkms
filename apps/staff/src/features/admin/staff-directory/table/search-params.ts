import {
  STAFF_LIST_DEFAULT_PAGE,
  STAFF_LIST_DEFAULT_PAGE_SIZE,
  STAFF_LIST_DEFAULT_SORT_BY,
  STAFF_LIST_DEFAULT_SORT_DIR,
  STAFF_LIST_FILTER_FIELDS,
  STAFF_LIST_FILTER_OPERATORS,
  STAFF_LIST_PAGE_SIZES,
} from "@bmhkms/api/schemas/staff";
import type { StaffListFilter } from "@bmhkms/api/schemas/staff";
import { z } from "zod";

import type { Filter } from "@/components/ui/filters";

export const STAFF_DIRECTORY_PAGE_SIZES = STAFF_LIST_PAGE_SIZES;

const staffDirectorySearchFilterSchema = z.object({
  field: z.enum(STAFF_LIST_FILTER_FIELDS),
  operator: z.enum(STAFF_LIST_FILTER_OPERATORS),
  values: z.array(z.string()).default([]),
});

export type StaffDirectorySearchFilter = StaffListFilter;

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function normalizeSearchFilters(value: unknown): StaffDirectorySearchFilter[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalizedFilters: StaffDirectorySearchFilter[] = [];

  for (const filter of value) {
    const parsedFilter = staffDirectorySearchFilterSchema.safeParse(filter);

    if (parsedFilter.success) {
      normalizedFilters.push(parsedFilter.data);
    }
  }

  return normalizedFilters;
}

function normalizePage(value: unknown): number {
  const parsedValue = parseNumber(value);

  if (parsedValue === null || !Number.isInteger(parsedValue)) {
    return STAFF_LIST_DEFAULT_PAGE;
  }

  return Math.max(STAFF_LIST_DEFAULT_PAGE, parsedValue);
}

function normalizePageSize(
  value: unknown
): (typeof STAFF_DIRECTORY_PAGE_SIZES)[number] {
  const parsedValue = parseNumber(value);

  if (parsedValue === null) {
    return STAFF_LIST_DEFAULT_PAGE_SIZE;
  }

  for (const pageSize of STAFF_DIRECTORY_PAGE_SIZES) {
    if (pageSize === parsedValue) {
      return pageSize;
    }
  }

  return STAFF_LIST_DEFAULT_PAGE_SIZE;
}

function normalizeSortBy(value: unknown): "name" {
  return value === STAFF_LIST_DEFAULT_SORT_BY
    ? STAFF_LIST_DEFAULT_SORT_BY
    : STAFF_LIST_DEFAULT_SORT_BY;
}

function normalizeSortDir(value: unknown): "asc" | "desc" {
  return value === "asc" || value === "desc"
    ? value
    : STAFF_LIST_DEFAULT_SORT_DIR;
}

function buildFilterId(
  filter: StaffDirectorySearchFilter,
  index: number
): string {
  const serializedValues = filter.values.join("|");
  return `${filter.field}:${filter.operator}:${serializedValues}:${index}`;
}

export const staffDirectorySearchSchema = z.object({
  filters: z
    .preprocess(
      normalizeSearchFilters,
      z.array(staffDirectorySearchFilterSchema)
    )
    .default([]),
  page: z.preprocess(normalizePage, z.number().int()),
  pageSize: z.preprocess(
    normalizePageSize,
    z.union([
      z.literal(5),
      z.literal(10),
      z.literal(25),
      z.literal(50),
      z.literal(100),
    ])
  ),
  sortBy: z.preprocess(normalizeSortBy, z.literal(STAFF_LIST_DEFAULT_SORT_BY)),
  sortDir: z.preprocess(normalizeSortDir, z.enum(["asc", "desc"])),
});

export type StaffDirectorySearch = z.infer<typeof staffDirectorySearchSchema>;

export function toSearchFilters(
  filters: Filter<string>[]
): StaffDirectorySearchFilter[] {
  const normalizedFilters: StaffDirectorySearchFilter[] = [];

  for (const filter of filters) {
    const parsedFilter = staffDirectorySearchFilterSchema.safeParse({
      field: filter.field,
      operator: filter.operator,
      values: filter.values
        .map((value) => String(value ?? ""))
        .filter((value) => value.trim().length > 0),
    });

    if (parsedFilter.success) {
      normalizedFilters.push(parsedFilter.data);
    }
  }

  return normalizedFilters;
}

export function fromSearchFilters(
  filters: StaffDirectorySearchFilter[]
): Filter<string>[] {
  return filters.map((filter, index) => ({
    field: filter.field,
    id: buildFilterId(filter, index),
    operator: filter.operator,
    values: [...filter.values],
  }));
}
