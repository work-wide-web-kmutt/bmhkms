import type {
  ColumnDef,
  PaginationState,
  RowData,
  SortingState,
  Table,
  TableOptions,
  TableState,
} from "@tanstack/react-table";

import type { Filter } from "@/components/ui/filters";

export type DataGridHistoryMode = "push" | "replace";

export type DataGridStateChangeReason =
  | "page"
  | "page-size"
  | "sorting"
  | "filters"
  | "clear-filters"
  | "canonical-page";

export interface DataGridStateChange {
  history: DataGridHistoryMode;
  reason: DataGridStateChangeReason;
}

export interface DataGridControlledState<TFilterValue = unknown> {
  filters: Filter<TFilterValue>[];
  pagination: PaginationState;
  sorting: SortingState;
}

export interface DataGridFilterController<TFilterValue = unknown> {
  clearFilters: () => void;
  draftFilters: Filter<TFilterValue>[];
  hasActiveFilters: boolean;
  isFilterCommitPending: boolean;
  setFilters: (filters: Filter<TFilterValue>[]) => void;
}

type NativeTableOptions<TData extends RowData> = Omit<
  TableOptions<TData>,
  | "columns"
  | "data"
  | "getCoreRowModel"
  | "getRowId"
  | "manualFiltering"
  | "manualPagination"
  | "manualSorting"
  | "onPaginationChange"
  | "onSortingChange"
  | "pageCount"
  | "rowCount"
  | "state"
>;

type NativeTableState = Omit<TableState, "pagination" | "sorting">;

export interface UseDataGridOptions<
  TData extends RowData,
  TFilterValue = unknown,
> {
  canonicalPage?: number | null;
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  filterDebounceMs?: number;
  getRowId?: TableOptions<TData>["getRowId"];
  isFilterActive?: (filter: Filter<TFilterValue>) => boolean;
  onStateChange: (
    nextState: DataGridControlledState<TFilterValue>,
    change: DataGridStateChange
  ) => void;
  pageCount: number;
  rowCount: number;
  state: DataGridControlledState<TFilterValue>;
  tableOptions?: NativeTableOptions<TData> & {
    state?: Partial<NativeTableState>;
  };
  history?: Partial<Record<DataGridStateChangeReason, DataGridHistoryMode>>;
}

export interface UseDataGridResult<
  TData extends RowData,
  TFilterValue = unknown,
> extends DataGridFilterController<TFilterValue> {
  table: Table<TData>;
}
