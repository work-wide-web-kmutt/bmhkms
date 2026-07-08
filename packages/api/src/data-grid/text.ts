import { and, or, sql } from "drizzle-orm";
import type { SQL, SQLWrapper } from "drizzle-orm";

import {
  SQL_LIKE_ESCAPE,
  buildCaseInsensitiveFilterPattern,
  normalizeDataGridFilterValues,
} from "./filters";
import type { DataGridTextFilterOperator } from "./filters";
import type { DataGridFilterHandler, DataGridListFilter } from "./types";

type TextFilter = DataGridListFilter<string, DataGridTextFilterOperator>;

export function createTextFilterHandler<TFilter extends TextFilter>({
  column,
}: {
  column: SQLWrapper;
}): DataGridFilterHandler<TFilter, SQL<boolean>> {
  return (filter) => {
    const normalizedValues = normalizeDataGridFilterValues(filter.values);

    if (filter.operator === "empty") {
      return sql<boolean>`coalesce(btrim(${column}), '') = ''`;
    }

    if (filter.operator === "not_empty") {
      return sql<boolean>`coalesce(btrim(${column}), '') <> ''`;
    }

    if (normalizedValues.length === 0) {
      return;
    }

    if (filter.operator === "contains") {
      return or(
        ...normalizedValues.map((value) =>
          buildIlikeCondition(
            column,
            buildCaseInsensitiveFilterPattern("contains", value)
          )
        )
      ) as SQL<boolean>;
    }

    if (filter.operator === "not_contains") {
      return and(
        ...normalizedValues.map((value) => {
          const condition = buildIlikeCondition(
            column,
            buildCaseInsensitiveFilterPattern("contains", value)
          );

          return sql<boolean>`not (${condition})`;
        })
      ) as SQL<boolean>;
    }

    if (filter.operator === "starts_with") {
      return or(
        ...normalizedValues.map((value) =>
          buildIlikeCondition(
            column,
            buildCaseInsensitiveFilterPattern("starts_with", value)
          )
        )
      ) as SQL<boolean>;
    }

    if (filter.operator === "ends_with") {
      return or(
        ...normalizedValues.map((value) =>
          buildIlikeCondition(
            column,
            buildCaseInsensitiveFilterPattern("ends_with", value)
          )
        )
      ) as SQL<boolean>;
    }

    const [exactValue] = normalizedValues;

    if (!exactValue) {
      return;
    }

    return sql<boolean>`
      lower(${buildTrimmedTextValue(column)}) = ${exactValue.toLowerCase()}
    `;
  };
}

function buildTrimmedTextValue(column: SQLWrapper) {
  return sql<string>`btrim(coalesce(${column}, ''))`;
}

function buildIlikeCondition(column: SQLWrapper, pattern: string) {
  const trimmedValue = buildTrimmedTextValue(column);

  return sql<boolean>`
    ${trimmedValue} ilike ${pattern} escape ${SQL_LIKE_ESCAPE}
  `;
}
