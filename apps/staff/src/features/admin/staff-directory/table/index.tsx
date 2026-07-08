import { orpc } from "@bmhkms/client/orpc";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import {
  functionalUpdate,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  OnChangeFn,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { FunnelXIcon, ListFilterIcon, MailIcon, UserIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataGrid, DataGridContainer } from "@/components/ui/data-grid";
import { DataGridPagination } from "@/components/ui/data-grid/pagination";
import { DataGridScrollArea } from "@/components/ui/data-grid/scroll-area";
import { DataGridTable } from "@/components/ui/data-grid/table";
import { Filters } from "@/components/ui/filters";
import type { Filter, FilterFieldConfig } from "@/components/ui/filters";

import { staffDirectoryColumns } from "./columns";
import {
  fromSearchFilters,
  STAFF_DIRECTORY_PAGE_SIZES,
  toSearchFilters,
} from "./search-params";

const staffRouteApi = getRouteApi("/_protected/admin/staff");
const FILTER_SYNC_DEBOUNCE_MS = 250;

function getActiveFilters<T>(filters: Filter<T>[]): Filter<T>[] {
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

function StaffDirectoryTable() {
  const navigate = staffRouteApi.useNavigate();
  const search = staffRouteApi.useSearch();
  const [draftFilters, setDraftFilters] = useState<Filter<string>[] | null>(
    null
  );
  const filterSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const fields = useMemo<FilterFieldConfig<string>[]>(
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

  const committedFilters = useMemo(
    () => fromSearchFilters(search.filters),
    [search.filters]
  );
  const displayFilters = draftFilters ?? committedFilters;
  const queryInput = useMemo(
    () => ({
      filters: search.filters,
      page: search.page,
      pageSize: search.pageSize,
      sortBy: search.sortBy,
      sortDir: search.sortDir,
    }),
    [
      search.filters,
      search.page,
      search.pageSize,
      search.sortBy,
      search.sortDir,
    ]
  );

  const staffDirectoryQuery = useQuery(
    orpc.staff.list.queryOptions({
      input: queryInput,
      placeholderData: keepPreviousData,
    })
  );

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: search.page - 1,
      pageSize: search.pageSize,
    }),
    [search.page, search.pageSize]
  );

  const sorting = useMemo<SortingState>(
    () => [{ desc: search.sortDir === "desc", id: search.sortBy }],
    [search.sortBy, search.sortDir]
  );

  useEffect(
    () => () => {
      if (filterSyncTimeoutRef.current !== null) {
        clearTimeout(filterSyncTimeoutRef.current);
      }
    },
    []
  );

  useEffect(() => {
    setDraftFilters(null);
  }, [search.filters]);

  const handleFiltersChange = useCallback(
    (newFilters: Filter<string>[]) => {
      const nextActiveFilters = getActiveFilters(newFilters);
      const nextSearchFilters = toSearchFilters(nextActiveFilters);
      const previousSerialized = JSON.stringify(search.filters);
      const nextSerialized = JSON.stringify(nextSearchFilters);

      setDraftFilters(newFilters);

      if (filterSyncTimeoutRef.current !== null) {
        clearTimeout(filterSyncTimeoutRef.current);
      }

      if (previousSerialized === nextSerialized) {
        return;
      }

      filterSyncTimeoutRef.current = setTimeout(() => {
        void navigate({
          replace: true,
          search: (previousSearch) => ({
            ...previousSearch,
            filters: nextSearchFilters,
            page: 1,
          }),
        });
      }, FILTER_SYNC_DEBOUNCE_MS);
    },
    [navigate, search.filters]
  );

  const handlePaginationChange = useCallback<OnChangeFn<PaginationState>>(
    (updater) => {
      const nextPagination = functionalUpdate(updater, pagination);
      const pageSizeChanged = nextPagination.pageSize !== pagination.pageSize;

      if (pageSizeChanged) {
        void navigate({
          replace: true,
          search: (previousSearch) => ({
            ...previousSearch,
            page: 1,
            pageSize: nextPagination.pageSize,
          }),
        });
        return;
      }

      if (nextPagination.pageIndex === pagination.pageIndex) {
        return;
      }

      void navigate({
        search: (previousSearch) => ({
          ...previousSearch,
          page: nextPagination.pageIndex + 1,
        }),
      });
    },
    [navigate, pagination]
  );

  const handleSortingChange = useCallback<OnChangeFn<SortingState>>(
    (updater) => {
      const nextSorting = functionalUpdate(updater, sorting);
      const [nextSort] = nextSorting;
      const nextSortBy = nextSort?.id === "email" ? "email" : "name";
      const nextSortDir = nextSort?.desc ? "desc" : "asc";

      if (nextSortBy === search.sortBy && nextSortDir === search.sortDir) {
        return;
      }

      void navigate({
        replace: true,
        search: (previousSearch) => ({
          ...previousSearch,
          page: 1,
          sortBy: nextSortBy,
          sortDir: nextSortDir,
        }),
      });
    },
    [navigate, search.sortBy, search.sortDir, sorting]
  );

  useEffect(() => {
    const canonicalPage = staffDirectoryQuery.data?.pagination.page;

    if (!canonicalPage || canonicalPage === search.page) {
      return;
    }

    void navigate({
      replace: true,
      search: (previousSearch) => ({
        ...previousSearch,
        page: canonicalPage,
      }),
    });
  }, [navigate, search.page, staffDirectoryQuery.data?.pagination.page]);

  const table = useReactTable({
    columns: staffDirectoryColumns,
    data: staffDirectoryQuery.data?.items ?? [],
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    manualPagination: true,
    manualSorting: true,
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingChange,
    pageCount: staffDirectoryQuery.data?.pagination.pageCount ?? 1,
    state: {
      pagination,
      sorting,
    },
  });

  return (
    <DataGrid
      isLoading={staffDirectoryQuery.isLoading}
      recordCount={staffDirectoryQuery.data?.pagination.total ?? 0}
      table={table}
    >
      <div className="w-full space-y-3">
        <div className="flex items-start gap-2.5">
          <div className="flex-1">
            <Filters<string>
              fields={fields}
              filters={displayFilters}
              onChange={handleFiltersChange}
              size="sm"
              trigger={
                <Button size="icon-sm" variant="outline">
                  <ListFilterIcon />
                </Button>
              }
            />
          </div>
          {displayFilters.length > 0 && (
            <Button
              onClick={() => {
                if (filterSyncTimeoutRef.current !== null) {
                  clearTimeout(filterSyncTimeoutRef.current);
                }

                setDraftFilters(null);
                void navigate({
                  replace: true,
                  search: (previousSearch) => ({
                    ...previousSearch,
                    filters: [],
                    page: 1,
                  }),
                });
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
        <DataGridPagination sizes={[...STAFF_DIRECTORY_PAGE_SIZES]} />
      </div>
    </DataGrid>
  );
}

export { StaffDirectoryTable };
