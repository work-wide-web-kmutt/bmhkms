import { createOperatorsFromI18n } from "./i18n";
import type {
  Filter,
  FilterFieldConfig,
  FilterFieldGroup,
  FilterFieldsConfig,
  FilterGroup,
  FilterI18nConfig,
  FilterOperator,
} from "./types";

export const NON_EDITING_KEYS = new Set([
  "Tab",
  "Escape",
  "Enter",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
]);

export function validateInputValue(value: string, pattern?: string): boolean {
  if (!pattern || !value) {
    return true;
  }

  const regex = new RegExp(pattern, "u");
  return regex.test(value);
}

export function buildFilterLabel(
  selectedCount: number,
  i18n: FilterI18nConfig
): string {
  if (selectedCount === 1) {
    return i18n.selected;
  }

  if (selectedCount > 1) {
    return `${selectedCount} ${i18n.selectedCount}`;
  }

  return i18n.select;
}

export function scrollOptionIntoView(baseId: string, index: number) {
  const element = document.querySelector<HTMLElement>(
    `#${baseId}-item-${index}`
  );
  element?.scrollIntoView({ block: "nearest" });
}

export function isFieldGroup<T = unknown>(
  item: FilterFieldConfig<T> | FilterFieldGroup<T>
): item is FilterFieldGroup<T> {
  return "fields" in item && Array.isArray(item.fields);
}

export function isGroupLevelField<T = unknown>(
  field: FilterFieldConfig<T>
): field is FilterFieldConfig<T> & { fields: FilterFieldConfig<T>[] } {
  return Boolean(field.group && field.fields);
}

export function flattenFields<T = unknown>(
  fields: FilterFieldsConfig<T>
): FilterFieldConfig<T>[] {
  const flatFields: FilterFieldConfig<T>[] = [];

  for (const item of fields) {
    if (isFieldGroup(item)) {
      flatFields.push(...item.fields);
      continue;
    }

    if (isGroupLevelField(item)) {
      flatFields.push(...item.fields);
      continue;
    }

    flatFields.push(item);
  }

  return flatFields;
}

export function getFieldsMap<T = unknown>(
  fields: FilterFieldsConfig<T>
): Record<string, FilterFieldConfig<T>> {
  const flatFields = flattenFields(fields);
  const fieldsMap: Record<string, FilterFieldConfig<T>> = {};

  for (const field of flatFields) {
    if (field.key) {
      fieldsMap[field.key] = field;
    }
  }

  return fieldsMap;
}

export function getOperatorsForField<T = unknown>(
  field: FilterFieldConfig<T>,
  values: T[],
  i18n: FilterI18nConfig
): FilterOperator[] {
  if (field.operators) {
    return field.operators;
  }

  const operators = createOperatorsFromI18n(i18n);
  let fieldType = field.type || "select";

  if (fieldType === "select" && values.length > 1) {
    fieldType = "multiselect";
  }

  if (fieldType === "multiselect" || field.type === "multiselect") {
    return operators.multiselect;
  }

  return operators[fieldType] || operators.select;
}

export function createFilter<T = unknown>(
  field: string,
  operator = "is",
  values: T[] = []
): Filter<T> {
  return {
    field,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    operator,
    values,
  };
}

export function createFilterGroup<T = unknown>(
  id: string,
  label: string,
  fields: FilterFieldConfig<T>[],
  initialFilters: Filter<T>[] = []
): FilterGroup<T> {
  return {
    fields,
    filters: initialFilters,
    id,
    label,
  };
}
