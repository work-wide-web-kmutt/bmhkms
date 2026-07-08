import type { DataGridListFilter } from "./types";

export const SQL_LIKE_ESCAPE = "\\";

export type DataGridTextFilterOperator =
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "is"
  | "empty"
  | "not_empty";

type DataGridPatternOperator =
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with";

export function normalizeDataGridFilterValues(values: string[]): string[] {
  return values
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export function isDataGridFilterActive<
  TFilter extends Pick<DataGridListFilter, "operator" | "values">,
>(
  filter: TFilter,
  valuelessOperators: readonly TFilter["operator"][] = []
): boolean {
  if (valuelessOperators.includes(filter.operator)) {
    return true;
  }

  return normalizeDataGridFilterValues(filter.values).length > 0;
}

export function escapeSqlLikePattern(value: string): string {
  return value
    .replaceAll(SQL_LIKE_ESCAPE, `${SQL_LIKE_ESCAPE}${SQL_LIKE_ESCAPE}`)
    .replaceAll("%", `${SQL_LIKE_ESCAPE}%`)
    .replaceAll("_", `${SQL_LIKE_ESCAPE}_`);
}

export function buildCaseInsensitiveFilterPattern(
  operator: DataGridPatternOperator,
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

export function matchesTextFilter(
  fieldValue: string | null | undefined,
  filter: Pick<
    DataGridListFilter<string, DataGridTextFilterOperator>,
    "operator" | "values"
  >
): boolean {
  const normalizedFieldValue = String(fieldValue ?? "")
    .trim()
    .toLowerCase();
  const normalizedValues = normalizeDataGridFilterValues(filter.values).map(
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
