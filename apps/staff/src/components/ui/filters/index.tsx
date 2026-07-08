import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { AddFilterMenu } from "./add-filter-menu";
import { FilterProvider, filtersContainerVariants } from "./filter-context";
import { FilterList } from "./filter-list";
import { getFieldsMap } from "./filter-utils";
import { FiltersContent } from "./filters-content";
import { DEFAULT_I18N, DEFAULT_OPERATORS, mergeI18n } from "./i18n";
import type { FiltersProps } from "./types";

export type {
  CustomRendererProps,
  Filter,
  FilterFieldConfig,
  FilterFieldGroup,
  FilterFieldsConfig,
  FilterGroup,
  FilterI18nConfig,
  FilterOperator,
  FilterOption,
} from "./types";
export { createFilter, createFilterGroup } from "./filter-utils";
export { DEFAULT_I18N, DEFAULT_OPERATORS, FiltersContent };

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
  const [lastAddedFilterId, setLastAddedFilterId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!lastAddedFilterId) {
      return;
    }

    const timer = setTimeout(() => {
      setLastAddedFilterId(null);
    }, 1000);

    return () => clearTimeout(timer);
  }, [lastAddedFilterId]);

  const mergedI18n = mergeI18n(i18n);
  const fieldsMap = useMemo(() => getFieldsMap(fields), [fields]);

  return (
    <FilterProvider
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
        <AddFilterMenu
          filters={filters}
          fields={fields}
          onChange={onChange}
          trigger={
            trigger || (
              <Button variant="outline" size={size}>
                {mergedI18n.addFilter}
              </Button>
            )
          }
          showSearchInput={showSearchInput}
          allowMultiple={allowMultiple}
          menuPopupClassName={menuPopupClassName}
          enableShortcut={enableShortcut}
          shortcutKey={shortcutKey}
          shortcutLabel={shortcutLabel}
          i18n={mergedI18n}
          onLastAddedFilterChange={setLastAddedFilterId}
        />
        <FilterList
          filters={filters}
          fieldsMap={fieldsMap}
          onChange={onChange}
          autoFocusFilterId={lastAddedFilterId}
          includeContainer={false}
          itemLabelClassName="bg-background dark:bg-input/30"
        />
      </div>
    </FilterProvider>
  );
}
