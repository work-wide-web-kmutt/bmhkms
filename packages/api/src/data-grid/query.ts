import { isDataGridFilterActive } from "./filters";
import { resolveDataGridPage } from "./pagination";
import type {
  DataGridListFilter,
  DataGridListQueryConfig,
  DataGridListQueryExecutor,
} from "./types";

export function createDataGridListQuery<
  TFilter extends DataGridListFilter,
  TSortField extends string,
  TPageSize extends number,
  TCondition,
  TSortExpression,
  TOrderByExpression,
  TItem,
>(
  config: DataGridListQueryConfig<
    TFilter,
    TSortField,
    TPageSize,
    TCondition,
    TSortExpression,
    TOrderByExpression,
    TItem
  >
): DataGridListQueryExecutor<TFilter, TSortField, TPageSize, TItem> {
  return async (input) => {
    const conditions: TCondition[] = [];

    if (config.baseCondition) {
      conditions.push(config.baseCondition);
    }

    for (const filter of input.filters as TFilter[]) {
      const isActive =
        config.isFilterActive?.(filter) ??
        isDataGridFilterActive(filter, [] as readonly TFilter["operator"][]);

      if (!isActive) {
        continue;
      }

      const handler = config.filterHandlers[filter.field as string];

      if (!handler) {
        continue;
      }

      const condition = handler(filter);

      if (condition) {
        conditions.push(condition);
      }
    }

    const where =
      conditions.length > 0 ? config.combineConditions(conditions) : undefined;
    const total = (await config.count({ where })) ?? 0;
    const pagination = resolveDataGridPage(input.page, input.pageSize, total);
    const primarySort = config.sortRegistry[input.sortBy].expression;
    const orderBy = [
      config.applySortDirection(primarySort, input.sortDir),
      config.stableTieBreak,
    ] as const;
    const items = await config.select({
      limit: input.pageSize,
      offset: pagination.offset,
      orderBy,
      where,
    });

    return {
      items,
      pagination: {
        page: pagination.page,
        pageCount: pagination.pageCount,
        pageSize: pagination.pageSize,
        total: pagination.total,
      },
    };
  };
}
