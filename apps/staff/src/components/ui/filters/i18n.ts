import type { FilterI18nConfig, FilterOperator } from "./types";

export const DEFAULT_I18N: FilterI18nConfig = {
  addFilter: "Filter",
  addFilterTitle: "Add filter",
  defaultColor: "#000000",
  defaultCurrency: "$",
  false: "False",
  helpers: {
    formatOperator: (operator: string) => operator.replaceAll("_", " "),
  },
  max: "Max",
  min: "Min",
  noFieldsFound: "No filters found.",
  noResultsFound: "No results found.",
  operators: {
    after: "after",
    before: "before",
    between: "between",
    contains: "contains",
    empty: "is empty",
    endsWith: "ends with",
    equals: "equals",
    excludes: "excludes",
    excludesAll: "excludes all",
    greaterThan: "greater than",
    includes: "includes",
    includesAll: "includes all",
    includesAllOf: "includes all of",
    includesAnyOf: "includes any of",
    is: "is",
    isAnyOf: "is any of",
    isExactly: "is exactly",
    isNot: "is not",
    isNotAnyOf: "is not any of",
    lessThan: "less than",
    notBetween: "not between",
    notContains: "does not contain",
    notEmpty: "is not empty",
    notEquals: "not equals",
    overlaps: "overlaps",
    startsWith: "starts with",
  },
  percent: "%",
  placeholders: {
    enterField: (fieldType: string) => `Enter ${fieldType}...`,
    enterKey: "Enter key...",
    enterValue: "Enter value...",
    searchField: (fieldName: string) => `Search ${fieldName.toLowerCase()}...`,
    selectField: "Select...",
  },
  searchFields: "Filter...",
  select: "Select...",
  selected: "selected",
  selectedCount: "selected",
  to: "to",
  true: "True",
  typeAndPressEnter: "Type and press Enter to add tag",
  validation: {
    invalid: "Invalid input format",
    invalidEmail: "Invalid email format",
    invalidTel: "Invalid phone format",
    invalidUrl: "Invalid URL format",
  },
};

export function createOperatorsFromI18n(
  i18n: FilterI18nConfig
): Record<string, FilterOperator[]> {
  return {
    custom: [
      { label: i18n.operators.is, value: "is" },
      { label: i18n.operators.after, value: "after" },
      { label: i18n.operators.is, value: "is" },
      { label: i18n.operators.between, value: "between" },
      { label: i18n.operators.empty, value: "empty" },
      { label: i18n.operators.notEmpty, value: "not_empty" },
    ],
    multiselect: [
      { label: i18n.operators.isAnyOf, value: "is_any_of" },
      { label: i18n.operators.isNotAnyOf, value: "is_not_any_of" },
      { label: i18n.operators.includesAll, value: "includes_all" },
      { label: i18n.operators.excludesAll, value: "excludes_all" },
      { label: i18n.operators.empty, value: "empty" },
      { label: i18n.operators.notEmpty, value: "not_empty" },
    ],
    select: [
      { label: i18n.operators.is, value: "is" },
      { label: i18n.operators.isNot, value: "is_not" },
      { label: i18n.operators.empty, value: "empty" },
      { label: i18n.operators.notEmpty, value: "not_empty" },
    ],
    text: [
      { label: i18n.operators.contains, value: "contains" },
      { label: i18n.operators.notContains, value: "not_contains" },
      { label: i18n.operators.startsWith, value: "starts_with" },
      { label: i18n.operators.endsWith, value: "ends_with" },
      { label: i18n.operators.isExactly, value: "is" },
      { label: i18n.operators.empty, value: "empty" },
      { label: i18n.operators.notEmpty, value: "not_empty" },
    ],
  };
}

export const DEFAULT_OPERATORS: Record<string, FilterOperator[]> =
  createOperatorsFromI18n(DEFAULT_I18N);

export function mergeI18n(i18n?: Partial<FilterI18nConfig>): FilterI18nConfig {
  return {
    ...DEFAULT_I18N,
    ...i18n,
    operators: { ...DEFAULT_I18N.operators, ...i18n?.operators },
    placeholders: { ...DEFAULT_I18N.placeholders, ...i18n?.placeholders },
    validation: { ...DEFAULT_I18N.validation, ...i18n?.validation },
  };
}
