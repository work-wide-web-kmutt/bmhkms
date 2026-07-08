import { useMemo } from "react";

import { FilterList } from "./filter-list";
import { getFieldsMap } from "./filter-utils";
import type { FiltersContentProps } from "./types";

export function FiltersContent<T = unknown>({
  filters,
  fields,
  onChange,
}: FiltersContentProps<T>) {
  const fieldsMap = useMemo(() => getFieldsMap(fields), [fields]);

  return (
    <FilterList filters={filters} fieldsMap={fieldsMap} onChange={onChange} />
  );
}
