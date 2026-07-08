import {
  STAFF_LIST_DEFAULT_PAGE,
  STAFF_LIST_DEFAULT_PAGE_SIZE,
  STAFF_LIST_DEFAULT_SORT_BY,
  STAFF_LIST_DEFAULT_SORT_DIR,
  STAFF_LIST_FILTER_FIELDS,
  STAFF_LIST_FILTER_OPERATORS,
  STAFF_LIST_PAGE_SIZES,
  STAFF_LIST_SORT_FIELDS,
  staffListFilterSchema,
} from "@bmhkms/api/schemas/staff";
import type {
  StaffListFilter,
  StaffListInput,
} from "@bmhkms/api/schemas/staff";
import type { SortingState } from "@tanstack/react-table";

import type { Filter } from "@/components/ui/filters";
import { createDataGridSearchCodec } from "@/lib/data-grid/search-codec";

const staffDirectorySearchCodec = createDataGridSearchCodec({
  defaultPage: STAFF_LIST_DEFAULT_PAGE,
  defaultPageSize: STAFF_LIST_DEFAULT_PAGE_SIZE,
  defaultSortBy: STAFF_LIST_DEFAULT_SORT_BY,
  defaultSortDir: STAFF_LIST_DEFAULT_SORT_DIR,
  fields: STAFF_LIST_FILTER_FIELDS,
  operators: STAFF_LIST_FILTER_OPERATORS,
  pageSizes: STAFF_LIST_PAGE_SIZES,
  sortFields: STAFF_LIST_SORT_FIELDS,
});

export const STAFF_DIRECTORY_PAGE_SIZES = STAFF_LIST_PAGE_SIZES;
export const staffDirectorySearchSchema = staffDirectorySearchCodec.schema;

export type StaffDirectorySearch = ReturnType<
  typeof staffDirectorySearchCodec.decode
>;

function buildFilterId(filter: StaffListFilter, index: number): string {
  const serializedValues = filter.values.join("|");
  return `${filter.field}:${filter.operator}:${serializedValues}:${index}`;
}

export function isStaffFilterActive(filter: Filter<string>): boolean {
  if (filter.operator === "empty" || filter.operator === "not_empty") {
    return true;
  }

  return filter.values.some((value) => value.trim().length > 0);
}

export function decodeStaffDirectorySearch(
  search: unknown
): StaffDirectorySearch {
  return staffDirectorySearchCodec.decode(
    staffDirectorySearchSchema.parse(search)
  );
}

export function encodeStaffDirectorySearch(search: StaffDirectorySearch) {
  return staffDirectorySearchCodec.encode(search);
}

export function toStaffDirectoryFilters(
  filters: StaffListFilter[]
): Filter<string>[] {
  return filters.map((filter, index) => ({
    field: filter.field,
    id: buildFilterId(filter, index),
    operator: filter.operator,
    values: [...filter.values],
  }));
}

export function fromStaffDirectoryFilters(
  filters: Filter<string>[]
): StaffListFilter[] {
  const normalizedFilters: StaffListFilter[] = [];

  for (const filter of filters) {
    const values =
      filter.operator === "empty" || filter.operator === "not_empty"
        ? []
        : filter.values
            .map((value) => value.trim())
            .filter((value) => value.length > 0);

    const parsedFilter = staffListFilterSchema.safeParse({
      field: filter.field,
      operator: filter.operator,
      values,
    });

    if (parsedFilter.success) {
      normalizedFilters.push(parsedFilter.data);
    }
  }

  return normalizedFilters;
}

export function getStaffDirectorySorting(
  sortBy: StaffDirectorySearch["sortBy"],
  sortDir: StaffDirectorySearch["sortDir"]
): SortingState {
  return [{ desc: sortDir === "desc", id: sortBy }];
}

export function normalizeStaffDirectorySortField(
  value: string | undefined
): StaffDirectorySearch["sortBy"] {
  return STAFF_LIST_SORT_FIELDS.includes(
    value as (typeof STAFF_LIST_SORT_FIELDS)[number]
  )
    ? (value as StaffDirectorySearch["sortBy"])
    : STAFF_LIST_DEFAULT_SORT_BY;
}

export function normalizeStaffDirectoryPageSize(
  value: number
): (typeof STAFF_DIRECTORY_PAGE_SIZES)[number] {
  return STAFF_DIRECTORY_PAGE_SIZES.includes(
    value as (typeof STAFF_DIRECTORY_PAGE_SIZES)[number]
  )
    ? (value as (typeof STAFF_DIRECTORY_PAGE_SIZES)[number])
    : STAFF_LIST_DEFAULT_PAGE_SIZE;
}

export function toStaffDirectorySearchState(
  input: StaffListInput
): StaffDirectorySearch {
  return {
    filters: input.filters.map((filter) => [
      filter.field,
      filter.operator,
      [...filter.values],
    ]),
    page: input.page,
    pageSize: input.pageSize,
    sortBy: input.sortBy,
    sortDir: input.sortDir,
  };
}

export function toStaffListInput(search: StaffDirectorySearch): StaffListInput {
  return {
    filters: search.filters.map(([field, operator, values]) => ({
      field,
      operator,
      values,
    })),
    page: search.page,
    pageSize: normalizeStaffDirectoryPageSize(search.pageSize),
    sortBy: search.sortBy,
    sortDir: search.sortDir,
  };
}
