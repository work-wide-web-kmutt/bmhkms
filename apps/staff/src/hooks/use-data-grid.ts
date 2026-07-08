import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type {
  OnChangeFn,
  PaginationState,
  RowData,
  SortingState,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { areFiltersEqual, getActiveFilters } from "@/lib/data-grid/filters";
import {
  resolvePaginationState,
  resolveSortingState,
} from "@/lib/data-grid/state";
import type {
  DataGridHistoryMode,
  DataGridStateChangeReason,
  UseDataGridOptions,
  UseDataGridResult,
} from "@/lib/data-grid/types";

const DEFAULT_FILTER_DEBOUNCE_MS = 250;

const DEFAULT_HISTORY: Record<DataGridStateChangeReason, DataGridHistoryMode> =
  {
    "canonical-page": "replace",
    "clear-filters": "replace",
    filters: "replace",
    page: "push",
    "page-size": "replace",
    sorting: "replace",
  };

export function useDataGrid<TData extends RowData, TFilterValue = unknown>({
  canonicalPage,
  columns,
  data,
  filterDebounceMs = DEFAULT_FILTER_DEBOUNCE_MS,
  getRowId,
  history,
  isFilterActive,
  onStateChange,
  pageCount,
  rowCount,
  state,
  tableOptions,
}: UseDataGridOptions<TData, TFilterValue>): UseDataGridResult<
  TData,
  TFilterValue
> {
  const [draftFilters, setDraftFilters] = useState(state.filters);
  const [isFilterCommitPending, setIsFilterCommitPending] = useState(false);
  const filterCommitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const historyPolicy = useMemo(
    () => ({ ...DEFAULT_HISTORY, ...history }),
    [history]
  );
  const activeCommittedFilters = useMemo(
    () => getActiveFilters(state.filters, isFilterActive),
    [isFilterActive, state.filters]
  );
  const hasActiveFilters = activeCommittedFilters.length > 0;

  useEffect(() => {
    setDraftFilters(state.filters);
  }, [state.filters]);

  useEffect(
    () => () => {
      if (filterCommitTimeoutRef.current !== null) {
        clearTimeout(filterCommitTimeoutRef.current);
      }
    },
    []
  );

  useEffect(() => {
    if (!canonicalPage || canonicalPage < 1) {
      return;
    }

    const canonicalPageIndex = canonicalPage - 1;
    if (canonicalPageIndex === state.pagination.pageIndex) {
      return;
    }

    onStateChange(
      {
        ...state,
        pagination: {
          ...state.pagination,
          pageIndex: canonicalPageIndex,
        },
      },
      {
        history: historyPolicy["canonical-page"],
        reason: "canonical-page",
      }
    );
  }, [canonicalPage, historyPolicy, onStateChange, state]);

  const handlePaginationChange = useCallback<OnChangeFn<PaginationState>>(
    (updater) => {
      const nextPagination = resolvePaginationState(state.pagination, updater);
      const pageSizeChanged =
        nextPagination.pageSize !== state.pagination.pageSize;

      if (pageSizeChanged) {
        onStateChange(
          {
            ...state,
            pagination: {
              pageIndex: 0,
              pageSize: nextPagination.pageSize,
            },
          },
          {
            history: historyPolicy["page-size"],
            reason: "page-size",
          }
        );
        return;
      }

      if (nextPagination.pageIndex === state.pagination.pageIndex) {
        return;
      }

      onStateChange(
        {
          ...state,
          pagination: nextPagination,
        },
        {
          history: historyPolicy.page,
          reason: "page",
        }
      );
    },
    [historyPolicy, onStateChange, state]
  );

  const handleSortingChange = useCallback<OnChangeFn<SortingState>>(
    (updater) => {
      const nextSorting = resolveSortingState(state.sorting, updater);

      if (JSON.stringify(nextSorting) === JSON.stringify(state.sorting)) {
        return;
      }

      onStateChange(
        {
          ...state,
          pagination: {
            ...state.pagination,
            pageIndex: 0,
          },
          sorting: nextSorting,
        },
        {
          history: historyPolicy.sorting,
          reason: "sorting",
        }
      );
    },
    [historyPolicy, onStateChange, state]
  );

  const setFilters = useCallback(
    (filters: typeof draftFilters) => {
      const nextDraftFilters = filters;
      const nextCommittedFilters = getActiveFilters(filters, isFilterActive);

      setDraftFilters(nextDraftFilters);

      if (filterCommitTimeoutRef.current !== null) {
        clearTimeout(filterCommitTimeoutRef.current);
      }

      if (areFiltersEqual(activeCommittedFilters, nextCommittedFilters)) {
        setIsFilterCommitPending(false);
        return;
      }

      setIsFilterCommitPending(true);
      filterCommitTimeoutRef.current = setTimeout(() => {
        setIsFilterCommitPending(false);
        onStateChange(
          {
            ...state,
            filters: nextCommittedFilters,
            pagination: {
              ...state.pagination,
              pageIndex: 0,
            },
          },
          {
            history: historyPolicy.filters,
            reason: "filters",
          }
        );
      }, filterDebounceMs);
    },
    [
      activeCommittedFilters,
      filterDebounceMs,
      historyPolicy.filters,
      isFilterActive,
      onStateChange,
      state,
    ]
  );

  const clearFilters = useCallback(() => {
    if (filterCommitTimeoutRef.current !== null) {
      clearTimeout(filterCommitTimeoutRef.current);
    }

    setIsFilterCommitPending(false);
    setDraftFilters([]);

    if (state.filters.length === 0) {
      return;
    }

    onStateChange(
      {
        ...state,
        filters: [],
        pagination: {
          ...state.pagination,
          pageIndex: 0,
        },
      },
      {
        history: historyPolicy["clear-filters"],
        reason: "clear-filters",
      }
    );
  }, [historyPolicy, onStateChange, state]);

  const table = useReactTable({
    ...tableOptions,
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingChange,
    pageCount,
    rowCount,
    state: {
      ...tableOptions?.state,
      pagination: state.pagination,
      sorting: state.sorting,
    },
  });

  return {
    clearFilters,
    draftFilters,
    hasActiveFilters,
    isFilterCommitPending,
    setFilters,
    table,
  };
}
