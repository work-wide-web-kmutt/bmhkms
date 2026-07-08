import type { StaffListItem, StaffListOutput } from "@bmhkms/api/schemas/staff";
import { orpc } from "@bmhkms/client/orpc";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import type { Table } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef } from "react";

import type { Filter } from "@/components/ui/filters";
import { useDataGrid } from "@/hooks/use-data-grid";
import type {
  DataGridControlledState,
  DataGridStateChange,
} from "@/lib/data-grid/types";

import { staffDirectoryColumns } from "./columns";
import {
  decodeStaffDirectorySearch,
  encodeStaffDirectorySearch,
  fromStaffDirectoryFilters,
  getStaffDirectorySorting,
  isStaffFilterActive,
  normalizeStaffDirectoryPageSize,
  normalizeStaffDirectorySortField,
  STAFF_DIRECTORY_PAGE_SIZES,
  toStaffDirectoryFilters,
  toStaffDirectorySearchState,
  toStaffListInput,
} from "./search";

const staffRouteApi = getRouteApi("/_protected/admin/staff");

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return "Something went wrong while loading staff records.";
}

function areSearchValuesEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

interface StaffDirectoryTableState {
  backgroundErrorMessage: string | null;
  errorMessage: string | null;
  isInitialLoading: boolean;
  isUpdating: boolean;
  onClearFilters: () => void;
  onFiltersChange: (filters: Filter<string>[]) => void;
  onRetry: () => void;
  pageSizes: number[];
  table: Table<StaffListItem>;
  draftFilters: Filter<string>[];
  hasActiveFilters: boolean;
  isFilterCommitPending: boolean;
  totalRows: number;
}

export function useStaffDirectoryTable(): StaffDirectoryTableState {
  const navigate = staffRouteApi.useNavigate();
  const search = staffRouteApi.useSearch();
  const lastSuccessfulDataRef = useRef<StaffListOutput | null>(null);

  const decodedSearch = useMemo(
    () => decodeStaffDirectorySearch(search),
    [search]
  );
  const canonicalSearch = useMemo(
    () => encodeStaffDirectorySearch(decodedSearch),
    [decodedSearch]
  );

  useEffect(() => {
    if (areSearchValuesEqual(search, canonicalSearch)) {
      return;
    }

    void navigate({
      replace: true,
      search: canonicalSearch,
    });
  }, [canonicalSearch, navigate, search]);

  const queryInput = useMemo(
    () => toStaffListInput(decodedSearch),
    [decodedSearch]
  );
  const staffDirectoryQuery = useQuery(
    orpc.staff.list.queryOptions({
      input: queryInput,
      placeholderData: keepPreviousData,
    })
  );

  useEffect(() => {
    if (staffDirectoryQuery.isSuccess) {
      lastSuccessfulDataRef.current = staffDirectoryQuery.data;
    }
  }, [staffDirectoryQuery.data, staffDirectoryQuery.isSuccess]);

  const resolvedData =
    staffDirectoryQuery.data ?? lastSuccessfulDataRef.current;
  const controllerState = useMemo<DataGridControlledState<string>>(
    () => ({
      filters: toStaffDirectoryFilters(queryInput.filters),
      pagination: {
        pageIndex: queryInput.page - 1,
        pageSize: queryInput.pageSize,
      },
      sorting: getStaffDirectorySorting(queryInput.sortBy, queryInput.sortDir),
    }),
    [queryInput]
  );

  const handleStateChange = useCallback(
    (
      nextState: DataGridControlledState<string>,
      change: DataGridStateChange
    ) => {
      const [nextSort] = nextState.sorting;
      const nextSearchState = toStaffDirectorySearchState({
        filters: fromStaffDirectoryFilters(nextState.filters),
        page: nextState.pagination.pageIndex + 1,
        pageSize: normalizeStaffDirectoryPageSize(
          nextState.pagination.pageSize
        ),
        sortBy: normalizeStaffDirectorySortField(nextSort?.id),
        sortDir: nextSort?.desc ? "desc" : "asc",
      });
      const encodedSearch = encodeStaffDirectorySearch(nextSearchState);

      if (areSearchValuesEqual(search, encodedSearch)) {
        return;
      }

      void navigate({
        replace: change.history === "replace",
        search: encodedSearch,
      });
    },
    [navigate, search]
  );

  const {
    clearFilters,
    draftFilters,
    hasActiveFilters,
    isFilterCommitPending,
    setFilters,
    table,
  } = useDataGrid<StaffListItem, string>({
    canonicalPage: staffDirectoryQuery.isPlaceholderData
      ? null
      : staffDirectoryQuery.data?.pagination.page,
    columns: staffDirectoryColumns,
    data: resolvedData?.items ?? [],
    getRowId: (row) => row.id,
    isFilterActive: isStaffFilterActive,
    onStateChange: handleStateChange,
    pageCount: resolvedData?.pagination.pageCount ?? 1,
    rowCount: resolvedData?.pagination.total ?? 0,
    state: controllerState,
  });

  const isInitialLoading = staffDirectoryQuery.isPending && !resolvedData;
  const hasRetainedRows =
    !!lastSuccessfulDataRef.current &&
    lastSuccessfulDataRef.current.items.length > 0;
  const errorMessage =
    staffDirectoryQuery.isError && !hasRetainedRows
      ? getErrorMessage(staffDirectoryQuery.error)
      : null;
  const backgroundErrorMessage =
    staffDirectoryQuery.isError && hasRetainedRows
      ? getErrorMessage(staffDirectoryQuery.error)
      : null;

  return {
    backgroundErrorMessage,
    draftFilters,
    errorMessage,
    hasActiveFilters,
    isFilterCommitPending,
    isInitialLoading,
    isUpdating:
      staffDirectoryQuery.isFetching && !!resolvedData && !isInitialLoading,
    onClearFilters: clearFilters,
    onFiltersChange: setFilters,
    onRetry: () => {
      void staffDirectoryQuery.refetch();
    },
    pageSizes: [...STAFF_DIRECTORY_PAGE_SIZES],
    table,
    totalRows: resolvedData?.pagination.total ?? 0,
  };
}
