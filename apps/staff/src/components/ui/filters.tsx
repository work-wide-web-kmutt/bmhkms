import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";
import { AlertCircleIcon, XIcon, CheckIcon } from "lucide-react";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const NON_EDITING_KEYS = new Set([
  "Tab",
  "Escape",
  "Enter",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
]);

const DEFAULT_REMOVE_ICON = <XIcon />;

function validateInputValue(value: string, pattern?: string): boolean {
  if (!pattern || !value) {
    return true;
  }

  const regex = new RegExp(pattern, "u");
  return regex.test(value);
}

function buildFilterLabel(
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

function scrollOptionIntoView(baseId: string, index: number) {
  const element = document.querySelector<HTMLElement>(
    `#${baseId}-item-${index}`
  );
  element?.scrollIntoView({ block: "nearest" });
}

// i18n Configuration Interface
export interface FilterI18nConfig {
  // UI Labels
  addFilter: string;
  searchFields: string;
  noFieldsFound: string;
  noResultsFound: string;
  select: string;
  true: string;
  false: string;
  min: string;
  max: string;
  to: string;
  typeAndPressEnter: string;
  selected: string;
  selectedCount: string;
  percent: string;
  defaultCurrency: string;
  defaultColor: string;
  addFilterTitle: string;

  // Operators
  operators: {
    is: string;
    isNot: string;
    isAnyOf: string;
    isNotAnyOf: string;
    includesAll: string;
    excludesAll: string;
    before: string;
    after: string;
    between: string;
    notBetween: string;
    contains: string;
    notContains: string;
    startsWith: string;
    endsWith: string;
    isExactly: string;
    equals: string;
    notEquals: string;
    greaterThan: string;
    lessThan: string;
    overlaps: string;
    includes: string;
    excludes: string;
    includesAllOf: string;
    includesAnyOf: string;
    empty: string;
    notEmpty: string;
  };

  // Placeholders
  placeholders: {
    enterField: (fieldType: string) => string;
    selectField: string;
    searchField: (fieldName: string) => string;
    enterKey: string;
    enterValue: string;
  };

  // Helper functions
  helpers: {
    formatOperator: (operator: string) => string;
  };

  // Validation
  validation: {
    invalidEmail: string;
    invalidUrl: string;
    invalidTel: string;
    invalid: string;
  };
}

// Default English i18n configuration
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

// Context for all Filter component props
interface FilterContextValue {
  variant: "solid" | "default";
  size: "sm" | "default" | "lg";
  radius: "default" | "full";
  i18n: FilterI18nConfig;
  className?: string;
  showSearchInput?: boolean;
  trigger?: React.ReactNode;
  allowMultiple?: boolean;
}

const FilterContext = createContext<FilterContextValue>({
  allowMultiple: true,
  className: undefined,
  i18n: DEFAULT_I18N,
  radius: "default",
  showSearchInput: true,
  size: "default",
  trigger: undefined,
  variant: "default",
});

function useFilterContext() {
  return useContext(FilterContext);
}

// Container variant for filters wrapper
const filtersContainerVariants = cva("flex flex-wrap items-center", {
  defaultVariants: {
    size: "default",
    variant: "default",
  },
  variants: {
    size: {
      default: "gap-2.5",
      lg: "gap-3.5",
      sm: "gap-1.5",
    },
    variant: {
      default: "",
      solid: "gap-2",
    },
  },
});

function FilterInput<T = unknown>({
  field,
  onBlur,
  onKeyDown,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
  field?: FilterFieldConfig<T>;
}) {
  const context = useFilterContext();
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (props.autoFocus) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [props.autoFocus]);

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { value } = e.target;
    const pattern = field?.pattern || props.pattern;

    if (value && (pattern || field?.validation)) {
      let valid = true;
      let customMessage = "";

      if (field?.validation) {
        const result = field.validation(value);
        if (typeof result === "boolean") {
          valid = result;
        } else {
          ({ valid } = result);
          customMessage = result.message || "";
        }
      } else if (pattern) {
        valid = validateInputValue(value, pattern);
      }

      setIsValid(valid);
      setValidationMessage(
        valid ? "" : customMessage || context.i18n.validation.invalid
      );
    } else {
      setIsValid(true);
      setValidationMessage("");
    }

    onBlur?.(e);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isValid && !NON_EDITING_KEYS.has(e.key)) {
      setIsValid(true);
      setValidationMessage("");
    }

    onKeyDown?.(e);
  }

  return (
    <InputGroup
      className={cn(
        "w-36",
        context.size === "sm" && "h-7!",
        context.size === "default" && "h-8!",
        context.size === "lg" && "h-9!",
        className
      )}
    >
      {field?.prefix && (
        <InputGroupAddon>
          <InputGroupText>{field.prefix}</InputGroupText>
        </InputGroupAddon>
      )}
      <InputGroupInput
        ref={inputRef}
        aria-invalid={!isValid}
        aria-describedby={
          !isValid && validationMessage
            ? `${field?.key || "input"}-error`
            : undefined
        }
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          context.size === "sm" && "h-7! text-xs",
          context.size === "default" && "h-8!",
          context.size === "lg" && "h-9!"
        )}
        {...props}
      />
      {!isValid && validationMessage && (
        <InputGroupAddon align="inline-end">
          <Tooltip>
            <TooltipTrigger render={<InputGroupButton size="icon-xs" />}>
              <AlertCircleIcon className="text-destructive size-3.5" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{validationMessage}</p>
            </TooltipContent>
          </Tooltip>
        </InputGroupAddon>
      )}

      {field?.suffix && (
        <InputGroupAddon align="inline-end">
          <InputGroupText>{field.suffix}</InputGroupText>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}

interface FilterRemoveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
}

