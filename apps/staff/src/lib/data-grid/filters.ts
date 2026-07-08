import type { Filter } from "@/components/ui/filters";

function normalizeFilterValue(value: unknown): unknown {
  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeFilterValue(item));
  }

  return value;
}

function hasMeaningfulValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasMeaningfulValue(item));
  }

  return true;
}

export function normalizeDraftFilters<TFilterValue>(
  filters: Filter<TFilterValue>[]
): Filter<TFilterValue>[] {
  return filters.map((filter) => ({
    ...filter,
    values: filter.values.map(
      (value) => normalizeFilterValue(value) as TFilterValue
    ),
  }));
}

export function areFiltersEqual<TFilterValue>(
  leftFilters: Filter<TFilterValue>[],
  rightFilters: Filter<TFilterValue>[]
): boolean {
  if (leftFilters.length !== rightFilters.length) {
    return false;
  }

  for (const [index, leftFilter] of leftFilters.entries()) {
    const rightFilter = rightFilters[index];

    if (!rightFilter) {
      return false;
    }

    if (
      leftFilter.id !== rightFilter.id ||
      leftFilter.field !== rightFilter.field ||
      leftFilter.operator !== rightFilter.operator
    ) {
      return false;
    }

    if (leftFilter.values.length !== rightFilter.values.length) {
      return false;
    }

    for (const [valueIndex, leftValue] of leftFilter.values.entries()) {
      const rightValue = rightFilter.values[valueIndex];

      if (JSON.stringify(leftValue) !== JSON.stringify(rightValue)) {
        return false;
      }
    }
  }

  return true;
}

export function isFilterMeaningfullyActive<TFilterValue>(
  filter: Filter<TFilterValue>,
  predicate?: (filter: Filter<TFilterValue>) => boolean
): boolean {
  if (predicate) {
    return predicate(filter);
  }

  if (filter.values.length === 0) {
    return false;
  }

  return filter.values.some((value) => hasMeaningfulValue(value));
}

export function getActiveFilters<TFilterValue>(
  filters: Filter<TFilterValue>[],
  predicate?: (filter: Filter<TFilterValue>) => boolean
): Filter<TFilterValue>[] {
  return normalizeDraftFilters(filters).filter((filter) =>
    isFilterMeaningfullyActive(filter, predicate)
  );
}
