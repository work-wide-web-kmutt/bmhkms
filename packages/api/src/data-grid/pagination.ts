import type { DataGridResolvedPage } from "./types";

export function resolveDataGridPage<TPageSize extends number>(
  page: number,
  pageSize: TPageSize,
  total: number
): DataGridResolvedPage<TPageSize> {
  const normalizedPage = Math.max(1, page);
  const pageCount = total === 0 ? 1 : Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(normalizedPage, pageCount);

  return {
    offset: (clampedPage - 1) * pageSize,
    page: clampedPage,
    pageCount,
    pageSize,
    total,
  };
}