function FilterRemoveButton({
  className,
  icon = DEFAULT_REMOVE_ICON,
  ...props
}: FilterRemoveButtonProps) {
  const context = useFilterContext();
  let buttonSize: "icon-sm" | "icon" | "icon-lg" = "icon";

  if (context.size === "sm") {
    buttonSize = "icon-sm";
  } else if (context.size === "lg") {
    buttonSize = "icon-lg";
  }

  return (
    <Button
      variant="outline"
      size={buttonSize}
      className={className}
      {...props}
    >
      {icon}
    </Button>
  );
}

// Generic types for flexible filter system
export interface FilterOption<T = unknown> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  metadata?: Record<string, unknown>;
  className?: string;
}

export interface FilterOperator {
  value: string;
  label: string;
  supportsMultiple?: boolean;
}

// Custom renderer props interface
export interface CustomRendererProps<T = unknown> {
  field: FilterFieldConfig<T>;
  values: T[];
  onChange: (values: T[]) => void;
  operator: string;
}

// Grouped field configuration interface
export interface FilterFieldGroup<T = unknown> {
  group?: string;
  fields: FilterFieldConfig<T>[];
}

// Union type for both flat and grouped field configurations
export type FilterFieldsConfig<T = unknown> =
  | FilterFieldConfig<T>[]
  | FilterFieldGroup<T>[];

export interface FilterFieldConfig<T = unknown> {
  key?: string;
  label?: string;
  icon?: React.ReactNode;
  type?: "select" | "multiselect" | "text" | "custom" | "separator";
  // Group-level configuration
  group?: string;
  fields?: FilterFieldConfig<T>[];
  // Field-specific options
  options?: FilterOption<T>[];
  operators?: FilterOperator[];
  customRenderer?: (props: CustomRendererProps<T>) => React.ReactNode;
  customValueRenderer?: (
    values: T[],
    options: FilterOption<T>[]
  ) => React.ReactNode;
  placeholder?: string;
  searchable?: boolean;
  maxSelections?: number;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string | React.ReactNode;
  suffix?: string | React.ReactNode;
  pattern?: string;
  validation?: (
    value: unknown
  ) => boolean | { valid: boolean; message?: string };
  allowCustomValues?: boolean;
  className?: string;
  menuPopupClassName?: string;
  // Grouping options (legacy support)
  groupLabel?: string;
  // Boolean field options
  onLabel?: string;
  offLabel?: string;
  // Input event handlers
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // Default operator to use when creating a filter for this field
  defaultOperator?: string;
  // Controlled values support for this field
  value?: T[];
  onValueChange?: (values: T[]) => void;
}

// Helper functions to handle both flat and grouped field configurations
function isFieldGroup<T = unknown>(
  item: FilterFieldConfig<T> | FilterFieldGroup<T>
): item is FilterFieldGroup<T> {
  return "fields" in item && Array.isArray(item.fields);
}

function isGroupLevelField<T = unknown>(field: FilterFieldConfig<T>): boolean {
  return Boolean(field.group && field.fields);
}

