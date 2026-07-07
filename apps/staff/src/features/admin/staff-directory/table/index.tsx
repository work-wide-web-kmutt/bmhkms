import type { PaginationState, SortingState } from "@tanstack/react-table";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FunnelXIcon, ListFilterIcon, MailIcon, UserIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataGrid, DataGridContainer } from "@/components/ui/data-grid";
import { DataGridPagination } from "@/components/ui/data-grid/pagination";
import { DataGridScrollArea } from "@/components/ui/data-grid/scroll-area";
import { DataGridTable } from "@/components/ui/data-grid/table";
import { Filters } from "@/components/ui/filters";
import type { Filter, FilterFieldConfig } from "@/components/ui/filters";

import { staffDirectoryColumns } from "./columns";
import { staffDirectoryMockData } from "./mock-data";
import type { StaffDirectoryRow } from "./mock-data";

function getActiveFilters(filters: Filter[]): Filter[] {
  return filters.filter((filter) => {
    const { values } = filter;

    if (values.length === 0) {
      return false;
    }

    if (values.every((value) => value === null || value === undefined)) {
      return false;
    }

    if (
      values.every(
        (value) => typeof value === "string" && value.trim().length === 0
      )
    ) {
      return false;
    }

    if (values.every((value) => Array.isArray(value) && value.length === 0)) {
      return false;
    }

    return true;
  });
}

function normalizeString(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  return typeof value === "string" && value.trim().length === 0;
}

function matchesTextFilter(
  fieldValue: unknown,
  operator: string,
  values: unknown[]
): boolean {
  const normalizedFieldValue = normalizeString(fieldValue);
  const normalizedValues = values
    .map((value) => normalizeString(value))
    .filter((value) => value.length > 0);

  if (operator === "empty") {
    return isEmptyValue(fieldValue);
  }

  if (operator === "not_empty") {
    return !isEmptyValue(fieldValue);
  }

  if (normalizedValues.length === 0) {
    return true;
  }

  if (operator === "contains") {
    return normalizedValues.some((value) =>
      normalizedFieldValue.includes(value)
    );
  }

  if (operator === "not_contains") {
    return normalizedValues.every(
      (value) => !normalizedFieldValue.includes(value)
    );
  }

  if (operator === "starts_with") {
    return normalizedValues.some((value) =>
      normalizedFieldValue.startsWith(value)
    );
  }

  if (operator === "ends_with") {
    return normalizedValues.some((value) =>
      normalizedFieldValue.endsWith(value)
    );
  }

  if (operator === "is") {
    return normalizedFieldValue === normalizedValues[0];
  }

  return true;
}

function applyFiltersToData(
  data: StaffDirectoryRow[],
  filters: Filter[]
): StaffDirectoryRow[] {
  const activeFilters = getActiveFilters(filters);

  if (activeFilters.length === 0) {
    return data;
  }

  return data.filter((row) =>
    activeFilters.every((filter) => {
      const fieldValue = row[filter.field as keyof StaffDirectoryRow];

      if (filter.field === "name" || filter.field === "email") {
        return matchesTextFilter(fieldValue, filter.operator, filter.values);
      }

      return true;
    })
  );
}

function StaffDirectoryTable() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { desc: true, id: "name" },
  ]);
  const [filters, setFilters] = useState<Filter[]>([]);

  const fields = useMemo<FilterFieldConfig[]>(
    () => [
      {
        className: "w-40",
        icon: <UserIcon className="size-3.5" />,
        key: "name",
        label: "Name",
        placeholder: "Search names...",
        type: "text",
      },
      {
        className: "w-48",
        icon: <MailIcon className="size-3.5" />,
        key: "email",
        label: "Email",
        placeholder: "Search email...",
        type: "text",
      },
    ],
    []
  );

  const filteredData = useMemo(
    () => applyFiltersToData(staffDirectoryMockData, filters),
    [filters]
  );

  const activeFilters = useMemo(() => getActiveFilters(filters), [filters]);

  const handleFiltersChange = useCallback(
    (newFilters: Filter[]) => {
      const previousActiveFilters = getActiveFilters(filters);
      const nextActiveFilters = getActiveFilters(newFilters);
      const previousSerialized = JSON.stringify(previousActiveFilters);
      const nextSerialized = JSON.stringify(nextActiveFilters);

      setFilters(newFilters);

      if (previousSerialized === nextSerialized) {
        return;
      }

      setPagination((previousPagination) => ({
        ...previousPagination,
        pageIndex: 0,
      }));
    },
    [filters]
  );

  const table = useReactTable({
    columns: staffDirectoryColumns,
    data: filteredData,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    pageCount: Math.ceil(filteredData.length / pagination.pageSize),
    state: {
      pagination,
      sorting,
    },
  });

  return (
    <DataGrid recordCount={filteredData.length} table={table}>
      <div className="w-full space-y-3">
        <div className="flex items-start gap-2.5">
          <div className="flex-1">
            <Filters
              fields={fields}
              filters={filters}
              onChange={handleFiltersChange}
              size="sm"
              trigger={
                <Button size="icon-sm" variant="outline">
                  <ListFilterIcon />
                </Button>
              }
            />
          </div>
          {activeFilters.length > 0 && (
            <Button
              onClick={() => {
                setFilters([]);
                setPagination((previousPagination) => ({
                  ...previousPagination,
                  pageIndex: 0,
                }));
              }}
              size="sm"
              variant="outline"
            >
              <FunnelXIcon />
              Clear
            </Button>
          )}
        </div>
        <DataGridContainer>
          <DataGridScrollArea>
            <DataGridTable />
          </DataGridScrollArea>
        </DataGridContainer>
        <DataGridPagination />
      </div>
    </DataGrid>
  );
}

export { StaffDirectoryTable };
