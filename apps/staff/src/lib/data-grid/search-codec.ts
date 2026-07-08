import { z } from "zod";

type SortDirection = "asc" | "desc";

type CompactFilterTuple<TField extends string, TOperator extends string> = [
  TField,
  TOperator,
  string[],
];

export interface DataGridDecodedSearch<
  TField extends string,
  TOperator extends string,
  TSortField extends string,
> {
  filters: CompactFilterTuple<TField, TOperator>[];
  page: number;
  pageSize: number;
  sortBy: TSortField;
  sortDir: SortDirection;
}

interface CreateDataGridSearchCodecOptions<
  TField extends string,
  TOperator extends string,
  TSortField extends string,
  TPageSize extends number,
> {
  defaultPage: number;
  defaultPageSize: TPageSize;
  defaultSortBy: TSortField;
  defaultSortDir: SortDirection;
  fields: readonly TField[];
  operators: readonly TOperator[];
  pageSizes: readonly TPageSize[];
  sortFields: readonly TSortField[];
}

interface CompactSearchShape<TField extends string, TOperator extends string> {
  f?: CompactFilterTuple<TField, TOperator>[];
  p?: number;
  s?: string;
  z?: number;
}

function parsePositiveInteger(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return undefined;
  }

  return parsedValue;
}

function parseFilterTuples(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
}

export function createDataGridSearchCodec<
  TField extends string,
  TOperator extends string,
  TSortField extends string,
  TPageSize extends number,
>({
  defaultPage,
  defaultPageSize,
  defaultSortBy,
  defaultSortDir,
  fields,
  operators,
  pageSizes,
  sortFields,
}: CreateDataGridSearchCodecOptions<TField, TOperator, TSortField, TPageSize>) {
  const fieldSchema = z.enum(fields);
  const operatorSchema = z.enum(operators);
  const sortFieldSchema = z.enum(sortFields);
  const filterTupleSchema = z.tuple([
    fieldSchema,
    operatorSchema,
    z.array(z.string()),
  ]);

  const schema = z.object({
    f: z.preprocess(parseFilterTuples, z.array(filterTupleSchema).optional()),
    p: z.preprocess(
      parsePositiveInteger,
      z.number().int().positive().optional()
    ),
    s: z.string().optional(),
    z: z.preprocess(
      parsePositiveInteger,
      z.number().int().positive().optional()
    ),
  });

  function decode(
    search: CompactSearchShape<TField, TOperator>
  ): DataGridDecodedSearch<TField, TOperator, TSortField> {
    const normalizedPage = search.p ?? defaultPage;
    const normalizedPageSize = pageSizes.includes(search.z as TPageSize)
      ? (search.z as TPageSize)
      : defaultPageSize;

    const [rawSortField, rawSortDir] =
      typeof search.s === "string" ? search.s.split(".") : [];
    const sortBy = sortFieldSchema.safeParse(rawSortField).success
      ? (rawSortField as TSortField)
      : defaultSortBy;
    const sortDir =
      rawSortDir === "asc" || rawSortDir === "desc"
        ? rawSortDir
        : defaultSortDir;

    const filters = Array.isArray(search.f)
      ? search.f.filter((tuple) => filterTupleSchema.safeParse(tuple).success)
      : [];

    return {
      filters,
      page: normalizedPage,
      pageSize: normalizedPageSize,
      sortBy,
      sortDir,
    };
  }

  function encode(
    value: DataGridDecodedSearch<TField, TOperator, TSortField>
  ): CompactSearchShape<TField, TOperator> {
    const encoded: CompactSearchShape<TField, TOperator> = {};

    if (value.page !== defaultPage) {
      encoded.p = value.page;
    }

    if (value.pageSize !== defaultPageSize) {
      encoded.z = value.pageSize;
    }

    if (value.sortBy !== defaultSortBy || value.sortDir !== defaultSortDir) {
      encoded.s = `${value.sortBy}.${value.sortDir}`;
    }

    if (value.filters.length > 0) {
      encoded.f = value.filters;
    }

    return encoded;
  }

  return {
    decode,
    encode,
    schema,
  };
}