function flattenFields<T = unknown>(
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

function getFieldsMap<T = unknown>(
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

// Helper function to create operators from i18n config
function createOperatorsFromI18n(
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

// Default operators for different field types (using default i18n)
export const DEFAULT_OPERATORS: Record<string, FilterOperator[]> =
  createOperatorsFromI18n(DEFAULT_I18N);

// Helper function to get operators for a field
function getOperatorsForField<T = unknown>(
  field: FilterFieldConfig<T>,
  values: T[],
  i18n: FilterI18nConfig
): FilterOperator[] {
  if (field.operators) {
    return field.operators;
  }

  const operators = createOperatorsFromI18n(i18n);

  // Determine field type for operator selection
  let fieldType = field.type || "select";

  // If it's a select field but has multiple values, treat as multiselect
  if (fieldType === "select" && values.length > 1) {
    fieldType = "multiselect";
  }

  // If it's a multiselect field or has multiselect operators, use multiselect operators
  if (fieldType === "multiselect" || field.type === "multiselect") {
    return operators.multiselect;
  }

  return operators[fieldType] || operators.select;
}

interface FilterOperatorDropdownProps<T = unknown> {
  field: FilterFieldConfig<T>;
  operator: string;
  values: T[];
  onChange: (operator: string) => void;
}

function FilterOperatorDropdown<T = unknown>({
  field,
  operator,
  values,
  onChange,
}: FilterOperatorDropdownProps<T>) {
  const context = useFilterContext();
  const operators = getOperatorsForField(field, values, context.i18n);

  // Find the operator label, with fallback to formatted operator name
  const operatorLabel =
    operators.find((op) => op.value === operator)?.label ||
    context.i18n.helpers.formatOperator(operator);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size={context.size}
            className="text-muted-foreground hover:text-foreground"
          >
            {operatorLabel}
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-fit min-w-fit">
        {operators.map((op) => (
          <DropdownMenuItem
            key={op.value}
            onClick={() => onChange(op.value)}
            className={cn(
              "data-highlighted:bg-accent data-highlighted:text-accent-foreground flex items-center justify-between"
            )}
          >
            <span>{op.label}</span>
            <CheckIcon
              className={cn(
                "text-primary ms-auto",
                op.value === operator ? "opacity-100" : "opacity-0"
              )}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface FilterValueSelectorProps<T = unknown> {
  field: FilterFieldConfig<T>;
  values: T[];
  onChange: (values: T[]) => void;
  operator: string;
  autoFocus?: boolean;
}

interface SelectOptionsPopoverProps<T = unknown> {
  field: FilterFieldConfig<T>;
  values: T[];
  onChange: (values: T[]) => void;
  onClose?: () => void;
  inline?: boolean;
}

function SelectOptionsPopover<T = unknown>({
  field,
  values,
  onChange,
  onClose,
  inline = false,
}: SelectOptionsPopoverProps<T>) {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const context = useFilterContext();
  const baseId = useId();

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchInput, open]);

  useEffect(() => {
    if (highlightedIndex >= 0 && open) {
      scrollOptionIntoView(baseId, highlightedIndex);
    }
  }, [highlightedIndex, open, baseId]);

  const isMultiSelect = field.type === "multiselect" || values.length > 1;
  const effectiveValues =
    field.value === undefined ? values : (field.value as T[]);

  const selectedOptions =
    field.options?.filter((opt) => effectiveValues.includes(opt.value)) || [];
  const unselectedOptions =
    field.options?.filter((opt) => !effectiveValues.includes(opt.value)) || [];

  const filteredSelectedOptions = selectedOptions;
  const filteredUnselectedOptions = unselectedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchInput.toLowerCase())
  );

  const allFilteredOptions = [
    ...filteredSelectedOptions,
    ...filteredUnselectedOptions,
  ];

  function handleClose() {
    setOpen(false);
    onClose?.();
  }

  function renderMenuContent() {
    return (
      <>
        {field.searchable !== false && (
          <>
            <Input
              ref={inputRef}
              aria-expanded="true"
              aria-haspopup="listbox"
              aria-controls={`${baseId}-listbox`}
              aria-activedescendant={
                highlightedIndex >= 0
                  ? `${baseId}-item-${highlightedIndex}`
                  : undefined
              }
              tabIndex={0}
              placeholder={context.i18n.placeholders.searchField(
                field.label || ""
              )}
              className={cn(
                "border-input h-8 rounded-none border-0 bg-transparent! px-2 text-sm shadow-none",
                "focus-visible:border-border focus-visible:ring-0 focus-visible:ring-offset-0",
                open && "placeholder:text-foreground"
              )}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onBlur={() => open && inputRef.current?.focus()}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (allFilteredOptions.length > 0) {
                    setHighlightedIndex((prev) =>
                      prev < allFilteredOptions.length - 1 ? prev + 1 : 0
                    );
                  }
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  if (allFilteredOptions.length > 0) {
                    setHighlightedIndex((prev) =>
                      prev > 0 ? prev - 1 : allFilteredOptions.length - 1
                    );
                  }
                } else if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  setOpen(false);
                } else if (e.key === "Enter" && highlightedIndex >= 0) {
                  e.preventDefault();
                  const option = allFilteredOptions[highlightedIndex];
                  if (option) {
                    const isSelected = effectiveValues.includes(
                      option.value as T
                    );
                    let next: T[];

                    if (isSelected) {
                      next = effectiveValues.filter(
                        (v) => v !== option.value
                      ) as T[];
                    } else if (isMultiSelect) {
                      next = [...effectiveValues, option.value] as T[];
                    } else {
                      next = [option.value] as T[];
                    }

                    if (
                      !isSelected &&
                      isMultiSelect &&
                      field.maxSelections &&
                      next.length > field.maxSelections
                    ) {
                      return;
                    }

                    if (field.onValueChange) {
                      field.onValueChange(next);
                    } else {
                      onChange(next);
                    }
                    if (!isMultiSelect) {
                      handleClose();
                    }
                  }
                }
                e.stopPropagation();
              }}
            />
            <DropdownMenuSeparator />
          </>
        )}
        <div className="relative flex max-h-full">
          <div
            className="flex max-h-[min(var(--available-height),24rem)] w-full scroll-pt-2 scroll-pb-2 flex-col overscroll-contain"
            id={`${baseId}-listbox`}
            tabIndex={-1}
          >
            <ScrollArea className="size-full min-h-0 **:data-[slot=scroll-area-scrollbar]:m-0 [&_[data-slot=scroll-area-viewport]]:h-full [&_[data-slot=scroll-area-viewport]]:overscroll-contain">
              {allFilteredOptions.length === 0 && (
                <div className="text-muted-foreground py-2 text-center text-sm">
                  {context.i18n.noResultsFound}
                </div>
              )}

              {/* Selected items */}
              {filteredSelectedOptions.length > 0 && (
                <DropdownMenuGroup className="px-1">
                  {filteredSelectedOptions.map((option, index) => {
                    const isHighlighted = highlightedIndex === index;
                    const itemId = `${baseId}-item-${index}`;

                    return (
                      <DropdownMenuCheckboxItem
                        key={String(option.value)}
                        id={itemId}
                        tabIndex={-1}
                        data-highlighted={isHighlighted || undefined}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        checked={true}
                        className={cn(
                          "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                          option.className
                        )}
                        onSelect={(e) => {
                          if (isMultiSelect) {
                            e.preventDefault();
                          }
                        }}
                        onCheckedChange={() => {
                          const next = effectiveValues.filter(
                            (v) => v !== option.value
                          ) as T[];
                          if (field.onValueChange) {
                            field.onValueChange(next);
                          } else {
                            onChange(next);
                          }
                          if (!isMultiSelect) {
                            handleClose();
                          }
                        }}
                      >
                        {option.icon}
                        <span className="truncate">{option.label}</span>
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuGroup>
              )}

              {/* Separator */}
              {filteredSelectedOptions.length > 0 &&
                filteredUnselectedOptions.length > 0 && (
                  <DropdownMenuSeparator className="mx-0" />
                )}

              {/* Available items */}
              {filteredUnselectedOptions.length > 0 && (
                <DropdownMenuGroup className="px-1">
                  {filteredUnselectedOptions.map((option, index) => {
                    const overallIndex = index + filteredSelectedOptions.length;
                    const isHighlighted = highlightedIndex === overallIndex;
                    const itemId = `${baseId}-item-${overallIndex}`;

                    return (
                      <DropdownMenuCheckboxItem
                        key={String(option.value)}
                        id={itemId}
                        tabIndex={-1}
                        data-highlighted={isHighlighted || undefined}
                        onMouseEnter={() => setHighlightedIndex(overallIndex)}
                        checked={false}
                        className={cn(
                          "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                          option.className
                        )}
                        onSelect={(e) => {
                          if (isMultiSelect) {
                            e.preventDefault();
                          }
                        }}
                        onCheckedChange={() => {
                          const next = isMultiSelect
                            ? ([...effectiveValues, option.value] as T[])
                            : ([option.value] as T[]);

                          if (
                            isMultiSelect &&
                            field.maxSelections &&
                            next.length > field.maxSelections
                          ) {
                            return;
                          }

                          if (field.onValueChange) {
                            field.onValueChange(next);
                          } else {
                            onChange(next);
                          }
                          if (!isMultiSelect) {
                            handleClose();
                          }
                        }}
                      >
                        {option.icon}
                        <span className="truncate">{option.label}</span>
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuGroup>
              )}
            </ScrollArea>
          </div>
        </div>
      </>
    );
  }

  if (inline) {
    return <div className="w-full">{renderMenuContent()}</div>;
  }

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          return;
        }

        setTimeout(() => setSearchInput(""), 200);
      }}
    >
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size={context.size}>
            <div className="flex items-center gap-1.5">
              {field.customValueRenderer ? (
                field.customValueRenderer(values, field.options || [])
              ) : (
                <>
                  {selectedOptions.length > 0 && (
                    <div className="flex items-center -space-x-1.5">
                      {selectedOptions.slice(0, 3).map((option) => (
                        <div key={String(option.value)}>{option.icon}</div>
                      ))}
                    </div>
                  )}
                  {selectedOptions.length === 1
                    ? selectedOptions[0]?.label
                    : buildFilterLabel(selectedOptions.length, context.i18n)}
                </>
              )}
            </div>
          </Button>
        }
      />
      <DropdownMenuContent
        align="start"
        className={cn("w-[200px] px-0", field.className)}
      >
        {renderMenuContent()}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FilterValueSelector<T = unknown>({
  field,
  values,
  onChange,
  operator,
  autoFocus,
}: FilterValueSelectorProps<T>) {
  if (operator === "empty" || operator === "not_empty") {
    return null;
  }

  if (field.customRenderer) {
    return (
      <ButtonGroupText className="hover:bg-accent aria-expanded:bg-accent bg-background dark:bg-input/30 text-start whitespace-nowrap outline-hidden">
        {field.customRenderer({ field, onChange, operator, values })}
      </ButtonGroupText>
    );
  }

  if (field.type === "text") {
    return (
      <FilterInput
        type="text"
        value={(values[0] as string) || ""}
        onChange={(e) => onChange([e.target.value] as T[])}
        placeholder={field.placeholder}
        pattern={field.pattern}
        field={field}
        className={cn("w-36", field.className)}
        autoFocus={autoFocus}
      />
    );
  }

  if (field.type === "select" || field.type === "multiselect") {
    return (
      <SelectOptionsPopover field={field} values={values} onChange={onChange} />
    );
  }

  return (
    <SelectOptionsPopover field={field} values={values} onChange={onChange} />
  );
}
export interface Filter<T = unknown> {
  id: string;
  field: string;
  operator: string;
  values: T[];
}

export interface FilterGroup<T = unknown> {
  id: string;
  label?: string;
  filters: Filter<T>[];
  fields: FilterFieldConfig<T>[];
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

interface FiltersContentProps<T = unknown> {
  filters: Filter<T>[];
  fields: FilterFieldsConfig<T>;
  onChange: (filters: Filter<T>[]) => void;
}

export function FiltersContent<T = unknown>({
  filters,
  fields,
  onChange,
}: FiltersContentProps<T>) {
  const context = useFilterContext();
  const fieldsMap = useMemo(() => getFieldsMap(fields), [fields]);

  const updateFilter = useCallback(
    (filterId: string, updates: Partial<Filter<T>>) => {
      onChange(
        filters.map((filter) => {
          if (filter.id === filterId) {
            const updatedFilter = { ...filter, ...updates };
            if (
              updates.operator === "empty" ||
              updates.operator === "not_empty"
            ) {
              updatedFilter.values = [] as T[];
            }
            return updatedFilter;
          }
          return filter;
        })
      );
    },
    [filters, onChange]
  );

  const removeFilter = useCallback(
    (filterId: string) => {
      onChange(filters.filter((filter) => filter.id !== filterId));
    },
    [filters, onChange]
  );

  return (
    <div
      className={cn(
        filtersContainerVariants({
          size: context.size,
          variant: context.variant,
        }),
        context.className
      )}
    >
      {filters.map((filter) => {
        const field = fieldsMap[filter.field];
        if (!field) {
          return null;
        }

        return (
          <ButtonGroup key={filter.id}>
            <ButtonGroupText>
              {field.icon}
              {field.label}
            </ButtonGroupText>

            <FilterOperatorDropdown<T>
              field={field}
              operator={filter.operator}
              values={filter.values}
              onChange={(operator) => updateFilter(filter.id, { operator })}
            />

            <FilterValueSelector<T>
              field={field}
              values={filter.values}
              onChange={(values) => updateFilter(filter.id, { values })}
              operator={filter.operator}
              autoFocus={false}
            />

            <FilterRemoveButton onClick={() => removeFilter(filter.id)} />
          </ButtonGroup>
        );
      })}
    </div>
  );
}

interface FiltersProps<T = unknown> {
  filters: Filter<T>[];
  fields: FilterFieldsConfig<T>;
  onChange: (filters: Filter<T>[]) => void;
  className?: string;
  variant?: "solid" | "default";
  size?: "sm" | "default" | "lg";
  radius?: "default" | "full";
  i18n?: Partial<FilterI18nConfig>;
  showSearchInput?: boolean;
  trigger?: React.ReactNode;
  allowMultiple?: boolean;
  menuPopupClassName?: string;
  collapseAddButton?: boolean;
  enableShortcut?: boolean;
  shortcutKey?: string;
  shortcutLabel?: string;
}

interface FilterSubmenuContentProps<T = unknown> {
  field: FilterFieldConfig<T>;
  currentValues: T[];
  isMultiSelect: boolean;
  onToggle: (value: T, isSelected: boolean) => void;
  i18n: FilterI18nConfig;
  isActive?: boolean;
  onActive?: () => void;
  onBack?: () => void;
  onClose?: () => void;
}

function FilterSubmenuContent<T = unknown>({
  field,
  currentValues,
  isMultiSelect,
  onToggle,
  i18n,
  isActive,
  onActive,
  onBack,
  onClose,
}: FilterSubmenuContentProps<T>) {
  const [searchInput, setSearchInput] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const baseId = useId();

  useEffect(() => {
    if (isActive && field.searchable !== false) {
      inputRef.current?.focus();
    }
  }, [isActive, field.searchable, baseId]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchInput]);

  useEffect(() => {
    if (highlightedIndex >= 0 && isActive) {
      scrollOptionIntoView(baseId, highlightedIndex);
    }
  }, [highlightedIndex, isActive, baseId]);

  const filteredOptions = useMemo(
    () =>
      field.options?.filter((option) => {
        const isSelected = currentValues.includes(option.value);
        if (isSelected) {
          return true;
        }
        if (!searchInput) {
          return true;
        }
        return option.label.toLowerCase().includes(searchInput.toLowerCase());
      }) || [],
    [field.options, searchInput, currentValues]
  );

  useEffect(() => {
    if (isActive && filteredOptions.length > 0) {
      setHighlightedIndex(0);
    }
  }, [isActive, filteredOptions.length]);

  return (
    <div className="flex flex-col" onMouseEnter={onActive}>
      {field.searchable !== false && (
        <>
          <Input
            ref={inputRef}
            aria-expanded="true"
            aria-haspopup="listbox"
            aria-controls={`${baseId}-listbox`}
            aria-activedescendant={
              highlightedIndex >= 0
                ? `${baseId}-item-${highlightedIndex}`
                : undefined
            }
            placeholder={i18n.placeholders.searchField(field.label || "")}
            className={cn(
              "h-8 rounded-none border-0 bg-transparent! px-2 text-sm shadow-none",
              "focus-visible:border-border focus-visible:ring-0 focus-visible:ring-offset-0",
              isActive && "placeholder:text-foreground"
            )}
            value={searchInput}
            tabIndex={0}
            onBlur={() => isActive && inputRef.current?.focus()}
            onChange={(e) => setSearchInput(e.target.value)}
            onFocus={() => onActive?.()}
            onMouseEnter={(e) => {
              onActive?.();
              e.stopPropagation();
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                if (filteredOptions.length > 0) {
                  setHighlightedIndex((prev) =>
                    prev < filteredOptions.length - 1 ? prev + 1 : 0
                  );
                }
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                if (filteredOptions.length > 0) {
                  setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : filteredOptions.length - 1
                  );
                }
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                onBack?.();
              } else if (e.key === "Enter" && highlightedIndex >= 0) {
                e.preventDefault();
                const option = filteredOptions[highlightedIndex];
                if (option) {
                  onToggle(
                    option.value as T,
                    currentValues.includes(option.value)
                  );
                  if (!isMultiSelect) {
                    onBack?.();
                  }
                }
              } else if (e.key === "Escape") {
                e.preventDefault();
                onClose?.();
              }
              e.stopPropagation();
            }}
          />
          <DropdownMenuSeparator />
        </>
      )}
      <div className="relative flex max-h-full">
        <div
          className="flex max-h-[min(var(--available-height),24rem)] w-full scroll-pt-2 scroll-pb-2 flex-col overscroll-contain outline-hidden"
          id={`${baseId}-listbox`}
        >
          <ScrollArea className="size-full min-h-0 **:data-[slot=scroll-area-scrollbar]:m-0 [&_[data-slot=scroll-area-viewport]]:h-full [&_[data-slot=scroll-area-viewport]]:overscroll-contain">
            {filteredOptions.length === 0 ? (
              <div className="text-muted-foreground py-2 text-center text-sm">
                {i18n.noResultsFound}
              </div>
            ) : (
              <DropdownMenuGroup>
                {filteredOptions.map((option, index) => {
                  const isSelected = currentValues.includes(option.value);
                  const isHighlighted = highlightedIndex === index;
                  const itemId = `${baseId}-item-${index}`;

                  return (
                    <DropdownMenuCheckboxItem
                      key={String(option.value)}
                      id={itemId}
                      tabIndex={-1}
                      data-highlighted={isHighlighted || undefined}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      checked={isSelected}
                      className={cn(
                        "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                        option.className
                      )}
                      onSelect={(e) => {
                        if (isMultiSelect) {
                          e.preventDefault();
                        }
                      }}
                      onCheckedChange={() =>
                        onToggle(option.value as T, isSelected)
                      }
                    >
                      {option.icon}
                      <span className="truncate">{option.label}</span>
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuGroup>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

export function Filters<T = unknown>({
  filters,
  fields,
  onChange,
  className,
  variant = "default",
  size = "default",
  radius = "default",
  i18n,
  showSearchInput = true,
  trigger,
  allowMultiple = true,
  menuPopupClassName,
  enableShortcut = false,
  shortcutKey = "f",
  shortcutLabel = "F",
}: FiltersProps<T>) {
  const [addFilterOpen, setAddFilterOpen] = useState(false);
  const [menuSearchInput, setMenuSearchInput] = useState("");
  const [activeMenu, setActiveMenu] = useState<string>("root");
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [lastAddedFilterId, setLastAddedFilterId] = useState<string | null>(
    null
  );
  const rootInputRef = useRef<HTMLInputElement>(null);
  const rootId = useId();

  useEffect(() => {
    if (!enableShortcut) {
      return;
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key.toLowerCase() === shortcutKey.toLowerCase() &&
        !addFilterOpen &&
        !(
          document.activeElement instanceof HTMLInputElement ||
          document.activeElement instanceof HTMLTextAreaElement
        )
      ) {
        e.preventDefault();
        setAddFilterOpen(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableShortcut, shortcutKey, addFilterOpen]);

  useEffect(() => {
    if (addFilterOpen && activeMenu === "root") {
      rootInputRef.current?.focus();
    }
  }, [addFilterOpen, activeMenu]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [menuSearchInput]);

  useEffect(() => {
    if (highlightedIndex >= 0 && addFilterOpen) {
      scrollOptionIntoView(rootId, highlightedIndex);
    }
  }, [highlightedIndex, addFilterOpen, rootId]);

  useEffect(() => {
    if (addFilterOpen) {
      return;
    }

    setOpenSubMenu(null);
  }, [addFilterOpen]);

  // Track which filter instance is being built in the current Add Filter menu session
  // Maps fieldKey -> unique filterId created during this open session
  const [sessionFilterIds, setSessionFilterIds] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (lastAddedFilterId) {
      const timer = setTimeout(() => {
        setLastAddedFilterId(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [lastAddedFilterId]);

  const mergedI18n: FilterI18nConfig = {
    ...DEFAULT_I18N,
    ...i18n,
    operators: { ...DEFAULT_I18N.operators, ...i18n?.operators },
    placeholders: { ...DEFAULT_I18N.placeholders, ...i18n?.placeholders },
    validation: { ...DEFAULT_I18N.validation, ...i18n?.validation },
  };

  const fieldsMap = useMemo(() => getFieldsMap(fields), [fields]);

  const updateFilter = useCallback(
    (filterId: string, updates: Partial<Filter<T>>) => {
      onChange(
        filters.map((filter) => {
          if (filter.id === filterId) {
            const updatedFilter = { ...filter, ...updates };
            if (
              updates.operator === "empty" ||
              updates.operator === "not_empty"
            ) {
              updatedFilter.values = [] as T[];
            }
            return updatedFilter;
          }
          return filter;
        })
      );
    },
    [filters, onChange]
  );

  const removeFilter = useCallback(
    (filterId: string) => {
      onChange(filters.filter((filter) => filter.id !== filterId));
    },
    [filters, onChange]
  );

  function addFilter(fieldKey: string) {
    const field = fieldsMap[fieldKey];
    if (field && field.key) {
      const defaultOperator =
        field.defaultOperator ||
        (field.type === "multiselect" ? "is_any_of" : "is");
      const defaultValues: unknown[] = field.type === "text" ? [""] : [];
      const newFilter = createFilter<T>(
        fieldKey,
        defaultOperator,
        defaultValues as T[]
      );
      setLastAddedFilterId(newFilter.id);
      onChange([...filters, newFilter]);
      setAddFilterOpen(false);
      setMenuSearchInput("");
    }
  }

  const selectableFields = useMemo(() => {
    const flatFields = flattenFields(fields);
    return flatFields.filter((field) => {
      if (!field.key || field.type === "separator") {
        return false;
      }
      if (allowMultiple) {
        return true;
      }
      return !filters.some((filter) => filter.field === field.key);
    });
  }, [fields, filters, allowMultiple]);

  const filteredFields = useMemo(
    () =>
      selectableFields.filter(
        (f) =>
          !menuSearchInput ||
          f.label?.toLowerCase().includes(menuSearchInput.toLowerCase())
      ),
    [selectableFields, menuSearchInput]
  );

  useEffect(() => {
    if (addFilterOpen && filteredFields.length > 0) {
      setHighlightedIndex(0);
    }
  }, [addFilterOpen, filteredFields.length]);

  const triggerButton = useRender({
    defaultTagName: "button",
    render: trigger as React.ReactElement,
  });

  return (
    <FilterContext.Provider
      value={{
        allowMultiple,
        className,
        i18n: mergedI18n,
        radius,
        size,
        trigger,
        variant,
      }}
    >
      <div
        className={cn(filtersContainerVariants({ size, variant }), className)}
      >
        {selectableFields.length > 0 && (
          <DropdownMenu
            open={addFilterOpen}
            onOpenChange={(open) => {
              setAddFilterOpen(open);
              if (open) {
                setActiveMenu("root");
                return;
              }

              setMenuSearchInput("");
              setSessionFilterIds({});
            }}
          >
            <DropdownMenuTrigger render={triggerButton} />
            <DropdownMenuContent
              className={cn("w-[220px]", menuPopupClassName)}
              align="start"
            >
              {showSearchInput && (
                <>
                  <div className="relative">
                    <Input
                      ref={rootInputRef}
                      aria-expanded={openSubMenu !== null}
                      aria-controls={`${rootId}-listbox`}
                      aria-activedescendant={
                        highlightedIndex >= 0
                          ? `${rootId}-item-${highlightedIndex}`
                          : undefined
                      }
                      placeholder={mergedI18n.searchFields}
                      className={cn(
                        "h-8 rounded-none border-0 bg-transparent! px-2 text-sm shadow-none",
                        "focus-visible:border-border focus-visible:ring-0 focus-visible:ring-offset-0",
                        activeMenu === "root" && "placeholder:text-foreground"
                      )}
                      value={menuSearchInput}
                      tabIndex={0}
                      onFocus={() => setActiveMenu("root")}
                      onMouseEnter={() => setActiveMenu("root")}
                      onBlur={() =>
                        activeMenu === "root" && rootInputRef.current?.focus()
                      }
                      onChange={(e) => setMenuSearchInput(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={handleRootInputKeyDown}
                    />
                    {enableShortcut && shortcutLabel && (
                      <Kbd className="bg-background absolute top-1/2 right-2 -translate-y-1/2 border">
                        {shortcutLabel}
                      </Kbd>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}

              <div className="relative flex max-h-full">
                <div
                  className="flex max-h-[min(var(--available-height),24rem)] w-full scroll-pt-2 scroll-pb-2 flex-col overscroll-contain"
                  id={`${rootId}-listbox`}
                  tabIndex={-1}
                  onMouseEnter={() => setActiveMenu("root")}
                >
                  <ScrollArea className="**:data-[slot=scroll-area-scrollbar]:m-0">
                    {filteredFields.length === 0 ? (
                      <div className="text-muted-foreground py-2 text-center text-sm">
                        {mergedI18n.noFieldsFound}
                      </div>
                    ) : (
                      filteredFields.map((field, index) => {
                        const isHighlighted = highlightedIndex === index;
                        const itemId = `${rootId}-item-${index}`;
                        const hasSubMenu =
                          (field.type === "select" ||
                            field.type === "multiselect") &&
                          field.options?.length;

                        if (hasSubMenu) {
                          const isMultiSelect = field.type === "multiselect";
                          const fieldKey = field.key as string;
                          const sessionFilterId = sessionFilterIds[fieldKey];
                          const sessionFilter = sessionFilterId
                            ? filters.find((f) => f.id === sessionFilterId)
                            : null;
                          const currentValues = sessionFilter?.values || [];

                          return (
                            <DropdownMenuSub
                              key={fieldKey}
                              open={openSubMenu === fieldKey}
                              onOpenChange={(open) => {
                                if (open) {
                                  setOpenSubMenu(fieldKey);
                                } else if (openSubMenu === fieldKey) {
                                  setOpenSubMenu(null);
                                  setActiveMenu("root");
                                }
                              }}
                            >
                              <DropdownMenuSubTrigger
                                id={itemId}
                                tabIndex={-1}
                                data-highlighted={isHighlighted || undefined}
                                onMouseEnter={() => {
                                  setHighlightedIndex(index);
                                  setActiveMenu("root");
                                }}
                                className="data-popup-open:bg-accent data-popup-open:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                              >
                                {field.icon}
                                <span>{field.label}</span>
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent
                                className="w-[200px]"
                                side="right"
                              >
                                <FilterSubmenuContent
                                  field={field}
                                  currentValues={currentValues}
                                  isMultiSelect={isMultiSelect}
                                  i18n={mergedI18n}
                                  isActive={activeMenu === fieldKey}
                                  onActive={() => {
                                    if (field.searchable === false) {
                                      return;
                                    }

                                    setActiveMenu(fieldKey);
                                  }}
                                  onBack={() => {
                                    setOpenSubMenu(null);
                                    setActiveMenu("root");
                                  }}
                                  onClose={() => setAddFilterOpen(false)}
                                  onToggle={(value, isSelected) => {
                                    if (isMultiSelect) {
                                      const nextValues = isSelected
                                        ? (currentValues.filter(
                                            (v) => v !== value
                                          ) as T[])
                                        : ([...currentValues, value] as T[]);

                                      if (sessionFilter) {
                                        if (nextValues.length === 0) {
                                          onChange(
                                            filters.filter(
                                              (f) => f.id !== sessionFilter.id
                                            )
                                          );
                                          setSessionFilterIds((prev) => ({
                                            ...prev,
                                            [fieldKey]: "",
                                          }));
                                        } else {
                                          onChange(
                                            filters.map((f) =>
                                              f.id === sessionFilter.id
                                                ? { ...f, values: nextValues }
                                                : f
                                            )
                                          );
                                        }
                                      } else {
                                        const newFilter = createFilter<T>(
                                          fieldKey,
                                          field.defaultOperator || "is_any_of",
                                          nextValues
                                        );
                                        onChange([...filters, newFilter]);
                                        setSessionFilterIds((prev) => ({
                                          ...prev,
                                          [fieldKey]: newFilter.id,
                                        }));
                                      }
                                    } else {
                                      const newFilter = createFilter<T>(
                                        fieldKey,
                                        field.defaultOperator || "is",
                                        [value] as T[]
                                      );
                                      setLastAddedFilterId(newFilter.id);
                                      onChange([...filters, newFilter]);
                                      setAddFilterOpen(false);
                                    }
                                  }}
                                />
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                          );
                        }

                        return (
                          <DropdownMenuItem
                            key={field.key}
                            id={itemId}
                            tabIndex={-1}
                            data-highlighted={isHighlighted || undefined}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            onClick={() => field.key && addFilter(field.key)}
                            className="data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                          >
                            {field.icon}
                            <span>{field.label}</span>
                          </DropdownMenuItem>
                        );
                      })
                    )}
                  </ScrollArea>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {filters.map((filter) => {
          const field = fieldsMap[filter.field];
          if (!field) {
            return null;
          }
          return (
            <ButtonGroup key={filter.id}>
              <ButtonGroupText className="bg-background dark:bg-input/30">
                {field.icon}
                {field.label}
              </ButtonGroupText>
              <FilterOperatorDropdown<T>
                field={field}
                operator={filter.operator}
                values={filter.values}
                onChange={(operator) => updateFilter(filter.id, { operator })}
              />
              <FilterValueSelector<T>
                field={field}
                values={filter.values}
                operator={filter.operator}
                onChange={(values) => updateFilter(filter.id, { values })}
                autoFocus={filter.id === lastAddedFilterId}
              />
              <FilterRemoveButton onClick={() => removeFilter(filter.id)} />
            </ButtonGroup>
          );
        })}
      </div>
    </FilterContext.Provider>
  );
}
function updateRootHighlight(direction: "next" | "previous") {
  if (filteredFields.length === 0) {
    return;
  }

  setHighlightedIndex((previousIndex) => {
    if (direction === "next") {
      return previousIndex < filteredFields.length - 1 ? previousIndex + 1 : 0;
    }

    return previousIndex > 0 ? previousIndex - 1 : filteredFields.length - 1;
  });
}

function toggleHighlightedField() {
  const field = filteredFields[highlightedIndex];
  if (!field?.key) {
    return;
  }

  const hasSubMenu = Boolean(
    (field.type === "select" || field.type === "multiselect") &&
    field.options?.length
  );

  if (hasSubMenu) {
    if (openSubMenu === field.key) {
      setOpenSubMenu(null);
      setActiveMenu("root");
    } else {
      setOpenSubMenu(field.key);
      setActiveMenu(field.key);
    }
    return;
  }

  addFilter(field.key);
}

function handleRootInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    updateRootHighlight("next");
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    updateRootHighlight("previous");
  } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
    handleRootHorizontalNavigation(e);
  } else if (e.key === "Enter" && highlightedIndex >= 0) {
    e.preventDefault();
    toggleHighlightedField();
  } else if (e.key === "Escape") {
    setAddFilterOpen(false);
  }

  e.stopPropagation();
}

function handleRootHorizontalNavigation(
  e: React.KeyboardEvent<HTMLInputElement>
) {
  if (highlightedIndex < 0) {
    return;
  }

  const field = filteredFields[highlightedIndex];
  const hasSubMenu = Boolean(
    field &&
    (field.type === "select" || field.type === "multiselect") &&
    field.options?.length
  );

  if (e.key === "ArrowRight" && hasSubMenu) {
    e.preventDefault();
    setOpenSubMenu(field?.key || null);
    setActiveMenu(field?.key || "root");
  } else if (e.key === "ArrowLeft" && openSubMenu !== null) {
    e.preventDefault();
    setOpenSubMenu(null);
    setActiveMenu("root");
  }
}
