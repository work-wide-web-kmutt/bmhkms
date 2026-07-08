import { z } from "zod";

import type {
  DataGridListFilter,
  DataGridListInput,
  DataGridListOutput,
  DataGridPagination,
  DataGridSortDirection,
} from "./types";

export function createDataGridListSchemas<
  TPageSize extends number,
  TField extends string,
  TOperator extends string,
  TSortField extends string,
  TItemSchema extends z.ZodType,
>({
  allowedPageSizes,
  defaultPage,
  defaultPageSize,
  defaultSortBy,
  defaultSortDir,
  filterFields,
  filterOperators,
  itemSchema,
  maxFilterValueLength,
  maxFilterValues,
  maxFilters,
  sortFields,
}: {
  allowedPageSizes: readonly [TPageSize, ...TPageSize[]];
  defaultPage: number;
  defaultPageSize: TPageSize;
  defaultSortBy: TSortField;
  defaultSortDir: DataGridSortDirection;
  filterFields: readonly [TField, ...TField[]];
  filterOperators: readonly [TOperator, ...TOperator[]];
  itemSchema: TItemSchema;
  maxFilterValueLength: number;
  maxFilterValues: number;
  maxFilters: number;
  sortFields: readonly [TSortField, ...TSortField[]];
}) {
  assertNonEmptyValues("allowedPageSizes", allowedPageSizes);
  assertNonEmptyValues("filterFields", filterFields);
  assertNonEmptyValues("filterOperators", filterOperators);
  assertNonEmptyValues("sortFields", sortFields);

  const pageSizeSchema = createNumberLiteralSchema(allowedPageSizes);
  const filterSchema = z.object({
    field: z.enum(filterFields),
    operator: z.enum(filterOperators),
    values: z
      .array(z.string().trim().max(maxFilterValueLength))
      .max(maxFilterValues)
      .default([]),
  });
  const inputSchema = z.object({
    filters: z.array(filterSchema).max(maxFilters).default([]),
    page: z.number().int().min(1).default(defaultPage),
    pageSize: pageSizeSchema.default(defaultPageSize),
    sortBy: z.enum(sortFields).default(defaultSortBy),
    sortDir: z.enum(["asc", "desc"]).default(defaultSortDir),
  });
  const paginationSchema = z.object({
    page: z.number().int().min(1),
    pageCount: z.number().int().min(1),
    pageSize: pageSizeSchema,
    total: z.number().int().min(0),
  });
  const outputSchema = z.object({
    items: z.array(itemSchema),
    pagination: paginationSchema,
  });

  return {
    filterSchema,
    inputSchema,
    outputSchema,
    pageSizeSchema,
    paginationSchema,
  } as {
    filterSchema: z.ZodType<DataGridListFilter<TField, TOperator>>;
    inputSchema: z.ZodType<
      DataGridListInput<TField, TOperator, TSortField, TPageSize>
    >;
    outputSchema: z.ZodType<
      DataGridListOutput<z.infer<TItemSchema>, TPageSize>
    >;
    pageSizeSchema: z.ZodType<TPageSize>;
    paginationSchema: z.ZodType<DataGridPagination<TPageSize>>;
  };
}

function assertNonEmptyValues<T>(
  name: string,
  values: readonly T[]
): asserts values is readonly [T, ...T[]] {
  if (values.length === 0) {
    throw new Error(`${name} must contain at least one value`);
  }
}

function createNumberLiteralSchema<TPageSize extends number>(
  values: readonly [TPageSize, ...TPageSize[]]
) {
  if (values.length === 1) {
    return z.literal(values[0]);
  }

  const [firstValue, secondValue, ...otherValues] = values;

  return z.union([
    z.literal(firstValue),
    z.literal(secondValue),
    ...otherValues.map((value) => z.literal(value)),
  ]);
}
