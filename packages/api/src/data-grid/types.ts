export type DataGridSortDirection = "asc" | "desc";

export interface DataGridListFilter<
  TField extends string = string,
  TOperator extends string = string,
> {
  field: TField;
  operator: TOperator;
  values: string[];
}

export interface DataGridListInput<
  TField extends string = string,
  TOperator extends string = string,
  TSortField extends string = string,
  TPageSize extends number = number,
> {
  filters: DataGridListFilter<TField, TOperator>[];
  page: number;
  pageSize: TPageSize;
  sortBy: TSortField;
  sortDir: DataGridSortDirection;
}

export interface DataGridPagination<TPageSize extends number = number> {
  page: number;
  pageCount: number;
  pageSize: TPageSize;
  total: number;
}

export type DataGridResolvedPage<TPageSize extends number = number> =
  DataGridPagination<TPageSize> & {
    offset: number;
  };

export interface DataGridListOutput<TItem, TPageSize extends number = number> {
  items: TItem[];
  pagination: DataGridPagination<TPageSize>;
}

export type DataGridFilterHandler<TFilter, TCondition> = (
  filter: TFilter
) => TCondition | undefined;

export type DataGridFilterHandlerRegistry<
  TFilter extends DataGridListFilter,
  TCondition,
> = Record<string, DataGridFilterHandler<TFilter, TCondition>>;

export interface DataGridSortDefinition<TExpression> {
  expression: TExpression;
}

export type DataGridSortRegistry<
  TSortField extends string,
  TExpression,
> = Record<TSortField, DataGridSortDefinition<TExpression>>;

export interface DataGridListQueryCountArgs<TCondition> {
  where: TCondition | undefined;
}

export interface DataGridListQuerySelectArgs<
  TCondition,
  TOrderByExpression,
  TPageSize extends number,
> {
  limit: TPageSize;
  offset: number;
  orderBy: readonly TOrderByExpression[];
  where: TCondition | undefined;
}

export interface DataGridListQueryConfig<
  TFilter extends DataGridListFilter,
  TSortField extends string,
  TPageSize extends number,
  TCondition,
  TSortExpression,
  TOrderByExpression,
  TItem,
> {
  applySortDirection: (
    expression: TSortExpression,
    direction: DataGridSortDirection
  ) => TOrderByExpression;
  baseCondition?: TCondition;
  combineConditions: (conditions: readonly TCondition[]) => TCondition;
  count: (
    args: DataGridListQueryCountArgs<TCondition>
  ) => Promise<number | undefined>;
  filterHandlers: DataGridFilterHandlerRegistry<TFilter, TCondition>;
  isFilterActive?: (filter: TFilter) => boolean;
  select: (
    args: DataGridListQuerySelectArgs<TCondition, TOrderByExpression, TPageSize>
  ) => Promise<TItem[]>;
  sortRegistry: DataGridSortRegistry<TSortField, TSortExpression>;
  stableTieBreak: TOrderByExpression;
}

export type DataGridListQueryExecutor<
  TFilter extends DataGridListFilter,
  TSortField extends string,
  TPageSize extends number,
  TItem,
> = (
  input: DataGridListInput<
    TFilter["field"],
    TFilter["operator"],
    TSortField,
    TPageSize
  >
) => Promise<DataGridListOutput<TItem, TPageSize>>;
