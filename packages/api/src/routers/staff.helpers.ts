import type { StaffListFilter, STAFF_LIST_PAGE_SIZES } from "../schemas/staff";
import { STAFF_ROLE_NAMES } from "../schemas/staff";

export const SQL_LIKE_ESCAPE = "\\";

export function escapeSqlLikePattern(value: string): string {
  return value
    .replaceAll(SQL_LIKE_ESCAPE, `${SQL_LIKE_ESCAPE}${SQL_LIKE_ESCAPE}`)
    .replaceAll("%", `${SQL_LIKE_ESCAPE}%`)
    .replaceAll("_", `${SQL_LIKE_ESCAPE}_`);
}

export function normalizeStaffFilterValues(values: string[]): string[] {
  return values
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export function buildCaseInsensitiveFilterPattern(
  operator: StaffListFilter["operator"],
  value: string
): string {
  const escapedValue = escapeSqlLikePattern(value.trim());

  if (operator === "starts_with") {
    return `${escapedValue}%`;
  }

  if (operator === "ends_with") {
    return `%${escapedValue}`;
  }

  return `%${escapedValue}%`;
}

export function matchesStaffRole(role: string | null | undefined): boolean {
  if (!role) {
    return false;
  }

  const normalizedRoles = role
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0);

  return normalizedRoles.some((value) =>
    STAFF_ROLE_NAMES.includes(value as (typeof STAFF_ROLE_NAMES)[number])
  );
}

export function isStaffFilterActive(filter: StaffListFilter): boolean {
  if (filter.operator === "empty" || filter.operator === "not_empty") {
    return true;
  }

  return normalizeStaffFilterValues(filter.values).length > 0;
}

export function matchesTextFilter(
  fieldValue: string | null | undefined,
  filter: StaffListFilter
): boolean {
  const normalizedFieldValue = String(fieldValue ?? "")
    .trim()
    .toLowerCase();
  const normalizedValues = normalizeStaffFilterValues(filter.values).map(
    (value) => value.toLowerCase()
  );

  if (filter.operator === "empty") {
    return normalizedFieldValue.length === 0;
  }

  if (filter.operator === "not_empty") {
    return normalizedFieldValue.length > 0;
  }

  if (normalizedValues.length === 0) {
    return true;
  }

  if (filter.operator === "contains") {
    return normalizedValues.some((value) =>
      normalizedFieldValue.includes(value)
    );
  }

  if (filter.operator === "not_contains") {
    return normalizedValues.every(
      (value) => !normalizedFieldValue.includes(value)
    );
  }

  if (filter.operator === "starts_with") {
    return normalizedValues.some((value) =>
      normalizedFieldValue.startsWith(value)
    );
  }

  if (filter.operator === "ends_with") {
    return normalizedValues.some((value) =>
      normalizedFieldValue.endsWith(value)
    );
  }

  const [exactMatch = ""] = normalizedValues;
  return normalizedFieldValue === exactMatch;
}

export function resolveStaffListPagination(
  page: number,
  pageSize: (typeof STAFF_LIST_PAGE_SIZES)[number],
  total: number
) {
  const pageCount = total === 0 ? 1 : Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(page, pageCount);

  return {
    offset: (clampedPage - 1) * pageSize,
    page: clampedPage,
    pageCount,
    pageSize,
    total,
  };
}
