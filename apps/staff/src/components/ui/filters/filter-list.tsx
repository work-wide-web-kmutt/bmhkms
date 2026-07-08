import { XIcon } from "lucide-react";
import { useCallback } from "react";
import type React from "react";

import { Button as UiButton } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";

import { filtersContainerVariants, useFilterContext } from "./filter-context";
import { FilterOperatorDropdown } from "./filter-operator-dropdown";
import { FilterValueSelector } from "./filter-value-selector";
import type { Filter, FilterFieldConfig } from "./types";

const DEFAULT_REMOVE_ICON = <XIcon />;

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
    <UiButton
      variant="outline"
      size={buttonSize}
      className={className}
      {...props}
    >
      {icon}
    </UiButton>
  );
}

interface FilterListProps<T = unknown> {
  filters: Filter<T>[];
  fieldsMap: Record<string, FilterFieldConfig<T>>;
  onChange: (filters: Filter<T>[]) => void;
  autoFocusFilterId?: string | null;
  includeContainer?: boolean;
  itemLabelClassName?: string;
}

export function FilterList<T = unknown>({
  filters,
  fieldsMap,
  onChange,
  autoFocusFilterId,
  includeContainer = true,
  itemLabelClassName,
}: FilterListProps<T>) {
  const context = useFilterContext();

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

  const content = filters.map((filter) => {
    const field = fieldsMap[filter.field];
    if (!field) {
      return null;
    }

    return (
      <ButtonGroup key={filter.id}>
        <ButtonGroupText className={itemLabelClassName}>
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
          autoFocus={filter.id === autoFocusFilterId}
        />
        <FilterRemoveButton onClick={() => removeFilter(filter.id)} />
      </ButtonGroup>
    );
  });

  if (!includeContainer) {
    return <>{content}</>;
  }

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
      {content}
    </div>
  );
}
